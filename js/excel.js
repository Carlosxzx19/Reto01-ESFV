/* ═══════════════════════════════════════════════
   excel.js — Excel Import/Export for Load Table
   Uses SheetJS (xlsx) library
   ═══════════════════════════════════════════════ */

function initExcel() {
    const btnExp1 = document.getElementById('btn-excel-export');
    const btnExp2 = document.getElementById('btn-excel-export-dim');
    const btnImp1 = document.getElementById('btn-excel-import');
    const btnImp2 = document.getElementById('btn-excel-import-dim');

    if (btnExp1) btnExp1.addEventListener('click', exportExcel);
    if (btnExp2) btnExp2.addEventListener('click', exportExcel);
    if (btnImp1) btnImp1.addEventListener('change', importExcel);
    if (btnImp2) btnImp2.addEventListener('change', importExcel);
}

// ───── EXPORT ─────

function exportExcel() {
    if (APP.state.loads.length === 0) {
        showToast('No hay cargas para exportar.', 'error');
        return;
    }

    const exportLang = window.APP_LANG;
    const t = (str) => window.translateText(str, exportLang);

    // Build header row
    const headers = [
        '#',
        t('Descripción'),
        t('Cantidad'),
        t('Potencia Unitaria (W)'),
        t('Potencia Total (W)'),
        t('Horario'),
        t('Horas/Día'),
        t('Energía Día (kWh)'),
        t('Energía Mes (kWh)'),
        t('Energía Año (kWh)'),
        t('Días/Mes'),
        t('Meses/Año'),
        t('Clasificación')
    ];

    // Build data rows
    const rows = APP.state.loads.map((load, idx) => {
        const totalPower = load.quantity * load.power;
        const hours = load.hours || computeHoursFromSlots(load.timeSlots || []);
        const classification = classifyLoad(hours);
        const hoursDisplay = load.timeDisplay || formatHourRanges(hours);
        const hoursPerDay = (load.hoursPerDay !== undefined && load.hoursPerDay !== null) ? load.hoursPerDay : hours.length;
        const dpm = load.daysPerMonth || APP.state.config.daysPerMonth;
        const mpy = load.monthsPerYear || APP.state.config.monthsPerYear;

        const energiaDia = (totalPower * hoursPerDay) / 1000;
        const energiaMes = energiaDia * dpm;
        const energiaAno = energiaMes * mpy;

        return [
            idx + 1,
            load.description,
            load.quantity,
            load.power,
            totalPower,
            hoursDisplay,
            hoursPerDay,
            +energiaDia.toFixed(2),
            +energiaMes.toFixed(2),
            +energiaAno.toFixed(2),
            dpm,
            mpy,
            classification
        ];
    });

    // Create worksheet from array of arrays
    const wsData = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Apply styles to main headers
    const headerStyle = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "F59E0B" } }, // Accent color
        alignment: { horizontal: "center", vertical: "center" }
    };
    
    // The range of the sheet
    const range = XLSX.utils.decode_range(ws['!ref']);
    
    // Style the header row (row 0)
    for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
        if (!ws[cellAddress]) continue;
        ws[cellAddress].s = headerStyle;
    }

    // Set column widths for readability
    ws['!cols'] = [
        { wch: 4 },   // #
        { wch: 25 },  // Descripción
        { wch: 10 },  // Cantidad
        { wch: 18 },  // P. Unitaria
        { wch: 18 },  // P. Total
        { wch: 25 },  // Horario
        { wch: 10 },  // Horas/Día
        { wch: 16 },  // Energía Día (kWh)
        { wch: 16 },  // Energía Mes (kWh)
        { wch: 16 },  // Energía Año (kWh)
        { wch: 10 },  // Días/Mes
        { wch: 10 },  // Meses/Año
        { wch: 14 }   // Clasificación
    ];

    // Add a summary section to the right of the main table
    const summaryStartCol = headers.length + 1; // One blank column as separator
    const profile = calcHourlyProfile();
    const pinst = calcInstalledPower();
    const pmax = calcMaxDemand(profile);
    const ed = calcDailyEnergy(profile);
    const em = calcMonthlyEnergy();
    const ea = calcAnnualEnergy();
    const { unitCost } = APP.state.config;

    const summaryData = [
        [t('Resumen de Indicadores'), ''],
        [t('Potencia Instalada (kW)'), +(pinst / 1000).toFixed(2)],
        [t('Demanda Máxima Simultánea (kW)'), +(pmax / 1000).toFixed(2)],
        [t('Energía Diaria (kWh/día)'), +ed.toFixed(2)],
        [t('Energía Mensual (kWh/mes)'), +em.toFixed(2)],
        [t('Energía Anual (kWh/año)'), +ea.toFixed(2)],
        ['', ''],
        [t('Costo Unitario CU (COP/kWh)'), unitCost],
        [t('Costo Diario (COP)'), Math.round(ed * unitCost)],
        [t('Costo Mensual (COP)'), Math.round(em * unitCost)],
        [t('Costo Anual (COP)'), Math.round(ea * unitCost)]
    ];

    XLSX.utils.sheet_add_aoa(ws, summaryData, { origin: { r: 0, c: summaryStartCol } });

    // Style summary headers
    const summaryTitleStyle = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4F46E5" } }, // Indigo color
        alignment: { horizontal: "center" }
    };
    
    const summaryLabelStyle = {
        font: { bold: true }
    };

    // Apply summary styles
    const summaryTitleCell = XLSX.utils.encode_cell({ r: 0, c: summaryStartCol });
    if (ws[summaryTitleCell]) ws[summaryTitleCell].s = summaryTitleStyle;
    
    // Merge title cell (Resumen de Indicadores) over the two columns
    if (!ws['!merges']) ws['!merges'] = [];
    ws['!merges'].push({ s: { r: 0, c: summaryStartCol }, e: { r: 0, c: summaryStartCol + 1 } });
    
    // Apply bold to summary labels and number formatting to values
    for(let r = 1; r < summaryData.length; r++) {
        const labelCell = XLSX.utils.encode_cell({ r: r, c: summaryStartCol });
        if (ws[labelCell] && ws[labelCell].v !== '') {
            ws[labelCell].s = summaryLabelStyle;
        }
        
        const valueCell = XLSX.utils.encode_cell({ r: r, c: summaryStartCol + 1 });
        if (ws[valueCell] && typeof ws[valueCell].v === 'number') {
            const labelStr = String(summaryData[r][0]);
            if (labelStr.includes('(COP)')) {
                // Currency format for COP
                ws[valueCell].z = '"$"#,##0 "COP"';
            } else if (labelStr.includes('COP/kWh')) {
                // Currency format for unit cost
                ws[valueCell].z = '"$"#,##0.00';
            }
        }
    }
    
    // Add column widths for summary columns
    ws['!cols'][summaryStartCol - 1] = { wch: 2 }; // Separator column
    ws['!cols'][summaryStartCol] = { wch: 35 }; // Label column
    ws['!cols'][summaryStartCol + 1] = { wch: 15 }; // Value column

    // Add project info sheet
    const wsInfo = XLSX.utils.aoa_to_sheet([
        [t('Información del Proyecto')],
        [t('Nombre del Proyecto'), APP.state.project.name || '—'],
        [t('ID del Proyecto'), APP.state.project.id || '—'],
        [t('Integrantes'), APP.state.project.members || '—'],
        [t('Fecha'), APP.state.project.date || '—'],
        [t('Tipo de Aplicación'), t(APP.state.project.systemType) || '—'],
        [''],
        [t('Configuración Día / Noche')],
        [t('Inicio del Día'), `${String(APP.state.config.dayStart).padStart(2, '0')}:00`],
        [t('Inicio de la Noche'), `${String(APP.state.config.dayEnd).padStart(2, '0')}:00`],
        [t('Días de operación / mes'), APP.state.config.daysPerMonth],
        [t('Meses de operación / año'), APP.state.config.monthsPerYear],
        [t('Costo Unitario CU (COP/kWh)'), APP.state.config.unitCost]
    ]);
    wsInfo['!cols'] = [{ wch: 25 }, { wch: 35 }];
    
    // Style Project Info sheet
    const infoTitleCell1 = XLSX.utils.encode_cell({ r: 0, c: 0 });
    const infoTitleCell2 = XLSX.utils.encode_cell({ r: 7, c: 0 });
    if(wsInfo[infoTitleCell1]) wsInfo[infoTitleCell1].s = summaryTitleStyle;
    if(wsInfo[infoTitleCell2]) wsInfo[infoTitleCell2].s = summaryTitleStyle;
    
    for(let r = 1; r <= 5; r++) {
        const cell = XLSX.utils.encode_cell({r: r, c: 0});
        if(wsInfo[cell]) wsInfo[cell].s = summaryLabelStyle;
    }
    for(let r = 8; r <= 12; r++) {
        const cell = XLSX.utils.encode_cell({r: r, c: 0});
        if(wsInfo[cell]) wsInfo[cell].s = summaryLabelStyle;
    }

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, t('Cuadro de Cargas'));
    XLSX.utils.book_append_sheet(wb, wsInfo, t('Proyecto'));

    // Generate filename
    const name = APP.state.project.name
        ? APP.state.project.name.replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ _-]/g, '').replace(/\s+/g, '_')
        : 'proyecto';

    XLSX.writeFile(wb, `SolarCalc_${name}.xlsx`);
    showToast('Archivo Excel exportado correctamente.', 'success');
}

// ───── IMPORT ─────

function importExcel(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = new Uint8Array(e.target.result);
            const wb = XLSX.read(data, { type: 'array' });

            // Read the first sheet (Cuadro de Cargas)
            const wsName = wb.SheetNames[0];
            const ws = wb.Sheets[wsName];
            const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });

            if (!rows || rows.length < 2) {
                showToast('El archivo está vacío o no tiene datos válidos.', 'error');
                return;
            }

            // Try to find the header row
            let headerIdx = -1;
            for (let i = 0; i < Math.min(rows.length, 5); i++) {
                const row = rows[i];
                if (row && row.some(cell =>
                    typeof cell === 'string' &&
                    (cell.toLowerCase().includes('descripción') || cell.toLowerCase().includes('descripcion'))
                )) {
                    headerIdx = i;
                    break;
                }
            }

            if (headerIdx === -1) {
                showToast('No se encontró la cabecera del cuadro de cargas (columna "Descripción").', 'error');
                return;
            }

            const header = rows[headerIdx];
            // Find column indices by name matching
            const colDesc = findCol(header, ['descripción', 'descripcion', 'nombre', 'carga', 'description', 'desc', 'name', 'load']);
            const colQty = findCol(header, ['cantidad', 'cant', 'qty', 'quantity']);
            const colPower = findCol(header, ['potencia unitaria', 'p. unit', 'potencia', 'watts', 'w', 'power', 'unit power']);
            const colHorario = findCol(header, ['horario', 'horas', 'franja', 'schedule', 'time']);

            if (colDesc === -1) {
                showToast('No se encontró la columna de Descripción.', 'error');
                return;
            }

            // Parse data rows
            const newLoads = [];
            let imported = 0;
            let skipped = 0;

            for (let i = headerIdx + 1; i < rows.length; i++) {
                const row = rows[i];
                if (!row || row.length === 0) continue;

                const desc = String(row[colDesc] || '').trim();
                if (!desc) continue;

                // Check if it's a summary row
                if (desc.toLowerCase().includes('resumen') ||
                    desc.toLowerCase().includes('potencia instalada') ||
                    desc.toLowerCase().includes('costo')) {
                    break; // We've reached the summary section
                }

                const qty = colQty !== -1 ? parseInt(row[colQty]) : 1;
                const power = colPower !== -1 ? parseInt(row[colPower]) : 0;

                if (isNaN(qty) || qty < 1 || isNaN(power) || power <= 0) {
                    skipped++;
                    continue;
                }

                // Parse hours from horario column
                let timeSlots = [];
                let hours = [];
                if (colHorario !== -1 && row[colHorario]) {
                    const parsed = parseHorarioString(String(row[colHorario]));
                    timeSlots = parsed.timeSlots;
                    hours = parsed.hours;
                }

                // If no hours parsed, default to all day
                if (hours.length === 0) {
                    timeSlots = [{ start: 0, end: 0 }];
                    hours = Array.from({ length: 24 }, (_, i) => i);
                }

                newLoads.push({
                    id: Date.now() + Math.random(),
                    description: desc,
                    quantity: qty,
                    power: power,
                    timeSlots: timeSlots,
                    hours: hours
                });
                imported++;
            }

            if (imported === 0) {
                showToast('No se encontraron cargas válidas en el archivo.', 'error');
                return;
            }

            // Replace or merge?
            if (APP.state.loads.length > 0) {
                if (confirm(`Se encontraron ${imported} cargas en el archivo.\n\n¿Desea REEMPLAZAR las ${APP.state.loads.length} cargas actuales?\n\n(Cancelar para agregar a las existentes)`)) {
                    APP.state.loads = newLoads;
                } else {
                    APP.state.loads.push(...newLoads);
                }
            } else {
                APP.state.loads = newLoads;
            }

            // Cancel any editing and refresh
            APP.editingId = null;
            renderLoads();
            recalculateAll();

            let msg = `${imported} carga(s) importada(s) correctamente.`;
            if (skipped > 0) msg += ` ${skipped} fila(s) omitida(s) por datos inválidos.`;
            showToast(msg, 'success');

        } catch (err) {
            console.error('Error importing Excel:', err);
            showToast('Error al leer el archivo Excel. Verifique el formato.', 'error');
        }
    };
    reader.readAsArrayBuffer(file);

    // Reset file input
    event.target.value = '';
}

// ───── HELPERS ─────

/** Find the index of a column by matching header text against multiple possible names */
function findCol(header, names) {
    for (let i = 0; i < header.length; i++) {
        const cell = String(header[i] || '').toLowerCase().trim();
        for (const name of names) {
            if (cell.includes(name)) return i;
        }
    }
    return -1;
}

/** Parse a horario string like "06:00–18:00, 20:00–22:00" into timeSlots and hours */
function parseHorarioString(str) {
    const timeSlots = [];
    const hoursSet = new Set();

    // Match patterns like 06:00–18:00 or 06:00-18:00 or 6-18
    const rangePattern = /(\d{1,2}):?(\d{2})?\s*[–\-—]\s*(\d{1,2}):?(\d{2})?/g;
    let match;

    while ((match = rangePattern.exec(str)) !== null) {
        const start = parseInt(match[1]);
        const end = parseInt(match[3]);

        if (start >= 0 && start < 24 && end >= 0 && end < 24) {
            timeSlots.push({ start, end });

            // Compute individual hours
            if (start === end) {
                for (let h = 0; h < 24; h++) hoursSet.add(h);
            } else {
                let h = start;
                while (h !== end) {
                    hoursSet.add(h);
                    h = (h + 1) % 24;
                }
            }
        }
    }

    return {
        timeSlots,
        hours: Array.from(hoursSet).sort((a, b) => a - b)
    };
}
