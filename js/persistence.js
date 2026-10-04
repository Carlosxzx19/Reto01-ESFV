/* ═══════════════════════════════════════════════
   persistence.js — RF-10: Save / Load Project (JSON)
   ═══════════════════════════════════════════════ */

function initPersistence() {
    document.getElementById('btn-save').addEventListener('click', saveProject);
    document.getElementById('btn-load').addEventListener('change', loadProject);
}

/** Export the full state as a downloadable JSON file */
function saveProject() {
    const data = {
        version: '1.0',
        app: 'SolarCalc',
        exportDate: new Date().toISOString(),
        project: APP.state.project,
        config: APP.state.config,
        loads: APP.state.loads,
        sizing: APP.state.sizing
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    const name = APP.state.project.name
        ? APP.state.project.name.replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ _-]/g, '').replace(/\s+/g, '_')
        : 'proyecto';
    a.href = url;
    a.download = `SolarCalc_${name}_${APP.state.project.date || 'sin_fecha'}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showToast('Proyecto guardado correctamente.', 'success');
}

/** Import a JSON file and restore the full state */
function loadProject(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);

            // Basic validation
            if (!data.project || !data.config || !Array.isArray(data.loads)) {
                showToast('Archivo no válido: faltan campos requeridos.', 'error');
                return;
            }

            // Restore state
            APP.state.project = {
                name: data.project.name || '',
                id: data.project.id || '',
                members: data.project.members || '',
                date: data.project.date || new Date().toISOString().split('T')[0],
                installationType: data.project.installationType || 'residential',
                systemType: data.project.systemType || 'off-grid'
            };

            APP.state.config = {
                dayStart: data.config.dayStart ?? 6,
                dayEnd: data.config.dayEnd ?? 18,
                daysPerMonth: data.config.daysPerMonth ?? 30,
                monthsPerYear: data.config.monthsPerYear ?? 12,
                unitCost: data.config.unitCost ?? 890
            };

            APP.state.loads = data.loads.map(l => {
                const hours = Array.isArray(l.hours) ? l.hours : [];
                let timeSlots = Array.isArray(l.timeSlots) ? l.timeSlots : [];
                // Backward compatibility: reconstruct timeSlots from hours
                if (timeSlots.length === 0 && hours.length > 0 && typeof hoursToSlots === 'function') {
                    timeSlots = hoursToSlots(hours);
                }
                return {
                    id: l.id || Date.now() + Math.random(),
                    description: l.description || '',
                    quantity: l.quantity || 1,
                    power: l.power || 0,
                    timeSlots: timeSlots,
                    hours: hours.length > 0 ? hours : (typeof computeHoursFromSlots === 'function' ? computeHoursFromSlots(timeSlots) : []),
                    daysPerMonth: l.daysPerMonth,
                    monthsPerYear: l.monthsPerYear
                };
            });

            // Restore sizing state if present
            if (data.sizing) {
                APP.state.sizing = {
                    ...APP.state.sizing,
                    ...data.sizing
                };
            }

            // Cancel any editing
            APP.editingId = null;

            // Restore all UIs
            restoreProjectUI();
            restoreConfigUI();
            if (typeof restoreSizingUI === 'function') restoreSizingUI();
            renderLoads();
            recalculateAll();

            showToast(`Proyecto "${APP.state.project.name}" cargado correctamente.`, 'success');
        } catch (err) {
            console.error('Error loading project:', err);
            showToast('Error al leer el archivo. Verifique el formato JSON.', 'error');
        }
    };
    reader.readAsText(file);

    // Reset file input so the same file can be loaded again
    event.target.value = '';
}
