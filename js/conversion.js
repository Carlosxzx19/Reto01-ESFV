/* ═══════════════════════════════════════════════
   conversion.js — Engineering Calculation Engine for Reto 03
   Tensiones, Corrientes, Banco de Baterías, DC/AC, Balance y Reconfiguración
   ═══════════════════════════════════════════════ */

const CONVERSION_CALC = {
    /**
     * Extrae y normaliza los parámetros de entrada requeridos para el Reto 03
     * provenientes del Reto 01, Reto 02 y el estado de conversión.
     */
    getInputs() {
        const state = window.APP?.state || {};
        const config = state.config || {};
        const conv = state.conversion || {};
        const sizing = state.sizing || {};
        const selectedRes = sizing.selectedResult || null;

        // Heredados del Reto 01
        const profile = typeof calcHourlyProfile === 'function' ? calcHourlyProfile() : new Array(24).fill(0);
        const ed = typeof calcDailyEnergy === 'function' ? calcDailyEnergy(profile) : 0; // kWh/día
        const pmax = typeof calcMaxDemand === 'function' ? calcMaxDemand(profile) : 0;   // W
        const hpmax = profile.indexOf(pmax);

        // Ventana solar 06-18h
        let insideWindowKWh = 0;
        for (let h = 6; h < 18; h++) {
            insideWindowKWh += (profile[h] || 0) / 1000;
        }
        const outsideWindowKWh = Math.max(0, ed - insideWindowKWh);

        // Heredados del Reto 02
        const mod = selectedRes?.module || (window.MODULES_DB ? MODULES_DB.getModule('panel-550w') : null) || {
            pmax: 550, voc: 49.5, isc: 14.0, vmp: 41.5, imp: 13.3, tempCoefVoc: -0.27, noct: 45, area: 2.58
        };
        const totalModulesDefault = selectedRes?.modulesCount || 4;
        const nsDefault = selectedRes?.ns || totalModulesDefault;
        const npDefault = selectedRes?.np || 1;

        // Comprobación de reconfiguración manual / activa
        let ns = conv.customStringNs && conv.customStringNs > 0 ? conv.customStringNs : nsDefault;
        const totalModules = conv.balanceAdjusted && conv.additionalModules
            ? totalModulesDefault + conv.additionalModules
            : totalModulesDefault;
        
        // Ajustar Np coherente con divisibilidad
        let np = Math.max(1, Math.round(totalModules / ns));
        if (ns * np !== totalModules) {
            // Si la combinación no es exacta, recalcular Ns y Np al divisor más cercano
            ns = nsDefault;
            np = Math.max(1, Math.round(totalModules / ns));
        }

        const tmin = Number.isFinite(sizing.tmin) ? sizing.tmin : 20; // °C
        const tambOp = Number.isFinite(sizing.tambOp) ? sizing.tambOp : 32; // °C
        const tcell = Number.isFinite(selectedRes?.tcell) ? selectedRes.tcell : (tambOp + ((mod.noct || 45) - 20) * 1.25); // °C

        const solarRes = sizing.solarResource || {};
        const hspAnnual = Number.isFinite(solarRes.annual) && solarRes.annual > 0 ? solarRes.annual : 5.8;
        const hspCritical = Number.isFinite(solarRes.critical) && solarRes.critical > 0 ? solarRes.critical : 5.2;
        const pr = Number.isFinite(sizing.pr) && sizing.pr > 0 ? sizing.pr : 0.70;

        const ppkReq = selectedRes?.ppk || (hspAnnual * pr > 0 ? ed / (hspAnnual * pr) : 0);
        const ppkInst = (totalModules * mod.pmax) / 1000; // kWp

        // Identificar cargas de bombas / motores
        const loads = state.loads || [];
        let pumpTotalW = 0;
        loads.forEach(l => {
            const desc = (l.description || '').toLowerCase();
            if (desc.includes('bomba') || desc.includes('motor') || desc.includes('compresor') || desc.includes('pump')) {
                pumpTotalW += (Number(l.quantity) || 1) * (Number(l.power) || 0) * (Number(l.duty) || 1);
            }
        });

        return {
            edKWh: ed,
            edWh: ed * 1000,
            profile,
            pmax,
            hpmax,
            insideWindowKWh,
            outsideWindowKWh,
            module: mod,
            ns,
            np,
            totalModules,
            tmin,
            tambOp,
            tcell,
            hspAnnual,
            hspCritical,
            pr,
            ppkReqKW: ppkReq,
            ppkInstKW: ppkInst,
            ppkInstW: ppkInst * 1000,
            pumpTotalW,
            systemType: state.project?.systemType || 'off-grid',
            // Conversión
            branch: conv.branch || 'storage',
            inverterEfficiency: Number.isFinite(conv.inverterEfficiency) ? conv.inverterEfficiency : 0.90,
            busVoltage: Number(conv.busVoltage) || 48,
            autonomyDays: Number(conv.autonomyDays) || 2.0,
            dodDesign: Number.isFinite(conv.dodDesign) ? conv.dodDesign : 0.50,
            tempFactor: Number.isFinite(conv.tempFactor) ? conv.tempFactor : 1.0,
            dcacMin: Number(conv.dcacMin) || 1.0,
            dcacMax: Number(conv.dcacMax) || 1.3,
            pumpStartFactor: Number(conv.pumpStartFactor) || 3.0,
            selectedBatteryId: conv.selectedBatteryId || 'AGM',
            selectedControllerId: conv.selectedControllerId || 'CTRL-A',
            selectedInverterId: conv.selectedInverterId || 'INV-B'
        };
    },

    /**
     * Calcula las tensiones y corrientes corregidas térmicamente para el generador.
     */
    calculateArrayThermal(inputs) {
        const m = inputs.module;
        const beta = Math.abs(m.tempCoefVoc || 0.27) / 100; // Por unidad /°C

        // Voc en frío (a Tmin)
        const vocColdMod = m.voc * (1 + beta * (25 - inputs.tmin));
        const vocColdArray = inputs.ns * vocColdMod;

        // Vmp en caliente (a Tcelda)
        const vmpHotMod = m.vmp * (1 - beta * (inputs.tcell - 25));
        const vmpHotArray = inputs.ns * vmpHotMod;

        // Vmp en frío (a Tmin)
        const vmpColdMod = m.vmp * (1 + beta * (25 - inputs.tmin));
        const vmpColdArray = inputs.ns * vmpColdMod;

        // Corrientes del arreglo
        const iscArray = inputs.np * m.isc;
        const impArray = inputs.np * m.imp;

        // Corriente hacia el banco (RF-29: Ppico / Vnominal sin 1.25)
        const iSalidaBanco = inputs.busVoltage > 0 ? inputs.ppkInstW / inputs.busVoltage : 0;

        // Corrientes de diseño para conductores y protecciones (NTC 2050 art. 690-8)
        const iDisenoSalida = 1.25 * iSalidaBanco;
        const iDisenoEntrada = 1.25 * 1.25 * iscArray; // 1.5625 * Isc

        return {
            beta,
            vocColdMod,
            vocColdArray,
            vmpHotMod,
            vmpHotArray,
            vmpColdMod,
            vmpColdArray,
            iscArray,
            impArray,
            iSalidaBanco,
            iDisenoSalida,
            iDisenoEntrada
        };
    },

    /**
     * Encuentra posibles reconfiguraciones de cadenas (Ns x Np) que cumplan con la tensión de un equipo.
     */
    findAlternativeStrings(totalModules, vocColdMod, maxVoc, vmpHotMod, minVmp) {
        const alternatives = [];
        for (let s = 1; s <= totalModules; s++) {
            if (totalModules % s === 0) {
                const p = totalModules / s;
                const vocArr = s * vocColdMod;
                const vmpArr = s * vmpHotMod;
                if (vocArr <= maxVoc && vmpArr >= minVmp) {
                    alternatives.push({ ns: s, np: p, vocCold: vocArr, vmpHot: vmpArr });
                }
            }
        }
        return alternatives;
    },

    /**
     * Evaluación exhaustiva de cada regulador MPPT e inversor híbrido del catálogo para almacenamiento (RF-28, RF-29, RF-31).
     * Incluye reguladores de referencia, reguladores comerciales e inversores híbridos (INV-1, INV-2, INV-3).
     */
    evaluateControllers(inputs, thermal) {
        const storageDevices = window.CONVERSION_DB ? CONVERSION_DB.getStorageDevices() : [];
        const results = [];

        storageDevices.forEach(dev => {
            const isHybrid = !!(dev.isHybrid || dev.type === 'hybrid');
            const maxVoc = dev.maxPVVoc;
            const nsMax = Math.floor(maxVoc / thermal.vocColdMod);
            const vmpMinRequired = Math.max(dev.minPVVmp || dev.mpptMin || 0, inputs.busVoltage + 5);

            // Verificaciones
            const vocOk = thermal.vocColdArray <= maxVoc;
            const vmpHotOk = thermal.vmpHotArray >= vmpMinRequired;
            const maxCharge = dev.maxChargeA || 60;
            const chargeCurrentOk = thermal.iSalidaBanco <= maxCharge;
            const maxPVInput = dev.maxPVInputA || dev.maxIscA || 50;
            const inputIscOk = thermal.iscArray <= maxPVInput;

            // Compatibilidad de bus DC para inversores híbridos
            let busVoltageOk = true;
            let busVoltageMsg = '';
            if (isHybrid && dev.busVoltage) {
                if (dev.busVoltage !== inputs.busVoltage) {
                    busVoltageOk = false;
                    busVoltageMsg = `Inversor híbrido requiere bus DC de ${dev.busVoltage}V (sistema actual en ${inputs.busVoltage}V)`;
                }
            }

            let verdict = 'cumple'; // 'cumple' | 'alerta' | 'no_cumple'
            const failureReasons = [];

            if (!busVoltageOk) {
                verdict = 'no_cumple';
                failureReasons.push(busVoltageMsg);
            }
            if (!vocOk) {
                verdict = 'no_cumple';
                failureReasons.push(`Voc frío (${thermal.vocColdArray.toFixed(1)} V) supera el máx. (${maxVoc} V)`);
            }
            if (!vmpHotOk) {
                verdict = 'no_cumple';
                failureReasons.push(`Vmp caliente (${thermal.vmpHotArray.toFixed(1)} V) inferior al arranque mín. (${vmpMinRequired.toFixed(1)} V)`);
            }
            if (!chargeCurrentOk) {
                verdict = 'no_cumple';
                failureReasons.push(`Corriente salida hacia banco (${thermal.iSalidaBanco.toFixed(1)} A) excede límite (${maxCharge} A)`);
            }
            if (!inputIscOk) {
                if (verdict !== 'no_cumple') verdict = 'alerta';
                failureReasons.push(`Isc entrada (${thermal.iscArray.toFixed(1)} A) excede máx. admitido (${maxPVInput} A)`);
            }

            // Propuesta de reconfiguración automática si no cumple por Voc o Vmp
            let proposedConfig = null;
            if (!vocOk || !vmpHotOk) {
                const alts = CONVERSION_CALC.findAlternativeStrings(
                    inputs.totalModules,
                    thermal.vocColdMod,
                    maxVoc,
                    thermal.vmpHotMod,
                    vmpMinRequired
                );
                if (alts.length > 0) {
                    proposedConfig = alts[alts.length - 1]; // Mayor Ns posible dentro del límite
                }
            }

            results.push({
                device: dev,
                isHybrid,
                deviceCategory: dev.deviceCategory || (isHybrid ? 'Inversor Híbrido' : 'Regulador MPPT'),
                nsMax,
                vmpMinRequired,
                vocOk,
                vmpHotOk,
                chargeCurrentOk,
                inputIscOk,
                busVoltageOk,
                verdict,
                failureReasons,
                proposedConfig
            });
        });

        return results;
    },

    /**
     * Evaluación de cada inversor del catálogo para la rama sin almacenamiento (RF-28, RF-29, RF-30, RF-31).
     */
    evaluateInverters(inputs, thermal) {
        const inverters = window.CONVERSION_DB ? CONVERSION_DB.getInverters() : [];
        const results = [];

        inverters.forEach(inv => {
            const maxVoc = inv.maxPVVoc;
            const nsMax = Math.floor(maxVoc / thermal.vocColdMod);

            const vocOk = thermal.vocColdArray <= maxVoc;
            const vmpMinOk = thermal.vmpHotArray >= inv.mpptMin;
            const vmpMaxOk = thermal.vmpColdArray <= inv.mpptMax;
            const impOk = thermal.impArray <= inv.maxImpA;
            const iscOk = thermal.iscArray <= inv.maxIscA;

            // Relación DC/AC
            const dcacRatio = inv.pac > 0 ? (inputs.ppkInstW / inv.pac) : 0;
            let dcacVerdict = 'ok'; // 'ok' | 'clipping' | 'oversized'
            if (dcacRatio > inputs.dcacMax) dcacVerdict = 'clipping';
            else if (dcacRatio < inputs.dcacMin) dcacVerdict = 'oversized';

            let verdict = 'cumple';
            const failureReasons = [];

            if (!vocOk) {
                verdict = 'no_cumple';
                failureReasons.push(`Voc frío (${thermal.vocColdArray.toFixed(1)} V) supera límite (${maxVoc} V)`);
            }
            if (!vmpMinOk) {
                verdict = 'no_cumple';
                failureReasons.push(`Vmp caliente (${thermal.vmpHotArray.toFixed(1)} V) < mín. MPPT (${inv.mpptMin} V)`);
            }
            if (!vmpMaxOk) {
                verdict = 'no_cumple';
                failureReasons.push(`Vmp frío (${thermal.vmpColdArray.toFixed(1)} V) > máx. MPPT (${inv.mpptMax} V)`);
            }
            if (!impOk || !iscOk) {
                if (verdict !== 'no_cumple') verdict = 'alerta';
                failureReasons.push(`Corrientes (${thermal.impArray.toFixed(1)}A Imp / ${thermal.iscArray.toFixed(1)}A Isc) exceden entrada del inversor`);
            }
            if (dcacVerdict === 'clipping') {
                if (verdict === 'cumple') verdict = 'alerta';
                failureReasons.push(`Relación DC/AC ${dcacRatio.toFixed(2)} > ${inputs.dcacMax} (Recorte / Clipping esperado)`);
            } else if (dcacVerdict === 'oversized') {
                if (verdict === 'cumple') verdict = 'alerta';
                failureReasons.push(`Relación DC/AC ${dcacRatio.toFixed(2)} < ${inputs.dcacMin} (Inversor sobredimensionado)`);
            }

            let proposedConfig = null;
            if (!vocOk || !vmpMinOk || !vmpMaxOk) {
                const alts = CONVERSION_CALC.findAlternativeStrings(
                    inputs.totalModules,
                    thermal.vocColdMod,
                    maxVoc,
                    thermal.vmpHotMod,
                    inv.mpptMin
                );
                if (alts.length > 0) proposedConfig = alts[alts.length - 1];
            }

            results.push({
                device: inv,
                nsMax,
                vocOk,
                vmpMinOk,
                vmpMaxOk,
                impOk,
                iscOk,
                dcacRatio,
                dcacVerdict,
                verdict,
                failureReasons,
                proposedConfig
            });
        });

        return results;
    },

    /**
     * Dimensionamiento detallado del banco de baterías para una tecnología dada (RF-32, RF-33, RF-34, RF-35).
     */
    sizeBatteryBank(bat, inputs, thermal) {
        const effInv = Math.max(0.01, inputs.inverterEfficiency);
        const edCCWh = inputs.edWh / effInv; // Wh/día en CC
        const days = Math.max(0.1, inputs.autonomyDays);
        const dod = Math.max(0.01, Math.min(1.0, inputs.dodDesign || bat.dod || 0.50));
        const ft = Math.max(0.01, Math.min(1.0, inputs.tempFactor));

        // Capacidad nominal requerida
        const cnWh = (edCCWh * days) / (dod * ft);
        const cnAh = inputs.busVoltage > 0 ? (cnWh / inputs.busVoltage) : 0;

        // Cadenas serie y paralelo
        let nsBat = 1;
        if (bat.voltage < inputs.busVoltage) {
            nsBat = Math.max(1, Math.round(inputs.busVoltage / bat.voltage));
        } else if (Math.abs(bat.voltage - 51.2) < 0.1 && inputs.busVoltage === 48) {
            nsBat = 1; // Batería LFP 51.2V opera en bus nominal de 48V
        } else if (bat.voltage > inputs.busVoltage) {
            nsBat = 1;
        }

        const vBancoReal = nsBat * bat.voltage;
        const npBat = Math.max(1, Math.ceil(cnAh / (bat.ah || 100)));
        const totalBatteries = nsBat * npBat;

        // Capacidades instaladas
        const ahInst = npBat * bat.ah;
        const whInst = totalBatteries * bat.voltage * bat.ah;
        const kwhInst = whInst / 1000;

        // Profundidades de descarga reales
        const dodFin = whInst > 0 ? ((edCCWh * days) / whInst) : 0;
        const dodDiario = whInst > 0 ? (edCCWh / whInst) : 0;
        const dodExceeded = dodFin > (dod + 0.0001);

        // Tasas C
        const iSalida = inputs.busVoltage > 0 ? (inputs.ppkInstW / inputs.busVoltage) : 0;
        const cCharge = ahInst > 0 ? (iSalida / ahInst) : 0;
        const chargeRateOk = cCharge <= (bat.maxChargeC || 0.20);

        // Tasa C descarga ante demanda máxima
        const iDescargaMax = (inputs.busVoltage * effInv > 0) ? (inputs.pmax / (inputs.busVoltage * effInv)) : 0;
        const cDischarge = ahInst > 0 ? (iDescargaMax / ahInst) : 0;
        const dischargeRateOk = cDischarge <= (bat.maxDischargeC || 0.50);

        // Balance de cierre (RF-34)
        const roundTripEff = bat.roundTrip || 0.80;
        const egenWh = edCCWh / roundTripEff; // Wh/día que debe generar el campo
        const preqAnnualW = (inputs.hspAnnual * inputs.pr > 0) ? (egenWh / (inputs.hspAnnual * inputs.pr)) : 0;
        const preqCriticalW = (inputs.hspCritical * inputs.pr > 0) ? (egenWh / (inputs.hspCritical * inputs.pr)) : 0;

        const deltaPAnnualW = preqAnnualW - inputs.ppkInstW;
        const deltaPCriticalW = preqCriticalW - inputs.ppkInstW;
        const deficitPercentAnnual = (inputs.ppkInstW > 0) ? ((preqAnnualW - inputs.ppkInstW) / inputs.ppkInstW) * 100 : 0;
        const deltaModulesAnnual = Math.max(0, Math.ceil(deltaPAnnualW / (inputs.module.pmax || 550)));
        const deltaModulesCritical = Math.max(0, Math.ceil(deltaPCriticalW / (inputs.module.pmax || 550)));

        // Tiempo de recuperación tras autonomía (RF-35 - Fórmula Oficial TdR)
        // t_rec = (N * E_CC) / (E_prod * eta_bat - E_CC)
        const eprodWh = inputs.ppkInstW * inputs.hspAnnual * inputs.pr;
        const netDailySurplusWh = (eprodWh * roundTripEff) - edCCWh;
        let tRecoverDays = Infinity;
        let recovers = false;

        if (netDailySurplusWh > 0) {
            tRecoverDays = (days * edCCWh) / netDailySurplusWh;
            recovers = true;
        }

        // Veredicto técnico del banco de baterías
        let verdict = 'cumple'; // 'cumple' | 'alerta' | 'no_cumple'
        const failureReasons = [];

        if (bat.voltage > inputs.busVoltage && !(Math.abs(bat.voltage - 51.2) < 0.1 && inputs.busVoltage === 48)) {
            verdict = 'no_cumple';
            failureReasons.push(`Voltaje de batería (${bat.voltage}V) excede tensión de bus (${inputs.busVoltage}V)`);
        }
        if (dodExceeded) {
            if (verdict === 'cumple') verdict = 'alerta';
            failureReasons.push(`DoD fin (${(dodFin * 100).toFixed(1)}%) supera diseño (${Math.round(dod * 100)}%)`);
        }
        if (!chargeRateOk) {
            if (cCharge > (bat.maxChargeC || 0.20) * 1.3) {
                verdict = 'no_cumple';
            } else if (verdict === 'cumple') {
                verdict = 'alerta';
            }
            failureReasons.push(`C-rate carga (${cCharge.toFixed(2)}C) excede máx (${bat.maxChargeC || 0.20}C)`);
        }
        if (!dischargeRateOk) {
            if (verdict === 'cumple') verdict = 'alerta';
            failureReasons.push(`C-rate descarga (${cDischarge.toFixed(2)}C) excede máx (${bat.maxDischargeC || 0.50}C)`);
        }
        if (!recovers) {
            if (verdict === 'cumple') verdict = 'alerta';
            failureReasons.push('Generador FV no recupera el banco en insolación promedio');
        }

        // Energía nominal anualizada (RF-35)
        const lifeYears = bat.lifeYears || 4;
        const annualizedKWhPerYear = lifeYears > 0 ? (kwhInst / lifeYears) : 0;

        return {
            battery: bat,
            verdict,
            failureReasons,
            edCCWh,
            cnWh,
            cnAh,
            nsBat,
            npBat,
            totalBatteries,
            vBancoReal,
            ahInst,
            whInst,
            kwhInst,
            dodFin,
            dodDiario,
            dodExceeded,
            iSalida,
            cCharge,
            chargeRateOk,
            iDescargaMax,
            cDischarge,
            dischargeRateOk,
            roundTripEff,
            egenWh,
            preqAnnualW,
            preqCriticalW,
            deltaPAnnualW,
            deltaPCriticalW,
            deficitPercentAnnual,
            deltaModulesAnnual,
            deltaModulesCritical,
            eprodWh,
            netDailySurplusWh,
            tRecoverDays,
            recovers,
            lifeYears,
            annualizedKWhPerYear
        };
    },

    /**
     * Ejecuta el cálculo completo del Reto 03.
     */
    calculateAll() {
        const inputs = CONVERSION_CALC.getInputs();
        const thermal = CONVERSION_CALC.calculateArrayThermal(inputs);

        // Controladores e inversores
        const controllerResults = CONVERSION_CALC.evaluateControllers(inputs, thermal);
        const inverterResults = CONVERSION_CALC.evaluateInverters(inputs, thermal);

        // Baterías
        const allBatteries = window.CONVERSION_DB ? CONVERSION_DB.getBatteries() : [];
        const batteryEvaluations = allBatteries.map(b => CONVERSION_CALC.sizeBatteryBank(b, inputs, thermal));

        const activeBattery = batteryEvaluations.find(be => be.battery.id === inputs.selectedBatteryId) || batteryEvaluations[0];
        const activeController = controllerResults.find(cr => cr.device.id === inputs.selectedControllerId) || controllerResults[0];
        const activeInverter = inverterResults.find(ir => ir.device.id === inputs.selectedInverterId) || inverterResults[0];

        return {
            inputs,
            thermal,
            controllerResults,
            inverterResults,
            batteryEvaluations,
            activeBattery,
            activeController,
            activeInverter
        };
    }
};

window.CONVERSION_CALC = CONVERSION_CALC;
