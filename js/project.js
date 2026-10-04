/* ═══════════════════════════════════════════════
   project.js — RF-01: Project Info & Day/Night Config
   ═══════════════════════════════════════════════ */

function initProject() {
    const fields = {
        name: document.getElementById('project-name'),
        id: document.getElementById('project-id'),
        members: document.getElementById('project-members'),
        date: document.getElementById('project-date'),
        installationType: document.getElementById('installation-type'),
        systemType: document.getElementById('system-type')
    };

    // Set default date & installation type
    fields.date.value = APP.state.project.date;
    if (fields.installationType) {
        fields.installationType.value = APP.state.project.installationType || 'residential';
        APP.state.sizing.vmaxSystem = fields.installationType.value === 'industrial' ? 1000 : 600;
    }

    // Bind project fields → state
    fields.name.addEventListener('input', () => APP.state.project.name = fields.name.value.trim());
    fields.id.addEventListener('input', () => APP.state.project.id = fields.id.value.trim());
    fields.members.addEventListener('input', () => APP.state.project.members = fields.members.value.trim());
    fields.date.addEventListener('change', () => APP.state.project.date = fields.date.value);
    if (fields.installationType) {
        fields.installationType.addEventListener('change', () => {
            const val = fields.installationType.value;
            APP.state.project.installationType = val;
            APP.state.sizing.vmaxSystem = val === 'industrial' ? 1000 : 600;
            if (typeof updateSizing === 'function') {
                updateSizing();
            }
        });
    }
    fields.systemType.addEventListener('change', () => APP.state.project.systemType = fields.systemType.value);

    // ───── Day/Night Configuration ─────
    const dayStartSel = document.getElementById('day-start');
    const dayEndSel = document.getElementById('day-end');

    // Populate hour selectors (0–23)
    for (let h = 0; h < 24; h++) {
        const label = String(h).padStart(2, '0') + ':00';
        dayStartSel.add(new Option(label, h));
        dayEndSel.add(new Option(label, h));
    }

    dayStartSel.value = APP.state.config.dayStart;
    dayEndSel.value = APP.state.config.dayEnd;

    dayStartSel.addEventListener('change', () => {
        APP.state.config.dayStart = parseInt(dayStartSel.value);
        updateDayNightBar();
        refreshLoadClassifications();
    });

    dayEndSel.addEventListener('change', () => {
        APP.state.config.dayEnd = parseInt(dayEndSel.value);
        updateDayNightBar();
        refreshLoadClassifications();
    });

    updateDayNightBar();
}

/** Render the 24-cell day/night visual bar */
function updateDayNightBar() {
    const bar = document.getElementById('daynight-bar');
    bar.innerHTML = '';
    for (let h = 0; h < 24; h++) {
        const cell = document.createElement('div');
        cell.className = `dn-cell ${isDayHour(h) ? 'day' : 'night'}`;
        cell.title = `${String(h).padStart(2, '0')}:00 — ${isDayHour(h) ? 'Día' : 'Noche'}`;
        bar.appendChild(cell);
    }
    // Also refresh hour-grid styling if it exists
    updateHourGridDayNight();
}

/** Update hour grid button styling based on day/night config */
function updateHourGridDayNight() {
    document.querySelectorAll('.hour-btn').forEach(btn => {
        const h = parseInt(btn.dataset.hour);
        btn.classList.toggle('night-hour', !isDayHour(h));
    });
}

/** Refresh all load classifications when day/night boundaries change */
function refreshLoadClassifications() {
    if (typeof renderLoads === 'function') renderLoads();
    recalculateAll();
}

/** Restore project fields from state (used after loading a file) */
function restoreProjectUI() {
    document.getElementById('project-name').value = APP.state.project.name;
    document.getElementById('project-id').value = APP.state.project.id;
    document.getElementById('project-members').value = APP.state.project.members;
    document.getElementById('project-date').value = APP.state.project.date;
    const itEl = document.getElementById('installation-type');
    if (itEl) {
        itEl.value = APP.state.project.installationType || 'residential';
        APP.state.sizing.vmaxSystem = itEl.value === 'industrial' ? 1000 : 600;
    }
    document.getElementById('system-type').value = APP.state.project.systemType;

    document.getElementById('day-start').value = APP.state.config.dayStart;
    document.getElementById('day-end').value = APP.state.config.dayEnd;
    updateDayNightBar();
    if (typeof updateSizing === 'function') {
        updateSizing();
    }
}
