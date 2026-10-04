/* ═══════════════════════════════════════════════
   app.js — Global State, Tabs, Utilities, Init
   ═══════════════════════════════════════════════ */

// ───── GLOBAL STATE ─────
const APP = {
    state: {
        project: {
            name: '',
            id: '',
            members: '',
            date: new Date().toISOString().split('T')[0],
            installationType: 'residential',
            systemType: 'off-grid'
        },
        config: {
            dayStart: 6,
            dayEnd: 18,
            daysPerMonth: 30,
            monthsPerYear: 12,
            unitCost: 890
        },
        loads: [],
        sizing: {
            availableArea: 20,
            solarProvider: 'pvgis', // 'pvgis' (default) | 'pvwatts'
            lat: null,
            lon: null,
            tilt: null,
            azimuth: null,
            arrayType: 0, // 0 = Suelo (Open Rack), 1 = Techo (Roof)
            losses: 0,
            pr: 0.80,
            tmin: 18,
            tambOp: 32,
            vmaxSystem: 600,
            criterion: 'anual', // 'anual' | 'critico'
            selectedModuleId: 'panel-550w',
            projectionView: 'mensual',
            solarResource: null,
            evaluatedModules: [],
            selectedResult: null,
            solarWindow: null
        }
    },
    currentStage: 'requerimiento',
    editingId: null,
    chart: null
};

window.APP = APP;

// ───── UTILITIES ─────

/** Check if an hour is daytime based on current config */
function isDayHour(hour) {
    const { dayStart, dayEnd } = APP.state.config;
    if (dayStart < dayEnd) {
        return hour >= dayStart && hour < dayEnd;
    }
    // Wraps around midnight (e.g., day 20:00–06:00 — unusual but supported)
    return hour >= dayStart || hour < dayEnd;
}

/** Classify a load's hour array as Diurna / Nocturna / Mixta */
function classifyLoad(hours) {
    if (!hours || hours.length === 0) return '—';
    let hasDay = false, hasNight = false;
    for (const h of hours) {
        if (isDayHour(h)) hasDay = true;
        else hasNight = true;
        if (hasDay && hasNight) return 'Mixta';
    }
    return hasDay ? 'Diurna' : 'Nocturna';
}

/** Format an array of hours into readable time ranges */
function formatHourRanges(hours) {
    if (!hours || hours.length === 0) return '—';
    const sorted = [...hours].sort((a, b) => a - b);
    const ranges = [];
    let start = sorted[0], prev = sorted[0];

    for (let i = 1; i <= sorted.length; i++) {
        if (i === sorted.length || sorted[i] !== prev + 1) {
            const sStr = String(start).padStart(2, '0') + ':00';
            const eStr = String((prev + 1) % 24).padStart(2, '0') + ':00';
            ranges.push(`${sStr}–${eStr}`);
            if (i < sorted.length) { start = sorted[i]; prev = sorted[i]; }
        } else {
            prev = sorted[i];
        }
    }
    return ranges.join(', ');
}

/** Format a number as COP currency (no decimals) */
function formatCOP(value) {
    const rounded = Math.round(value);
    return `$ ${rounded.toLocaleString('es-CO')} COP`;
}

/** Format watts, showing kW if ≥ 1000 */
function formatPower(watts) {
    if (watts >= 1000) return `${(watts / 1000).toFixed(2)} kW`;
    return `${watts.toLocaleString('es-CO')} W`;
}

/** Show a toast notification */
function showToast(message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(30px)';
        toast.style.transition = '0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ───── STAGE NAVIGATION (REQUERIMIENTO VS DIMENSIONAMIENTO) ─────
function initStages() {
    const stageBtns = document.querySelectorAll('.stage-btn');
    stageBtns.forEach(btn => {
        btn.addEventListener('click', () => switchStage(btn.dataset.stage));
    });
}

function switchStage(stageId) {
    APP.currentStage = stageId;
    document.querySelectorAll('.stage-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.stage-panel').forEach(p => p.classList.remove('active'));

    const activeBtn = document.querySelector(`[data-stage="${stageId}"]`);
    if (activeBtn) activeBtn.classList.add('active');

    const panel = document.getElementById(`stage-${stageId}`);
    if (panel) panel.classList.add('active');

    // Stage 1 (Requerimiento) controls tab navigation visibility
    const tabNav = document.getElementById('main-tab-nav');
    if (tabNav) {
        tabNav.style.display = stageId === 'requerimiento' ? 'flex' : 'none';
    }

    // Stage 2 (Dimensionamiento) controls cases navigation visibility
    const dimCasesNav = document.getElementById('dim-cases-nav');
    if (dimCasesNav) {
        dimCasesNav.style.display = stageId === 'dimensionamiento' ? 'flex' : 'none';
    }

    if (stageId === 'dimensionamiento') {
        if (!APP._sizingVisited) {
            APP._sizingVisited = true;
            if (!APP.state.sizing.activeCaseId && typeof selectDimensioningCase === 'function') {
                selectDimensioningCase('custom', { silent: true });
            }
        }
        if (typeof updateSizing === 'function') updateSizing();
    }
}

// ───── TAB NAVIGATION ─────
function initTabs() {
    const tabBtns = document.querySelectorAll('#main-tab-nav .tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
}

function switchTab(tabId) {
    if (!tabId) return;
    // Deactivate main stage tabs
    document.querySelectorAll('#main-tab-nav .tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    // Activate target
    const targetBtn = document.querySelector(`#main-tab-nav [data-tab="${tabId}"]`);
    if (targetBtn) targetBtn.classList.add('active');
    const panel = document.getElementById(`tab-${tabId}`);
    if (panel) panel.classList.add('active');
    // If switching to results, recalculate and update chart
    if (tabId === 'resultados') {
        recalculateAll();
        if (APP.chart) APP.chart.resize();
    }
}

// ───── CENTRAL RECALCULATE ─────
function recalculateAll() {
    if (typeof updateCalculations === 'function') updateCalculations();
    if (typeof updateChart === 'function') updateChart();
    if (typeof updateSizing === 'function') updateSizing();
}

// ───── THEME TOGGLE ─────
function initTheme() {
    const saved = localStorage.getItem('solarcalc-theme') || 'dark';
    applyTheme(saved);

    document.getElementById('btn-theme').addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'light' ? 'dark' : 'light';
        applyTheme(next);
        localStorage.setItem('solarcalc-theme', next);
    });
}

function applyTheme(theme) {
    if (theme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        document.getElementById('theme-icon').textContent = '☀️';
        document.getElementById('theme-label').textContent = 'Modo Oscuro';
    } else {
        document.documentElement.removeAttribute('data-theme');
        document.getElementById('theme-icon').textContent = '🌙';
        document.getElementById('theme-label').textContent = 'Modo Claro';
    }
    // Update chart colors if chart exists
    if (APP.chart && typeof updateChart === 'function') {
        setTimeout(() => updateChart(), 100);
    }
    if (typeof updateSolarMonthlyChartColors === 'function') {
        setTimeout(() => updateSolarMonthlyChartColors(), 100);
    }
}

// ───── CONFIG MODAL ─────
// Main logic is in the inline <script> inside index.html (runs immediately after modal HTML).
// This stub prevents errors if called from DOMContentLoaded.
function initConfigModal() { /* handled by inline script */ }

// ───── INIT ─────
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initConfigModal();
    initStages();
    initTabs();
    if (typeof initProject === 'function') initProject();
    if (typeof initLoads === 'function') initLoads();
    if (typeof initCalculations === 'function') initCalculations();
    if (typeof initProfileChart === 'function') initProfileChart();
    if (typeof initPersistence === 'function') initPersistence();
    if (typeof initReport === 'function') initReport();
    if (typeof initExcel === 'function') initExcel();
    if (typeof initSizingUI === 'function') initSizingUI();
});
