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
    const pmax = calcMaxDemand(profile);
    const ed = calcDailyEnergy(profile);
    const em = calcMonthlyEnergy();
    const ea = calcAnnualEnergy();

    // KPI Cards
    const pinstKw = (Math.round((pinst / 1000 + 1e-6) * 100) / 100).toFixed(2);
    const pmaxKw = (Math.round((pmax / 1000 + 1e-6) * 100) / 100).toFixed(2);
    document.getElementById('kpi-pinst').textContent = `${pinst.toLocaleString('es-CO')} W`;
    document.getElementById('kpi-pinst-kw').textContent = `${pinstKw} kW`;
    document.getElementById('kpi-pmax').textContent = `${pmax.toLocaleString('es-CO')} W`;
    document.getElementById('kpi-pmax-kw').textContent = `${pmaxKw} kW`;
    document.getElementById('kpi-ed').textContent = `${ed.toFixed(2)} kWh/día`;
    document.getElementById('kpi-em').textContent = `${em.toFixed(2)} kWh/mes`;
    document.getElementById('kpi-ea').textContent = `${ea.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kWh/año`;

    // Cost estimates
    document.getElementById('cost-daily').textContent = formatCOP(calcCost(ed));
    document.getElementById('cost-monthly').textContent = formatCOP(calcCost(em));
    document.getElementById('cost-annual').textContent = formatCOP(calcCost(ea));

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
