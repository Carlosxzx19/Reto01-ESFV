/* ═══════════════════════════════════════════════
   calculations.js — RF-05/06/07/08: Power, Energy,
                     Projections, Costs
   ═══════════════════════════════════════════════ */

function initCalculations() {
    // Bind unit cost input in Resultados tab → state → recalculate
    const cuInput = document.getElementById('unit-cost');
    if (cuInput) {
        cuInput.addEventListener('input', () => {
            const v = parseInt(cuInput.value);
            if (v >= 1) APP.state.config.unitCost = v;
            updateCalculations();
        });
    }
}

// ───── CORE CALCULATIONS ─────

/** RF-05: Installed Power — Pinst = Σ (Ni × Pi) */
function calcInstalledPower() {
    return APP.state.loads.reduce((sum, l) => sum + l.quantity * l.power, 0);
}

/** RF-06: Hourly Profile — P(h) = Σ (Ni × Pi) for loads active at h */
function calcHourlyProfile() {
    const profile = new Array(24).fill(0);
    APP.state.loads.forEach(load => {
        const pTotal = load.quantity * load.power;
        load.hours.forEach(h => {
            profile[h] += pTotal;
        });
    });
    return profile;
}

/** RF-05: Maximum Simultaneous Demand — Pmax = max[P(h)] */
function calcMaxDemand(profile) {
    return Math.max(0, ...profile);
}

/** RF-46: Maximum Demand Details and Hour Tie-Breaker */
function calcMaxDemandInfo(profile) {
    if (!profile) profile = calcHourlyProfile();
    const pmax = Math.max(0, ...profile);
    if (pmax === 0) {
        return {
            pmax: 0,
            firstHour: null,
            peakHours: [],
            tiedHours: [],
            displayText: 'Sin demanda activa'
        };
    }
    const peakHours = [];
    profile.forEach((val, h) => {
        if (Math.abs(val - pmax) < 1e-4) {
            peakHours.push(h);
        }
    });

    const formatHourSlot = h => `${String(h).padStart(2, '0')}:00–${String((h + 1) % 24).padStart(2, '0')}:00`;
    const firstHour = peakHours[0];
    const tiedHours = peakHours.slice(1);

    let displayText = `${formatHourSlot(firstHour)}`;
    if (tiedHours.length > 0) {
        displayText += ` (Coincide además en: ${tiedHours.map(formatHourSlot).join(', ')})`;
    }

    return {
        pmax,
        firstHour,
        peakHours,
        tiedHours,
        displayText
    };
}

/** Load-specific Energy Getters */
function getLoadEd(load) {
    const pTotal = load.quantity * load.power;
    const hpd = (load.hoursPerDay !== undefined && load.hoursPerDay !== null)
        ? load.hoursPerDay
        : (load.hours ? load.hours.length : 0);
    return (pTotal * hpd) / 1000;
}

/** RF-06: Daily Energy — Ed = Σ P(h) · Δt / 1000, Δt = 1h (o suma de Ed por carga si tienen factor de operación) */
function calcDailyEnergy(profile) {
    const hasExplicitHpd = APP.state.loads.some(l => l.hoursPerDay !== undefined && l.hoursPerDay !== null);
    if (hasExplicitHpd) {
        return APP.state.loads.reduce((sum, l) => sum + getLoadEd(l), 0);
    }
    return profile.reduce((sum, p) => sum + p, 0) / 1000;
}

/** RF-07: Monthly Energy — Em = Σ (Ed_load × days/month_load) */
function calcMonthlyEnergy() {
    return APP.state.loads.reduce((sum, load) => {
        const dpm = load.daysPerMonth || APP.state.config.daysPerMonth;
        return sum + (getLoadEd(load) * dpm);
    }, 0);
}

/** RF-07: Annual Energy — Ea = Σ (Em_load × months/year_load) */
function calcAnnualEnergy() {
    return APP.state.loads.reduce((sum, load) => {
        const dpm = load.daysPerMonth || APP.state.config.daysPerMonth;
        const mpy = load.monthsPerYear || APP.state.config.monthsPerYear;
        const em = getLoadEd(load) * dpm;
        return sum + (em * mpy);
    }, 0);
}

/** RF-08: Cost = Energy × CU */
function calcCost(energyKwh) {
    return energyKwh * APP.state.config.unitCost;
}

// ───── UPDATE UI ─────

function updateCalculations() {
    const profile = calcHourlyProfile();
    const pinst = calcInstalledPower();
    const pmaxInfo = calcMaxDemandInfo(profile);
    const pmax = pmaxInfo.pmax;
    const ed = calcDailyEnergy(profile);
    const em = calcMonthlyEnergy();
    const ea = calcAnnualEnergy();

    // KPI Cards
    const isEn = window.APP_LANG === 'en';
    const pinstKw = (Math.round((pinst / 1000 + 1e-6) * 100) / 100).toFixed(2);
    const pmaxKw = (Math.round((pmax / 1000 + 1e-6) * 100) / 100).toFixed(2);
    const elPinst = document.getElementById('kpi-pinst');
    const elPinstKw = document.getElementById('kpi-pinst-kw');
    const elPmax = document.getElementById('kpi-pmax');
    const elPmaxKw = document.getElementById('kpi-pmax-kw');
    const elPmaxHour = document.getElementById('kpi-pmax-hour');
    const elEd = document.getElementById('kpi-ed');
    const elEm = document.getElementById('kpi-em');
    const elEa = document.getElementById('kpi-ea');

    if (elPinst) elPinst.textContent = `${pinst.toLocaleString(isEn ? 'en-US' : 'es-CO')} W`;
    if (elPinstKw) elPinstKw.textContent = `${pinstKw} kW`;
    if (elPmax) elPmax.textContent = `${pmax.toLocaleString(isEn ? 'en-US' : 'es-CO')} W`;
    if (elPmaxKw) elPmaxKw.textContent = `${pmaxKw} kW`;
    if (elPmaxHour) elPmaxHour.textContent = pmax > 0 ? `Pico: ${pmaxInfo.displayText}` : '—';
    if (elEd) elEd.textContent = `${ed.toFixed(2)} ${isEn ? 'kWh/day' : 'kWh/día'}`;
    if (elEm) elEm.textContent = `${em.toFixed(2)} ${isEn ? 'kWh/month' : 'kWh/mes'}`;
    if (elEa) elEa.textContent = `${ea.toLocaleString(isEn ? 'en-US' : 'es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${isEn ? 'kWh/year' : 'kWh/año'}`;

    // Cost estimates
    const cDaily = document.getElementById('cost-daily');
    const cMonthly = document.getElementById('cost-monthly');
    const cAnnual = document.getElementById('cost-annual');
    if (cDaily) cDaily.textContent = formatCOP(calcCost(ed));
    if (cMonthly) cMonthly.textContent = formatCOP(calcCost(em));
    if (cAnnual) cAnnual.textContent = formatCOP(calcCost(ea));

    // Update chart
    if (typeof updateChart === 'function') updateChart(profile);
}

/** Restore config UI from state (used after loading a file) */
function restoreConfigUI() {
    const defaultDpm = document.getElementById('default-days-per-month');
    const defaultMpy = document.getElementById('default-months-per-year');
    const unitCost = document.getElementById('unit-cost');

    if (defaultDpm) defaultDpm.value = APP.state.config.daysPerMonth;
    if (defaultMpy) defaultMpy.value = APP.state.config.monthsPerYear;
    if (unitCost) unitCost.value = APP.state.config.unitCost;

    if (typeof updateFrequencyHints === 'function') updateFrequencyHints();
}
