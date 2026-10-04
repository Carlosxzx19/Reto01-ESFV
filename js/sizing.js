/* ═══════════════════════════════════════════════
   sizing.js — Core Photovoltaic Sizing Engine (Reto 02)
   Calculates kWp, strings configuration, thermal voltages,
   currents (NTC 2050), area verification and generation.
   ═══════════════════════════════════════════════ */

const PV_SIZING = {

    /**
     * RF-17: Solar window coincidence calculation (06h - 18h)
     * @param {Array<number>} profile - 24-hour demand profile in W
     * @param {number} dayStart - start of solar window (default 6)
     * @param {number} dayEnd - end of solar window (default 18)
     */
    calcSolarWindowCoincidence(profile, dayStart = 6, dayEnd = 18) {
        let insideEnergyWh = 0;
        let outsideEnergyWh = 0;

        profile.forEach((power, h) => {
            const isInside = (dayStart < dayEnd)
                ? (h >= dayStart && h < dayEnd)
                : (h >= dayStart || h < dayEnd);

            if (isInside) {
                insideEnergyWh += power;
            } else {
                outsideEnergyWh += power;
            }
        });

        const insideKwh = insideEnergyWh / 1000;
        const outsideKwh = outsideEnergyWh / 1000;
        const totalKwh = insideKwh + outsideKwh;
        const insidePercent = totalKwh > 0 ? (insideKwh / totalKwh) * 100 : 0;
        const outsidePercent = totalKwh > 0 ? (outsideKwh / totalKwh) * 100 : 0;

        return {
            insideKwh: Math.round(insideKwh * 1000) / 1000,
            outsideKwh: Math.round(outsideKwh * 1000) / 1000,
            totalKwh: Math.round(totalKwh * 1000) / 1000,
            insidePercent: Math.round(insidePercent * 10) / 10,
            outsidePercent: Math.round(outsidePercent * 10) / 10
        };
    },

    /**
     * RF-18: Calculate Peak Power (kWp)
     * Ppico = Ed / (HSP * PR)
     */
    calcPeakPower(edKwh, hsp, pr) {
        if (!hsp || hsp <= 0 || !pr || pr <= 0) return 0;
        return edKwh / (hsp * pr);
    },

    /**
     * Temperature of cell in operation using NOCT model
     * Tc = Ta + ((NOCT - 20) / 800) * G  (with G = 800 W/m² assumed for real operating conditions)
     * For G = 800 W/m², this simplifies to: Tc = Ta + (NOCT - 20)
     */
    calcOperatingCellTemp(ambientTemp, noct = 45, irradiance = 800) {
        return ambientTemp + ((noct - 20) / 800) * irradiance;
    },

    /**
     * Voc corrected by minimum temperature
     * Voc_max = [Voc_stc + (Tmin - 25) * beta_Voc] * Ns
     * Voc_mod(Tmin) = Voc_stc + (Tmin - 25) * beta_Voc
     * where beta_Voc (V/°C) = Voc_stc * (tempCoefBetaPercent / 100)
     */
    calcVocAtTemp(vocStc, tempCoefBetaPercent, targetTemp) {
        const deltaT = targetTemp - 25;
        const factor = 1 + (tempCoefBetaPercent / 100) * deltaT;
        return vocStc * factor;
    },

    /**
     * Vmp corrected by real operating cell temperature
     * Vmp_operacion = Vmp_stc + [deltaT * Coeficiente] * Ns
     * where deltaT = Tc - 25 (°C)
     * and Coeficiente (V/°C) = Vmp_stc * (tempCoefBetaPercent / 100)
     * and Ns is the number of modules in series per string
     */
    calcVmpAtTemp(vmpStc, tempCoefBetaPercent, targetTemp) {
        const deltaT = targetTemp - 25;
        const factor = 1 + (tempCoefBetaPercent / 100) * deltaT;
        return vmpStc * factor;
    },

    /**
     * Optimize string configuration (Ns and Np) respecting Vmax
     * @param {number} nModTotal - minimum number of modules required
     * @param {number} nsMax - max modules per string
     */
    optimizeStrings(nModTotal, nsMax) {
        if (nModTotal <= 0) return { ns: 0, np: 0, totalModules: 0 };

        // If all fit in a single string
        if (nModTotal <= nsMax) {
            return {
                ns: nModTotal,
                np: 1,
                totalModules: nModTotal
            };
        }

        // Search for best balanced configuration (equal strings)
        let bestNs = nsMax;
        let bestNp = Math.ceil(nModTotal / nsMax);
        let bestTotal = bestNs * bestNp;

        for (let np = 2; np <= 10; np++) {
            const ns = Math.ceil(nModTotal / np);
            if (ns <= nsMax) {
                const total = ns * np;
                if (total >= nModTotal && (total < bestTotal || (total === bestTotal && ns > bestNs))) {
                    bestNs = ns;
                    bestNp = np;
                    bestTotal = total;
                }
            }
        }

        return {
            ns: bestNs,
            np: bestNp,
            totalModules: bestTotal
        };
    },

    /**
     * Full sizing calculation for a specific module model
     */
    sizeForModule(module, options) {
        const {
            edKwh,
            hsp,
            pr,
            tmin = 20,
            tambOp = 32,
            vmaxSystem = 600,
            availableArea = 20
        } = options;

        // 1. Required kWp
        const peakPowerKwp = this.calcPeakPower(edKwh, hsp, pr);
        const peakPowerW = peakPowerKwp * 1000;

        // 2. Initial module count needed
        const rawModCount = Math.ceil(peakPowerW / module.pmax);

        // 3. Voc at Tmin & maximum series modules
        const vocTmin = this.calcVocAtTemp(module.voc, module.tempCoefVoc, tmin);
        const nsMax = Math.floor(vmaxSystem / vocTmin);

        // 4. Config strings (Ns and Np)
        const stringConfig = this.optimizeStrings(rawModCount, nsMax);
        const ns = stringConfig.ns;
        const np = stringConfig.np;
        const finalModCount = stringConfig.totalModules;

        // 5. Installed capacity & excedent/deficit
        const installedPowerW = finalModCount * module.pmax;
        const installedPowerKwp = installedPowerW / 1000;
        const excedentW = installedPowerW - peakPowerW;
        const excedentPercent = peakPowerW > 0 ? (excedentW / peakPowerW) * 100 : 0;

        // 6. Cell operating temperature with G = 800 W/m² in real operating conditions
        const tCellOp = this.calcOperatingCellTemp(tambOp, module.noct || 45, 800);
        const deltaTOp = tCellOp - 25;

        // 7. Voltages
        const vocGeneratorTmin = ns * vocTmin;
        const vmpModOp = this.calcVmpAtTemp(module.vmp, module.tempCoefVoc, tCellOp);
        const vmpGeneratorOp = ns * vmpModOp;

        // 8. Currents (NTC 2050 art. 690-8)
        const iscGenerator = np * module.isc;
        const idesign = 1.25 * 1.25 * iscGenerator; // Factor 1.5625
        const impGenerator = np * module.imp;

        // 9. Area
        const totalArea = finalModCount * module.area;
        const fitsArea = totalArea <= availableArea;
        const areaMargin = availableArea - totalArea;

        // 10. Estimated daily generation
        const estimatedDailyKwh = installedPowerKwp * hsp * pr;

        return {
            module,
            peakPowerKwp: Math.round(peakPowerKwp * 100) / 100,
            rawModCount,
            finalModCount,
            ns,
            np,
            nsMax,
            installedPowerKwp: Math.round(installedPowerKwp * 100) / 100,
            installedPowerW,
            excedentW: Math.round(excedentW),
            excedentPercent: Math.round(excedentPercent * 10) / 10,
            vocTmin: Math.round(vocTmin * 100) / 100,
            vocGeneratorTmin: Math.round(vocGeneratorTmin * 10) / 10,
            tCellOp: Math.round(tCellOp * 10) / 10,
            deltaTOp: Math.round(deltaTOp * 10) / 10,
            vmpModOp: Math.round(vmpModOp * 100) / 100,
            vmpGeneratorOp: Math.round(vmpGeneratorOp * 10) / 10,
            iscGenerator: Math.round(iscGenerator * 100) / 100,
            idesign: Math.round(idesign * 10) / 10,
            impGenerator: Math.round(impGenerator * 100) / 100,
            totalArea: Math.round(totalArea * 100) / 100,
            availableArea,
            fitsArea,
            areaMargin: Math.round(areaMargin * 100) / 100,
            estimatedDailyKwh: Math.round(estimatedDailyKwh * 100) / 100
        };
    },

    /**
     * Compute sizing for all available modules in catalog
     */
    evaluateAllModules(modules, options) {
        return modules.map(mod => this.sizeForModule(mod, options));
    },

    /**
     * Monthly energy projection for a chosen installed kWp and 12-month HSP array
     */
    calcMonthlyProjections(installedPowerKwp, monthlyHsp, pr, daysPerMonth = 30) {
        if (!monthlyHsp || monthlyHsp.length !== 12) {
            monthlyHsp = new Array(12).fill(5.5);
        }

        return monthlyHsp.map(hsp => {
            const dailyKwh = installedPowerKwp * hsp * pr;
            const monthlyKwh = dailyKwh * daysPerMonth;
            return {
                hsp: Math.round(hsp * 100) / 100,
                dailyKwh: Math.round(dailyKwh * 100) / 100,
                monthlyKwh: Math.round(monthlyKwh * 10) / 10
            };
        });
    }
};

window.PV_SIZING = PV_SIZING;
