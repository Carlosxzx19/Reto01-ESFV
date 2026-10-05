/* ═══════════════════════════════════════════════
   loads.js — RF-02/03/04/09: Load CRUD, Time Slots,
              Validation, Classification
   ═══════════════════════════════════════════════ */

let currentTimeSlots = []; // [{start: 6, end: 18}, ...]

function initLoads() {
    bindDefaultFrequency();
    buildTimeSlotSelectors();
    bindLoadForm();
    renderLoads();
    updateFrequencyHints();
}

// ───── DEFAULT FREQUENCY ─────

function bindDefaultFrequency() {
    const dpmInput = document.getElementById('default-days-per-month');
    const mpyInput = document.getElementById('default-months-per-year');

    if (dpmInput) {
        dpmInput.value = APP.state.config.daysPerMonth;
        dpmInput.addEventListener('input', () => {
            const v = parseInt(dpmInput.value);
            if (v >= 1 && v <= 31) {
                APP.state.config.daysPerMonth = v;
                updateFrequencyHints();
                renderLoads();
                recalculateAll();
            }
        });
    }

    if (mpyInput) {
        mpyInput.value = APP.state.config.monthsPerYear;
        mpyInput.addEventListener('input', () => {
            const v = parseInt(mpyInput.value);
            if (v >= 1 && v <= 12) {
                APP.state.config.monthsPerYear = v;
                updateFrequencyHints();
                renderLoads();
                recalculateAll();
            }
        });
    }
}

function updateFrequencyHints() {
    const dpm = APP.state.config.daysPerMonth || 30;
    const mpy = APP.state.config.monthsPerYear || 12;
    const isEn = window.APP_LANG === 'en';
    const hintDpm = document.getElementById('hint-load-dpm');
    const hintMpy = document.getElementById('hint-load-mpy');
    if (hintDpm) {
        hintDpm.textContent = isEn ? `Leave blank for default (${dpm} d/m)` : `En blanco usa por defecto (${dpm} d/m)`;
    }
    if (hintMpy) {
        hintMpy.textContent = isEn ? `Leave blank for default (${mpy} m/y)` : `En blanco usa por defecto (${mpy} m/a)`;
    }
}

// ───── TIME SLOT SELECTORS ─────

function buildTimeSlotSelectors() {
    const startSel = document.getElementById('slot-start');
    const endSel = document.getElementById('slot-end');

    for (let h = 0; h < 24; h++) {
        const label = String(h).padStart(2, '0') + ':00';
        startSel.add(new Option(label, h));
        endSel.add(new Option(label, h));
    }

    // Defaults: 06:00 – 18:00
    startSel.value = 6;
    endSel.value = 18;

    // Add slot button
    document.getElementById('btn-add-slot').addEventListener('click', () => {
        const start = parseInt(startSel.value);
        const end = parseInt(endSel.value);
        addTimeSlot(start, end);
    });
}

/** Compute the set of individual hours from a single time slot */
function slotToHours(start, end) {
    const hours = [];
    if (start === end) {
        // Full 24 hours
        for (let h = 0; h < 24; h++) hours.push(h);
    } else {
        let h = start;
        while (h !== end) {
            hours.push(h);
            h = (h + 1) % 24;
        }
    }
    return hours;
}

/** Compute all hours from an array of time slots */
function computeHoursFromSlots(slots) {
    const hourSet = new Set();
    slots.forEach(s => {
        slotToHours(s.start, s.end).forEach(h => hourSet.add(h));
    });
    return Array.from(hourSet).sort((a, b) => a - b);
}

/** Reconstruct time slots from a flat hours array (for backward compatibility) */
function hoursToSlots(hours) {
    if (!hours || hours.length === 0) return [];
    if (hours.length === 24) return [{ start: 0, end: 0 }];
    const sorted = [...hours].sort((a, b) => a - b);
    const slots = [];
    let start = sorted[0], prev = sorted[0];

    for (let i = 1; i <= sorted.length; i++) {
        if (i === sorted.length || sorted[i] !== prev + 1) {
            slots.push({ start: start, end: (prev + 1) % 24 });
            if (i < sorted.length) { start = sorted[i]; prev = sorted[i]; }
        } else {
            prev = sorted[i];
        }
    }
    return slots;
}

/** Format a single time slot for display */
function formatSlot(slot) {
    const s = String(slot.start).padStart(2, '0') + ':00';
    const e = String(slot.end).padStart(2, '0') + ':00';
    return `${s} – ${e}`;
}

/** Count hours in a slot */
function slotHourCount(slot) {
    return slotToHours(slot.start, slot.end).length;
}

// ───── ADD / REMOVE TIME SLOTS ─────

function addTimeSlot(start, end) {
    // Validate: check for exact duplicate slot
    const duplicate = currentTimeSlots.find(s => s.start === start && s.end === end);
    if (duplicate) {
        showToast('Esa franja horaria ya está agregada.', 'error');
        return;
    }

    currentTimeSlots.push({ start, end });
    renderTimeSlotChips();
    clearError('err-hours');
}

function removeTimeSlot(index) {
    currentTimeSlots.splice(index, 1);
    renderTimeSlotChips();
}

function renderTimeSlotChips() {
    const container = document.getElementById('timeslot-chips');
    if (currentTimeSlots.length === 0) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = currentTimeSlots.map((slot, idx) => {
        const hCount = slotHourCount(slot);
        return `<span class="timeslot-chip">
            ${formatSlot(slot)}
            <span class="chip-hours">(${hCount}h)</span>
            <button type="button" class="chip-remove" onclick="removeTimeSlot(${idx})" title="Eliminar franja">✕</button>
        </span>`;
    }).join('');
}

function clearTimeSlots() {
    currentTimeSlots = [];
    renderTimeSlotChips();
}

// ───── FORM BINDING ─────

function bindLoadForm() {
    const form = document.getElementById('load-form');
    const cancelBtn = document.getElementById('btn-cancel-edit');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        handleLoadSubmit();
    });

    cancelBtn.addEventListener('click', () => {
        cancelEditing();
    });
}

function handleLoadSubmit() {
    // Gather values
    const desc = document.getElementById('load-desc').value.trim();
    const qty = parseInt(document.getElementById('load-qty').value);
    const power = parseInt(document.getElementById('load-power').value);
    const dpm = parseInt(document.getElementById('load-dpm').value) || undefined;
    const mpy = parseInt(document.getElementById('load-mpy').value) || undefined;
    const timeSlots = [...currentTimeSlots];
    const hours = computeHoursFromSlots(timeSlots);

    // Validate
    if (!validateLoad(desc, qty, power, timeSlots)) return;

    if (APP.editingId !== null) {
        // Update existing
        const idx = APP.state.loads.findIndex(l => l.id === APP.editingId);
        if (idx !== -1) {
            APP.state.loads[idx] = {
                id: APP.editingId,
                description: desc,
                quantity: qty,
                power: power,
                timeSlots: timeSlots,
                hours: hours,
                daysPerMonth: dpm,
                monthsPerYear: mpy
            };
        }
        cancelEditing();
        showToast('Carga actualizada correctamente.', 'success');
    } else {
        // Add new
        APP.state.loads.push({
            id: Date.now(),
            description: desc,
            quantity: qty,
            power: power,
            timeSlots: timeSlots,
            hours: hours,
            daysPerMonth: dpm,
            monthsPerYear: mpy
        });
        showToast('Carga agregada correctamente.', 'success');
    }

    // Reset form
    resetLoadForm();
    renderLoads();
    recalculateAll();
}

function resetLoadForm() {
    document.getElementById('load-desc').value = '';
    document.getElementById('load-qty').value = 1;
    document.getElementById('load-power').value = '';
    document.getElementById('load-dpm').value = '';
    document.getElementById('load-mpy').value = '';
    clearTimeSlots();
    clearAllErrors();
    updateFrequencyHints();
    // Reset selectors to sensible defaults
    document.getElementById('slot-start').value = 6;
    document.getElementById('slot-end').value = 18;
}

function cancelEditing() {
    APP.editingId = null;
    resetLoadForm();
    document.getElementById('form-title').textContent = 'Agregar Carga';
    document.getElementById('btn-submit-load').innerHTML = '<span class="btn-icon">＋</span> Agregar';
    document.getElementById('btn-cancel-edit').style.display = 'none';
}

// ───── VALIDATION (RF-09) ─────

function validateLoad(desc, qty, power, timeSlots) {
    let valid = true;

    // Description
    if (!desc) {
        showError('err-desc', 'La descripción es obligatoria.');
        document.getElementById('load-desc').classList.add('invalid');
        valid = false;
    } else {
        clearError('err-desc');
        document.getElementById('load-desc').classList.remove('invalid');
    }

    // Quantity
    if (isNaN(qty) || qty < 1) {
        showError('err-qty', 'La cantidad debe ser ≥ 1.');
        document.getElementById('load-qty').classList.add('invalid');
        valid = false;
    } else {
        clearError('err-qty');
        document.getElementById('load-qty').classList.remove('invalid');
    }

    // Power
    if (isNaN(power) || power <= 0) {
        showError('err-power', 'La potencia debe ser > 0 W.');
        document.getElementById('load-power').classList.add('invalid');
        valid = false;
    } else {
        clearError('err-power');
        document.getElementById('load-power').classList.remove('invalid');
    }

    // Time slots
    if (!timeSlots || timeSlots.length === 0) {
        showError('err-hours', 'Agregue al menos una franja horaria.');
        valid = false;
    } else {
        clearError('err-hours');
    }

    // Duplicate check (same description + same power, excluding current edit)
    if (valid) {
        const duplicate = APP.state.loads.find(l =>
            l.description.toLowerCase() === desc.toLowerCase() &&
            l.power === power &&
            l.id !== APP.editingId
        );
        if (duplicate) {
            showError('err-desc', 'Ya existe una carga con la misma descripción y potencia. Ajuste la cantidad o modifique la descripción.');
            document.getElementById('load-desc').classList.add('invalid');
            valid = false;
        }
    }

    return valid;
}

function showError(id, msg) {
    const el = document.getElementById(id);
    if (el) el.textContent = msg;
}

function clearError(id) {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
}

function clearAllErrors() {
    ['err-desc', 'err-qty', 'err-power', 'err-hours'].forEach(id => clearError(id));
    ['load-desc', 'load-qty', 'load-power'].forEach(id => {
        document.getElementById(id)?.classList.remove('invalid');
    });
}

// ───── LOAD TABLE RENDERING ─────

function renderLoads() {
    const tbody = document.getElementById('loads-tbody');
    const emptyEl = document.getElementById('empty-loads');
    const table = document.getElementById('loads-table');
    const badge = document.getElementById('load-count-badge');

    const loads = APP.state.loads;
    const loadWord = window.APP_LANG === 'en' ? (loads.length === 1 ? 'load' : 'loads') : (loads.length === 1 ? 'carga' : 'cargas');
    badge.textContent = `${loads.length} ${loadWord}`;

    if (loads.length === 0) {
        table.style.display = 'none';
        emptyEl.classList.remove('hidden');
        tbody.innerHTML = '';
        return;
    }

    table.style.display = '';
    emptyEl.classList.add('hidden');

    tbody.innerHTML = loads.map((load, idx) => {
        // Ensure hours exist (recompute from timeSlots if needed)
        if (!load.hours && load.timeSlots) {
            load.hours = computeHoursFromSlots(load.timeSlots);
        }

        const totalPower = load.quantity * load.power;
        const classification = classifyLoad(load.hours || []);
        const hoursDisplay = load.timeDisplay || formatHourRanges(load.hours || []);
        const hpdRaw = (load.hoursPerDay !== undefined && load.hoursPerDay !== null)
            ? load.hoursPerDay
            : (load.hours || []).length;
        const hoursPerDay = typeof hpdRaw === 'number'
            ? (Number.isInteger(hpdRaw) ? hpdRaw : hpdRaw.toFixed(2).replace('.', ','))
            : hpdRaw;
        
        const dpm = load.daysPerMonth || APP.state.config.daysPerMonth;
        const mpy = load.monthsPerYear || APP.state.config.monthsPerYear;
        const freqDisplay = `${dpm} d/m, ${mpy} m/a`;

        let badgeClass = 'badge';
        if (classification === 'Diurna') badgeClass += ' badge-day';
        else if (classification === 'Nocturna') badgeClass += ' badge-night';
        else if (classification === 'Mixta') badgeClass += ' badge-mixed';

        const transClass = window.translateText ? window.translateText(classification) : classification;
        const transEdit = window.translateText ? window.translateText('Editar') : 'Editar';
        const transDel = window.translateText ? window.translateText('Eliminar') : 'Eliminar';

        return `<tr>
            <td>${idx + 1}</td>
            <td>${escapeHtml(load.description)}</td>
            <td>${load.quantity}</td>
            <td>${load.power.toLocaleString('es-CO')}</td>
            <td><strong>${totalPower.toLocaleString('es-CO')}</strong></td>
            <td class="text-muted" style="font-size:0.78rem;">${hoursDisplay}</td>
            <td>${hoursPerDay}</td>
            <td>${freqDisplay}</td>
            <td><span class="${badgeClass}">${transClass}</span></td>
            <td class="actions-cell">
                <button class="action-btn" onclick="editLoad('${escapeHtml(String(load.id))}')" title="${transEdit}">✏️</button>
                <button class="action-btn delete" onclick="deleteLoad('${escapeHtml(String(load.id))}')" title="${transDel}">🗑️</button>
            </td>
        </tr>`;
    }).join('');
}

/** Escape HTML to prevent XSS */
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ───── EDIT / DELETE ─────

function editLoad(id) {
    const load = APP.state.loads.find(l => l.id === id);
    if (!load) return;

    APP.editingId = id;

    // Populate form
    document.getElementById('load-desc').value = load.description;
    document.getElementById('load-qty').value = load.quantity;
    document.getElementById('load-power').value = load.power;
    document.getElementById('load-dpm').value = load.daysPerMonth || '';
    document.getElementById('load-mpy').value = load.monthsPerYear || '';

    // Restore time slots
    if (load.timeSlots && load.timeSlots.length > 0) {
        currentTimeSlots = [...load.timeSlots.map(s => ({ ...s }))];
    } else if (load.hours && load.hours.length > 0) {
        // Backward compatibility: reconstruct from hours
        currentTimeSlots = hoursToSlots(load.hours);
    } else {
        currentTimeSlots = [];
    }
    renderTimeSlotChips();

    // Update form UI
    document.getElementById('form-title').textContent = 'Editar Carga';
    document.getElementById('btn-submit-load').innerHTML = '<span class="btn-icon">✓</span> Actualizar';
    document.getElementById('btn-cancel-edit').style.display = '';

    // Scroll to form
    document.getElementById('load-form').scrollIntoView({ behavior: 'smooth', block: 'start' });

    clearAllErrors();
}

function deleteLoad(id) {
    const load = APP.state.loads.find(l => l.id === id);
    if (!load) return;
    if (!confirm(`¿Eliminar la carga "${load.description}"?`)) return;

    APP.state.loads = APP.state.loads.filter(l => l.id !== id);

    // If we were editing this load, cancel
    if (APP.editingId === id) cancelEditing();

    renderLoads();
    recalculateAll();
    showToast('Carga eliminada.', 'info');
}
