/* ═══════════════════════════════════════════════
   persistence.js — RF-10: Save / Load Project (JSON)
   ═══════════════════════════════════════════════ */

function initPersistence() {
    const btnSave = document.getElementById('btn-save');
    const btnSaveDim = document.getElementById('btn-save-dim');
    const btnSaveConv = document.getElementById('btn-save-conv');
    const btnLoad = document.getElementById('btn-load');
    const btnLoadDim = document.getElementById('btn-load-dim');
    const btnLoadConv = document.getElementById('btn-load-conv');
    const btnPresetGuajira = document.getElementById('btn-preset-guajira');
    const btnPresetGuajiraConv = document.getElementById('btn-preset-guajira-conv');

    if (btnSave) btnSave.addEventListener('click', saveProject);
    if (btnSaveDim) btnSaveDim.addEventListener('click', saveProject);
    if (btnSaveConv) btnSaveConv.addEventListener('click', saveProject);
    if (btnLoad) btnLoad.addEventListener('change', loadProject);
    if (btnLoadDim) btnLoadDim.addEventListener('change', loadProject);
    if (btnLoadConv) btnLoadConv.addEventListener('change', loadProject);
    if (btnPresetGuajira) btnPresetGuajira.addEventListener('click', loadAltaGuajiraPreset);
    if (btnPresetGuajiraConv) btnPresetGuajiraConv.addEventListener('click', loadAltaGuajiraPreset);
}

/** Export the full state as a downloadable JSON file */
function saveProject() {
    const data = {
        version: '2.0',
        app: 'SolarCalc',
        exportDate: new Date().toISOString(),
        project: APP.state.project,
        config: APP.state.config,
        loads: APP.state.loads,
        sizing: APP.state.sizing,
        conversion: APP.state.conversion,
        customDevices: (typeof CONVERSION_DB !== 'undefined') ? CONVERSION_DB.devices : null
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

            // Restore conversion state if present
            if (data.conversion) {
                APP.state.conversion = {
                    ...APP.state.conversion,
                    ...data.conversion
                };
            }

            if (data.customDevices && typeof CONVERSION_DB !== 'undefined') {
                CONVERSION_DB.devices = data.customDevices;
                CONVERSION_DB.saveCustomDevices();
            }

            // Cancel any editing
            APP.editingId = null;

            // Restore all UIs
            restoreProjectUI();
            restoreConfigUI();
            if (typeof restoreSizingUI === 'function') restoreSizingUI();
            renderLoads();
            recalculateAll();
            if (typeof CONVERSION_UI !== 'undefined' && typeof CONVERSION_UI.render === 'function') {
                CONVERSION_UI.render();
            }

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

/**
 * Carga el Caso de Estudio Estandarizado de Alta Guajira (Ed = 7.58 kWh/día, 4x550Wp, 48V AGM)
 * para verificación inmediata del Reto 01, Reto 02 y Reto 03.
 */
function loadAltaGuajiraPreset() {
    APP.state.project = {
        name: 'Caso de Estudio - Alta Guajira (Off-Grid)',
        id: 'GUAJIRA-OFFGRID-01',
        members: 'Ingeniería Fotovoltaica Práctica',
        date: new Date().toISOString().split('T')[0],
        installationType: 'residential',
        systemType: 'off-grid'
    };

    APP.state.config = {
        dayStart: 6,
        dayEnd: 18,
        daysPerMonth: 30,
        monthsPerYear: 12,
        unitCost: 890
    };

    // Cuadro de cargas calibrado exactamente a Ed = 7.58 kWh/día (7,580 Wh/día)
    // 1. Refrigeración (120W x 24h = 2880 Wh)
    // 2. Bomba de agua sumergible (750W x 2h = 1500 Wh)
    // 3. Iluminación LED (10 x 15W x 6h = 900 Wh)
    // 4. Abanicos de ventilación (3 x 60W x 8h = 1440 Wh)
    // 5. Comunicaciones y telecom (105W x 8h = 840 Wh)
    // 6. Carga de equipos auxiliares (20W x 1h = 20 Wh)
    // Suma = 2880 + 1500 + 900 + 1440 + 840 + 20 = 7580 Wh = 7.58 kWh
    const all24 = Array.from({ length: 24 }, (_, i) => i);
    const pumpSlots = [10, 11];
    const lightSlots = [18, 19, 20, 21, 22, 23];
    const fanSlots = [12, 13, 14, 15, 20, 21, 22, 23];
    const commSlots = [8, 9, 10, 11, 12, 13, 14, 15];
    const auxSlots = [12];

    const makeSlots = (hours) => (typeof hoursToSlots === 'function' ? hoursToSlots(hours) : hours.map(h => ({ start: h, end: h + 1 })));

    APP.state.loads = [
        {
            id: 'load-refrig',
            description: 'Refrigeración eficiente 12V/120W',
            quantity: 1,
            power: 120,
            hours: all24,
            timeSlots: makeSlots(all24),
            daysPerMonth: 30,
            monthsPerYear: 12
        },
        {
            id: 'load-pump',
            description: 'Bomba de agua sumergible (Motor inductivo)',
            quantity: 1,
            power: 750,
            hours: pumpSlots,
            timeSlots: makeSlots(pumpSlots),
            daysPerMonth: 30,
            monthsPerYear: 12
        },
        {
            id: 'load-light',
            description: 'Iluminación LED interior y perimetral',
            quantity: 10,
            power: 15,
            hours: lightSlots,
            timeSlots: makeSlots(lightSlots),
            daysPerMonth: 30,
            monthsPerYear: 12
        },
        {
            id: 'load-fans',
            description: 'Ventiladores / Abanicos de techo',
            quantity: 3,
            power: 60,
            hours: fanSlots,
            timeSlots: makeSlots(fanSlots),
            daysPerMonth: 30,
            monthsPerYear: 12
        },
        {
            id: 'load-comm',
            description: 'Sistema de comunicaciones e Internet satelital',
            quantity: 1,
            power: 105,
            hours: commSlots,
            timeSlots: makeSlots(commSlots),
            daysPerMonth: 30,
            monthsPerYear: 12
        },
        {
            id: 'load-aux',
            description: 'Carga de equipos y telefonía móvil',
            quantity: 1,
            power: 20,
            hours: auxSlots,
            timeSlots: makeSlots(auxSlots),
            daysPerMonth: 30,
            monthsPerYear: 12
        }
    ];

    // Sizing state Reto 02: 4 módulos de 550Wp = 2.20 kWp en Alta Guajira (HSP 5.2, Tmin 21.3°C, Tamb 27.3°C)
    APP.state.sizing = {
        ...APP.state.sizing,
        selectedModuleId: 'panel-550w',
        targetKwp: 2.20,
        tmin: 21.3,
        tamb: 27.3,
        hsp: 5.2,
        generatorConfig: {
            np: 1,
            ns: 4
        }
    };

    // Conversion state Reto 03: Off-Grid, 48V, AGM 200Ah, CTRL-A
    APP.state.conversion = {
        branch: 'storage',
        vbus: 48,
        invEff: 90,
        autonomyDays: 2.0,
        designDod: 50,
        tempFactor: 1.0,
        selectedBatteryId: 'BAT-AGM-200',
        selectedControllerId: 'CTRL-A',
        selectedInverterId: 'INV-A',
        extraModulesAdded: 0
    };

    APP.editingId = null;

    restoreProjectUI();
    restoreConfigUI();
    if (typeof restoreSizingUI === 'function') restoreSizingUI();
    renderLoads();
    recalculateAll();
    if (typeof CONVERSION_UI !== 'undefined' && typeof CONVERSION_UI.render === 'function') {
        CONVERSION_UI.render();
    }

    showToast('Caso Estándar Alta Guajira (Ed=7.58 kWh/d, 4x550Wp, 48V AGM) cargado con éxito.', 'success');
}
