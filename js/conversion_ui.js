/* ═══════════════════════════════════════════════
   conversion_ui.js — UI Controller for Reto 03
   Renders inherited data, branch selector, equipment comparator,
   interactive battery table & SVG visualizer, balance of closure, and catalog modal.
   ═══════════════════════════════════════════════ */

(function () {
    'use strict';

    // ── Lucide SVG Icons (Zero Emojis) ──
    const ICONS = {
        zap: '<svg class="lucide-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
        sun: '<svg class="lucide-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>',
        battery: '<svg class="lucide-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="10" x="2" y="7" rx="2" ry="2"/><line x1="22" x2="22" y1="11" y2="13"/></svg>',
        cpu: '<svg class="lucide-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/></svg>',
        externalLink: '<svg class="lucide-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>',
        refresh: '<svg class="lucide-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>',
        check: '<svg class="lucide-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
    };

    const $ = id => document.getElementById(id);
    const num = (v, d = 2) => Number.isFinite(Number(v)) ? Number(v).toLocaleString('es-CO', { minimumFractionDigits: d, maximumFractionDigits: d }) : '—';
    const esc = str => String(str == null ? '' : str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

    function formatSystemType(st) {
        switch (st) {
            case 'off-grid': return 'Off-Grid (Aislado)';
            case 'on-grid': return 'On-Grid (Conectado a Red)';
            case 'hybrid-off-grid': return 'Híbrido Off-Grid';
            case 'hybrid-on-grid': return 'Híbrido On-Grid';
            default: return st || 'Off-Grid (Aislado)';
        }
    }

    function initConversionUI() {
        bindControls();
        renderConversion();
    }

    function bindControls() {
        // Selector de Rama
        const branchStorageBtn = $('conv-branch-storage');
        const branchGridBtn = $('conv-branch-grid');

        if (branchStorageBtn && branchGridBtn) {
            branchStorageBtn.addEventListener('click', () => setBranch('storage'));
            branchGridBtn.addEventListener('click', () => setBranch('grid'));
        }

        // Inputs reactivos numéricos de configuración
        const inputIds = [
            'conv-bus-voltage', 'conv-autonomy', 'conv-dod',
            'conv-temp-factor', 'conv-dcac-min', 'conv-dcac-max'
        ];

        inputIds.forEach(id => {
            const el = $(id);
            if (el) {
                el.addEventListener('change', handleInputChange);
                el.addEventListener('input', handleInputChange);
            }
        });

        // Botón de gestión de catálogo
        const btnCatalogModal = $('conv-btn-manage-catalog');
        if (btnCatalogModal) {
            btnCatalogModal.addEventListener('click', openCatalogModal);
        }

        // Click en fondo de modal para cerrar
        const catalogModal = $('conv-catalog-modal');
        if (catalogModal) {
            catalogModal.addEventListener('click', e => {
                if (e.target === catalogModal) closeCatalogModal();
            });
        }
    }

    function setBranch(branch, syncProject = true) {
        if (!window.APP?.state?.conversion) return;
        APP.state.conversion.branch = branch;

        if (syncProject) {
            const sysTypeEl = $('system-type');
            if (branch === 'grid') {
                APP.state.project.systemType = 'on-grid';
                if (sysTypeEl) sysTypeEl.value = 'on-grid';
            } else {
                if (APP.state.project.systemType === 'on-grid') {
                    APP.state.project.systemType = 'off-grid';
                    if (sysTypeEl) sysTypeEl.value = 'off-grid';
                }
            }
        }

        const branchStorageBtn = $('conv-branch-storage');
        const branchGridBtn = $('conv-branch-grid');
        if (branchStorageBtn && branchGridBtn) {
            branchStorageBtn.classList.toggle('active', branch === 'storage');
            branchGridBtn.classList.toggle('active', branch === 'grid');
        }

        renderConversion();
    }

    function handleInputChange() {
        if (!window.APP?.state?.conversion) return;
        const conv = APP.state.conversion;

        const busV = $('conv-bus-voltage');
        if (busV) conv.busVoltage = Number(busV.value) || 48;

        conv.inverterEfficiency = 0.90;

        const autoD = $('conv-autonomy');
        if (autoD) conv.autonomyDays = Math.max(0.5, Number(autoD.value) || 2.0);

        const dodD = $('conv-dod');
        if (dodD) conv.dodDesign = Math.max(0.10, Math.min(0.95, (Number(dodD.value) || 50) / 100));

        const tf = $('conv-temp-factor');
        if (tf) conv.tempFactor = Math.max(0.5, Math.min(1.0, Number(tf.value) || 1.0));

        const dcMin = $('conv-dcac-min');
        if (dcMin) conv.dcacMin = Math.max(0.5, Number(dcMin.value) || 1.0);

        const dcMax = $('conv-dcac-max');
        if (dcMax) conv.dcacMax = Math.max(conv.dcacMin, Number(dcMax.value) || 1.3);

        conv.pumpStartFactor = 1.0;

        renderConversion();
    }

    /**
     * Aplica el ajuste interactivo de módulos derivados del balance de cierre (RF-34).
     */
    function applyModuleAdjustment() {
        if (!window.APP?.state?.conversion || !window.CONVERSION_CALC) return;
        const calc = CONVERSION_CALC.calculateAll();
        const activeBat = calc.activeBattery;
        const addModules = activeBat.deltaModulesAnnual || 0;

        if (addModules <= 0) {
            if (typeof showToast === 'function') {
                showToast('El generador actual ya cubre la energía requerida con las eficiencias del sistema.', 'info');
            }
            return;
        }

        APP.state.conversion.balanceAdjusted = true;
        APP.state.conversion.additionalModules = addModules;

        if (typeof showToast === 'function') {
            showToast(`Ajuste aplicado: se añadieron ${addModules} módulo(s) al generador para cubrir el balance.`, 'success');
        }

        renderConversion();
    }

    function revertModuleAdjustment() {
        if (!window.APP?.state?.conversion) return;
        APP.state.conversion.balanceAdjusted = false;
        APP.state.conversion.additionalModules = 0;
        APP.state.conversion.customStringNs = null;

        if (typeof showToast === 'function') {
            showToast('Ajuste de balance revertido al generador original del Reto 02.', 'info');
        }

        renderConversion();
    }

    function applyStringReconfig(ns, np) {
        if (!window.APP?.state?.conversion) return;
        APP.state.conversion.customStringNs = ns;
        if (typeof showToast === 'function') {
            showToast(`Configuración de cadenas actualizada a ${ns}S × ${np}P para el equipo seleccionado.`, 'success');
        }
        renderConversion();
    }

    /**
     * Renderizado principal del panel de Conversión y Baterías.
     */
    function renderConversion() {
        if (!window.CONVERSION_CALC) return;
        const calc = CONVERSION_CALC.calculateAll();
        const inputs = calc.inputs;
        const thermal = calc.thermal;
        const isStorage = inputs.branch === 'storage';

        // Actualizar visibilidad de secciones
        const storageEls = document.querySelectorAll('.conv-storage-only');
        const gridEls = document.querySelectorAll('.conv-grid-only');

        storageEls.forEach(el => el.style.display = isStorage ? '' : 'none');
        gridEls.forEach(el => el.style.display = isStorage ? 'none' : '');

        // 1. Renderizar Banner de Datos Heredados (con Tipo de Aplicación sincronizado)
        renderInheritedBanner(inputs, thermal);

        // 2. Renderizar Verificación de Arreglo y Separación de Corrientes (Full Width)
        renderArrayChecks(inputs, thermal);

        // 3. Renderizar Comparador de Equipos (Controladores + Inversores Híbridos en almacenamiento, o Inversores en red)
        if (isStorage) {
            renderControllersTable(calc.controllerResults, inputs, thermal);
            renderBatteryBankSection(calc);
        } else {
            renderInvertersTable(calc.inverterResults, inputs, thermal);
        }
    }

    function renderInheritedBanner(inputs, thermal) {
        const host = $('conv-inherited-banner');
        if (!host) return;

        host.innerHTML = `
            <div class="kpi-card">
                <div class="kpi-info">
                    <span class="kpi-label">Energía Diaria (Ed)</span>
                    <span class="kpi-value">${num(inputs.edKWh, 3)} kWh/día</span>
                    <small>Demanda calculada en Reto 01</small>
                </div>
            </div>
            <div class="kpi-card">
                <div class="kpi-info">
                    <span class="kpi-label">Demanda Máxima (Pmax)</span>
                    <span class="kpi-value">${num(inputs.pmax, 0)} W</span>
                    <small>A las ${String(inputs.hpmax).padStart(2, '0')}:00 h</small>
                </div>
            </div>
            <div class="kpi-card">
                <div class="kpi-info">
                    <span class="kpi-label">Generador Instalado</span>
                    <span class="kpi-value">${num(inputs.ppkInstKW, 2)} kWp</span>
                    <small>${inputs.totalModules} módulos (${inputs.ns}S × ${inputs.np}P)</small>
                </div>
            </div>
            <div class="kpi-card">
                <div class="kpi-info">
                    <span class="kpi-label">Recurso y Desempeño</span>
                    <span class="kpi-value">${num(inputs.hspAnnual, 2)} h / PR ${num(inputs.pr, 2)}</span>
                    <small>HSP crítico: ${num(inputs.hspCritical, 2)} h</small>
                </div>
            </div>
            <div class="kpi-card" style="border-left: 3px solid var(--accent);">
                <div class="kpi-info">
                    <span class="kpi-label">Tipo de Aplicación</span>
                    <span class="kpi-value" style="color: var(--accent); font-size: 1.15rem;">${formatSystemType(inputs.systemType)}</span>
                    <small>${inputs.branch === 'storage' ? 'Con Almacenamiento / Híbrido' : 'Conectado a Red (Sin Almacenamiento)'}</small>
                </div>
            </div>
        `;
    }

    /**
     * Verificación eléctrica del arreglo y diferenciación de corrientes NTC 2050
     * Diseño a todo lo ancho: texto arriba ocupando todo el ancho, y 3 tarjetas distribuidas horizontalmente.
     */
    function renderArrayChecks(inputs, thermal) {
        const host = $('conv-array-checks');
        if (!host) return;

        host.innerHTML = `
            <div class="form-grid cols-3" style="margin-bottom: 1rem;">
                <div class="kpi-card">
                    <div class="kpi-info">
                        <span class="kpi-label">Voc Arreglo en Frío (${inputs.tmin}°C)</span>
                        <span class="kpi-value">${num(thermal.vocColdArray, 1)} V</span>
                        <small>Voc módulo: ${num(thermal.vocColdMod, 2)} V</small>
                    </div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-info">
                        <span class="kpi-label">Vmp en Caliente (${num(inputs.tcell, 1)}°C)</span>
                        <span class="kpi-value">${num(thermal.vmpHotArray, 1)} V</span>
                        <small>Vmp en frío: ${num(thermal.vmpColdArray, 1)} V</small>
                    </div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-info">
                        <span class="kpi-label">Corriente Cortocircuito (Isc)</span>
                        <span class="kpi-value">${num(thermal.iscArray, 1)} A</span>
                        <small>Imp del arreglo: ${num(thermal.impArray, 1)} A</small>
                    </div>
                </div>
            </div>

            <!-- Tarjeta de Diferenciación de Corrientes: Full Width -->
            <div class="card" style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-left: 4px solid var(--accent); box-shadow: var(--shadow-sm); margin-bottom: 1rem; width: 100%;">
                <div class="card-body" style="padding: 1.25rem 1.5rem;">
                    <div style="width: 100%; margin-bottom: 1.15rem;">
                        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.45rem;">
                            <span style="color: var(--accent); display: flex;">
                                <svg class="lucide-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="m17 5-5-3-5 3"/><path d="m17 19-5 3-5-3"/></svg>
                            </span>
                            <strong style="color: var(--text-primary); font-size: 1.05rem; font-weight: 700;">
                                Diferenciación de Corrientes (RF-29 / NTC 2050 art. 690-8)
                            </strong>
                        </div>
                        <p style="color: var(--text-secondary); font-size: 0.88rem; margin: 0; line-height: 1.5; width: 100%;">
                            La corriente de salida hacia el banco evalúa la capacidad de placa del regulador e inversor cargador (sin factor 1.25). Por su parte, los conductores y dispositivos de sobrecorriente requieren los factores normativos de diseño NTC de <strong>1.25×</strong> para la salida y <strong>1.5625×</strong> (1.25 × 1.25 × Isc) para el circuito de entrada del generador FV.
                        </p>
                    </div>

                    <!-- 3 Cajas distribuidas equitativamente a lo largo de todo el ancho -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.25rem; width: 100%;">
                        <div style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.35); border-radius: var(--radius-sm); padding: 0.9rem 1.1rem; text-align: center;">
                            <span style="font-size: 0.78rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; display: block; margin-bottom: 0.35rem; letter-spacing: 0.04em;">
                                Hacia Banco (Ppico / Vnom)
                            </span>
                            <div style="font-size: 1.6rem; font-weight: 800; color: var(--accent); line-height: 1.2;">
                                ${num(thermal.iSalidaBanco, 1)} A
                            </div>
                            <small style="font-size: 0.75rem; color: var(--text-muted); display: block; margin-top: 0.3rem;">
                                Capacidad de placa nominal (Sin factor 1.25)
                            </small>
                        </div>

                        <div style="background: var(--bg-input); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 0.9rem 1.1rem; text-align: center;">
                            <span style="font-size: 0.78rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; display: block; margin-bottom: 0.35rem; letter-spacing: 0.04em;">
                                Conductores Salida (NTC 690-8)
                            </span>
                            <div style="font-size: 1.6rem; font-weight: 800; color: var(--text-primary); line-height: 1.2;">
                                ${num(thermal.iDisenoSalida, 1)} A
                            </div>
                            <small style="font-size: 0.75rem; color: var(--text-muted); display: block; margin-top: 0.3rem;">
                                Calibre y protecciones de salida (Factor 1.25×)
                            </small>
                        </div>

                        <div style="background: var(--bg-input); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 0.9rem 1.1rem; text-align: center;">
                            <span style="font-size: 0.78rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; display: block; margin-bottom: 0.35rem; letter-spacing: 0.04em;">
                                Entrada FV Generador (NTC 690-8)
                            </span>
                            <div style="font-size: 1.6rem; font-weight: 800; color: var(--text-primary); line-height: 1.2;">
                                ${num(thermal.iDisenoEntrada, 1)} A
                            </div>
                            <small style="font-size: 0.75rem; color: var(--text-muted); display: block; margin-top: 0.3rem;">
                                Calibre y protecciones circuito DC (Factor 1.5625× Isc)
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Tabla Comparativa de Reguladores MPPT e Inversores Híbridos (INV-1, INV-2, INV-3 incluidos en almacenamiento)
     */
    function renderControllersTable(results, inputs, thermal) {
        const host = $('conv-controllers-table-container');
        if (!host) return;

        const rows = results.map(r => {
            const dev = r.device;
            const isRef = !!dev.isReference;
            const isSelected = dev.id === inputs.selectedControllerId;
            const isHybrid = !!(r.isHybrid || dev.isHybrid);

            const reasons = Array.isArray(r.failureReasons) ? r.failureReasons : [];
            const verdict = r.verdict || 'cumple';

            let verdictBadge = '';
            if (verdict === 'cumple') {
                verdictBadge = `<span class="badge" style="background: rgba(16, 185, 129, 0.15); color: var(--success); font-weight: 700;">Cumple</span>`;
            } else if (verdict === 'alerta') {
                verdictBadge = `<span class="badge" style="background: rgba(245, 158, 11, 0.15); color: var(--warning); font-weight: 700;">Alerta</span>`;
            } else {
                verdictBadge = `<span class="badge" style="background: rgba(239, 68, 68, 0.15); color: var(--error); font-weight: 700;">No Cumple</span>`;
            }

            // Enlace a ficha técnica
            let refLink = '';
            if (isRef || !dev.url) {
                refLink = `<span class="badge" style="background: rgba(148, 163, 184, 0.15); color: var(--text-muted); font-size: 0.75rem;">Referencia TdR (Ideal)</span>`;
            } else {
                refLink = `
                    <a href="${dev.url}" target="_blank" rel="noopener noreferrer" class="btn btn-sm" onclick="event.stopPropagation()" style="background: #0284c7; color: #fff; padding: 0.3rem 0.6rem; font-size: 0.78rem; text-decoration: none; border-radius: var(--radius-xs); display: inline-flex; align-items: center; gap: 0.3rem;">
                        ${ICONS.externalLink} Ficha Oficial
                    </a>
                `;
            }

            // Propuesta de reconfiguración
            let reconfigAction = '';
            if (r.proposedConfig) {
                reconfigAction = `
                    <div style="margin-top: 0.4rem;">
                        <button type="button" class="btn btn-sm btn-secondary" onclick="event.stopPropagation(); window.CONVERSION_UI.applyReconfig(${r.proposedConfig.ns}, ${r.proposedConfig.np})" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; border-color: var(--accent); color: var(--accent);">
                            Probar ${r.proposedConfig.ns}S × ${r.proposedConfig.np}P
                        </button>
                    </div>
                `;
            }

            const categoryBadge = isHybrid
                ? `<span class="badge" style="background: rgba(168, 85, 247, 0.15); color: #c084fc; font-weight: 700; font-size: 0.72rem;">Inversor Híbrido</span>`
                : `<span class="badge" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; font-weight: 700; font-size: 0.72rem;">Regulador MPPT</span>`;

            return `
                <tr style="cursor: pointer; ${isSelected ? 'background: rgba(245, 158, 11, 0.12); border-left: 4px solid var(--accent);' : ''}" onclick="window.CONVERSION_UI.selectController('${dev.id}')">
                    <td>
                        <div style="display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap;">
                            <strong>${esc(dev.name)}</strong>
                            ${categoryBadge}
                        </div>
                        <div style="font-size: 0.74rem; color: var(--text-muted); margin-top: 0.15rem;">
                            ${esc(dev.manufacturer || '')} - ${esc(dev.model || '')}
                        </div>
                        <div style="margin-top: 0.25rem;">
                            ${refLink}
                        </div>
                    </td>
                    <td style="white-space: nowrap;">
                        <div>Voc Máx: <strong>${dev.maxPVVoc} V</strong></div>
                        <div style="font-size: 0.74rem; color: var(--text-secondary); margin-top: 0.15rem;">Serie máx: <strong>${num(r.nsMax, 0)} mód.</strong></div>
                    </td>
                    <td style="white-space: nowrap;">
                        <div>Salida: <strong>${dev.maxChargeA || dev.maxPVInputA || 50} A</strong></div>
                        <div style="font-size: 0.74rem; color: var(--text-secondary); margin-top: 0.15rem;">Isc Entrada: ${dev.maxPVInputA || dev.maxIscA || 50} A</div>
                    </td>
                    <td>
                        <div style="margin-bottom: 0.2rem;">${verdictBadge}</div>
                        <div style="font-size: 0.74rem; line-height: 1.35; color: ${verdict === 'no_cumple' ? 'var(--error)' : (verdict === 'alerta' ? 'var(--warning)' : 'var(--success)')}; font-weight: 600;">
                            ${reasons.length > 0 ? reasons.join(' · ') : 'Compatible con el banco y arreglo FV'}
                        </div>
                        ${reconfigAction}
                    </td>
                    <td style="text-align: center; white-space: nowrap;">
                        <button type="button" class="btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}" onclick="event.stopPropagation(); window.CONVERSION_UI.selectController('${dev.id}')" style="padding: 0.3rem 0.65rem; font-size: 0.78rem;">
                            ${isSelected ? `${ICONS.check} Activo` : 'Seleccionar'}
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        host.innerHTML = `
            <div class="table-wrapper">
                <table class="data-table data-table-compact">
                    <thead>
                        <tr>
                            <th style="width: 28%;">Equipo y Tipo</th>
                            <th style="width: 18%;">Límites DC Arreglo</th>
                            <th style="width: 18%;">Corrientes (Salida / FV)</th>
                            <th style="width: 24%;">Veredicto y Diagnóstico</th>
                            <th style="width: 12%; text-align: center;">Selección</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            </div>
        `;
    }

    /**
     * Tabla Comparativa e Interactiva de Baterías
     * Permite hacer clic en cualquier modelo para seleccionarlo y re-renderizar el circuito SVG reactivamente.
     */
    function renderBatteriesTable(batteryEvaluations, inputs) {
        const host = $('conv-batteries-table-container');
        if (!host) return;

        const rows = batteryEvaluations.map(be => {
            const bat = be.battery;
            const isRef = !!bat.isReference;
            const isSelected = bat.id === inputs.selectedBatteryId;

            const reasons = Array.isArray(be.failureReasons) ? be.failureReasons : [];
            const verdict = be.verdict || (be.dodExceeded ? 'alerta' : 'cumple');

            let verdictBadge = '';
            if (verdict === 'cumple') {
                verdictBadge = `<span class="badge" style="background: rgba(16, 185, 129, 0.15); color: var(--success); font-weight: 700;">Cumple</span>`;
            } else if (verdict === 'alerta') {
                verdictBadge = `<span class="badge" style="background: rgba(245, 158, 11, 0.15); color: var(--warning); font-weight: 700;">Alerta</span>`;
            } else {
                verdictBadge = `<span class="badge" style="background: rgba(239, 68, 68, 0.15); color: var(--error); font-weight: 700;">No Cumple</span>`;
            }

            let refLink = '';
            if (isRef || !bat.url) {
                refLink = `<span class="badge" style="background: rgba(148, 163, 184, 0.15); color: var(--text-muted); font-size: 0.75rem;">Referencia TdR (Ideal)</span>`;
            } else {
                refLink = `
                    <a href="${bat.url}" target="_blank" rel="noopener noreferrer" class="btn btn-sm" onclick="event.stopPropagation()" style="background: #0284c7; color: #fff; padding: 0.3rem 0.6rem; font-size: 0.78rem; text-decoration: none; border-radius: var(--radius-xs); display: inline-flex; align-items: center; gap: 0.3rem;">
                        ${ICONS.externalLink} Ficha Oficial
                    </a>
                `;
            }

            return `
                <tr style="cursor: pointer; ${isSelected ? 'background: rgba(245, 158, 11, 0.12); border-left: 4px solid var(--accent);' : ''}" onclick="window.CONVERSION_UI.selectBattery('${bat.id}')">
                    <td>
                        <div style="display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap;">
                            <strong>${esc(bat.name)}</strong>
                            <span class="badge" style="font-size: 0.7rem; padding: 0.1rem 0.4rem;">${esc(bat.technology || 'N/A')}</span>
                        </div>
                        <div style="font-size: 0.74rem; color: var(--text-muted); margin-top: 0.15rem;">
                            ${esc(bat.manufacturer || '')} · ${bat.voltage}V / ${bat.ah}Ah · Vida: ${bat.lifeYears} años
                        </div>
                        <div style="margin-top: 0.25rem;">
                            ${refLink}
                        </div>
                    </td>
                    <td style="white-space: nowrap;">
                        <strong style="color: var(--accent); font-size: 0.88rem;">${be.totalBatteries} unid.</strong>
                        <span style="font-size: 0.74rem; color: var(--text-secondary); font-weight: 600;">(${be.nsBat}S × ${be.npBat}P)</span>
                        <div style="font-size: 0.73rem; color: var(--text-muted); margin-top: 0.15rem;">
                            ${num(be.kwhInst, 2)} kWh · ${be.ahInst} Ah (${num(be.vBancoReal, 1)}V)
                        </div>
                    </td>
                    <td style="white-space: nowrap;">
                        <div style="font-size: 0.8rem; font-weight: 700; color: ${be.dodExceeded ? 'var(--warning)' : 'var(--success)'};">
                            DoD: ${num(be.dodFin * 100, 1)}% <span style="font-size: 0.72rem; font-weight: 500; color: var(--text-muted);">(Diseño ${Math.round((be.dodDesign || bat.dod || inputs.dodDesign || 0.5) * 100)}%)</span>
                        </div>
                        <div style="font-size: 0.74rem; color: ${be.chargeRateOk ? 'var(--text-secondary)' : 'var(--error)'}; font-weight: 600; margin-top: 0.15rem;">
                            Carga: ${num(be.cCharge, 3)} C <span style="font-size: 0.72rem; font-weight: 500; color: var(--text-muted);">(Máx ${bat.maxChargeC || 0.20}C)</span>
                        </div>
                    </td>
                    <td>
                        <div style="margin-bottom: 0.2rem;">${verdictBadge}</div>
                        <div style="font-size: 0.74rem; line-height: 1.35; color: ${verdict === 'no_cumple' ? 'var(--error)' : (verdict === 'alerta' ? 'var(--warning)' : 'var(--success)')}; font-weight: 600;">
                            ${reasons.length > 0 ? reasons.join(' · ') : 'Operación nominal óptima'}
                        </div>
                    </td>
                    <td style="text-align: center; white-space: nowrap;">
                        <button type="button" class="btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}" onclick="event.stopPropagation(); window.CONVERSION_UI.selectBattery('${bat.id}')" style="padding: 0.3rem 0.65rem; font-size: 0.78rem;">
                            ${isSelected ? `${ICONS.check} Activa` : 'Seleccionar'}
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        host.innerHTML = `
            <div class="table-wrapper">
                <table class="data-table data-table-compact">
                    <thead>
                        <tr>
                            <th style="width: 28%;">Batería y Ficha</th>
                            <th style="width: 20%;">Arreglo Banco</th>
                            <th style="width: 20%;">DoD y Tasa C</th>
                            <th style="width: 20%;">Veredicto y Diagnóstico</th>
                            <th style="width: 12%; text-align: center;">Selección</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            </div>
        `;
    }

    /**
     * Sección de Almacenamiento completa: Tabla interactiva + KPIs + Visualizador SVG + Balance
     */
    function renderBatteryBankSection(calc) {
        const active = calc.activeBattery;
        const inputs = calc.inputs;

        // 1. Renderizar la tabla interactiva de baterías
        renderBatteriesTable(calc.batteryEvaluations, inputs);

        // 2. Renderizar KPIs del banco seleccionado
        const kpiHost = $('conv-battery-kpis');
        if (kpiHost) {
            kpiHost.innerHTML = `
                <div class="kpi-card">
                    <div class="kpi-info">
                        <span class="kpi-label">Capacidad Requerida</span>
                        <span class="kpi-value">${num(active.cnWh / 1000, 2)} kWh</span>
                        <small>${num(active.cnAh, 1)} Ah a ${inputs.busVoltage} V</small>
                    </div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-info">
                        <span class="kpi-label">Baterías Instaladas (${esc(active.battery.name)})</span>
                        <span class="kpi-value" style="color: var(--accent);">${active.totalBatteries} unid.</span>
                        <small>${active.nsBat} en serie × ${active.npBat} en paralelo</small>
                    </div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-info">
                        <span class="kpi-label">Energía Real Instalada</span>
                        <span class="kpi-value">${num(active.kwhInst, 2)} kWh</span>
                        <small>${active.ahInst} Ah a ${num(active.vBancoReal, 1)} V nominales</small>
                    </div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-info">
                        <span class="kpi-label">DoD al Fin de Autonomía</span>
                        <span class="kpi-value" style="color: ${active.dodExceeded ? 'var(--warning)' : 'var(--success)'};">${num(active.dodFin * 100, 1)} %</span>
                        <small>Diseño: ${Math.round((active.dodDesign || active.battery.dod || inputs.dodDesign || 0.5) * 100)}% | Diario: ${num(active.dodDiario * 100, 1)}%</small>
                    </div>
                </div>
            `;
        }

        // 3. Renderizar Esquema Visual SVG del Banco con alta legibilidad
        renderBatteryVisual(active);

        // 4. Renderizar Balance de Cierre (RF-34) y Recuperación (RF-35)
        renderBalanceCard(active, inputs);
    }

    /**
     * Dibuja el circuito serie y paralelo de baterías en SVG con alta nitidez y contraste.
     */
    function renderBatteryVisual(active) {
        const host = $('conv-battery-visual');
        if (!host) return;

        const maxSeriesShown = Math.min(active.nsBat, 6);
        const maxParallelShown = Math.min(active.npBat, 4);

        const batWidth = 52;
        const batHeight = 32;
        const spacingX = 66; // 52 + 14 puente
        const startX = 26;

        let svgContent = '';
        for (let p = 0; p < maxParallelShown; p++) {
            const yPos = 16 + p * 44;
            let rowUnits = '';
            for (let s = 0; s < maxSeriesShown; s++) {
                const xPos = startX + s * spacingX;
                rowUnits += `
                    <g>
                        <!-- Cuerpo compacto de batería -->
                        <rect x="${xPos}" y="${yPos}" width="${batWidth}" height="${batHeight}" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1.8"/>
                        <!-- Terminal superior -->
                        <rect x="${xPos + 19}" y="${yPos - 4}" width="14" height="4" rx="1.5" fill="#94a3b8"/>
                        <!-- Textos nítidos -->
                        <text x="${xPos + batWidth / 2}" y="${yPos + 14}" font-size="10.5" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="0.3">${active.battery.voltage}V</text>
                        <text x="${xPos + batWidth / 2}" y="${yPos + 26}" font-size="9" font-weight="800" fill="#38bdf8" text-anchor="middle">${active.battery.ah}Ah</text>
                    </g>
                `;
                // Conexión serie
                if (s < maxSeriesShown - 1) {
                    rowUnits += `<line x1="${xPos + batWidth}" y1="${yPos + 16}" x2="${xPos + spacingX}" y2="${yPos + 16}" stroke="#f59e0b" stroke-width="2.2"/>`;
                }
            }
            svgContent += `
                <text x="6" y="${yPos + 20}" font-size="10" fill="var(--text-primary)" font-weight="800">P${p + 1}</text>
                ${rowUnits}
            `;
        }

        const svgWidth = Math.max(260, startX + maxSeriesShown * spacingX + 8);
        const svgHeight = 10 + maxParallelShown * 44;

        host.innerHTML = `
            <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 0.85rem 1.15rem; margin-top: 0.65rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem; flex-wrap: wrap; gap: 0.4rem;">
                    <h4 style="margin: 0; font-size: 0.92rem; color: var(--text-primary); font-weight: 700;">
                        Disposición del Banco: ${active.nsBat} en serie × ${active.npBat} en paralelo (${active.totalBatteries} baterías) — ${esc(active.battery.name)}
                    </h4>
                    <span class="badge" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; font-weight: 700; font-size: 0.75rem;">${active.vBancoReal.toFixed(1)} V nominales</span>
                </div>
                <div style="text-align: center; padding: 0.25rem 0;">
                    <svg viewBox="0 0 ${svgWidth} ${svgHeight}" style="max-width: 380px; width: 100%; height: auto; display: inline-block;">
                        ${svgContent}
                    </svg>
                </div>
                <p class="text-muted" style="font-size: 0.78rem; margin: 0.35rem 0 0 0; text-align: center; line-height: 1.4;">
                    Cada fila suma voltaje en serie (${active.nsBat} × ${active.battery.voltage}V = <strong>${active.vBancoReal.toFixed(1)}V</strong>); las ${active.npBat} ramas en paralelo suman capacidad hasta alcanzar los <strong>${active.ahInst} Ah</strong> instalados.
                </p>
            </div>
        `;
    }

    function renderBalanceCard(active, inputs) {
        const host = $('conv-balance-card');
        if (!host) return;

        const isAdjusted = !!window.APP?.state?.conversion?.balanceAdjusted;
        const deficitPercent = active.deficitPercentAnnual;

        host.innerHTML = `
            <div class="card" style="background: var(--bg-card); border: 1px solid var(--border-subtle); margin-top: 1.25rem;">
                <div class="card-header">
                    <h2>Balance de Cierre Energético y Recuperación</h2>
                    <span class="badge" style="background: ${active.recovers ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'}; color: ${active.recovers ? 'var(--success)' : 'var(--error)'}; font-weight: 700;">
                        ${active.recovers ? 'Banco Recuperable' : 'Banco No Recupera'}
                    </span>
                </div>
                <div class="card-body">
                    <div class="form-grid cols-3" style="margin-bottom: 1rem;">
                        <div class="kpi-card">
                            <div class="kpi-info">
                                <span class="kpi-label">Generación Requerida (Egen)</span>
                                <span class="kpi-value">${num(active.egenWh / 1000, 2)} kWh/día</span>
                                <small>Incluye pérdidas de inversor y batería (ηbat=${active.roundTripEff})</small>
                            </div>
                        </div>
                        <div class="kpi-card">
                            <div class="kpi-info">
                                <span class="kpi-label">Potencia Pico Requerida (Anual)</span>
                                <span class="kpi-value">${num(active.preqAnnualW / 1000, 3)} kWp</span>
                                <small>Mes crítico: ${num(active.preqCriticalW / 1000, 3)} kWp</small>
                            </div>
                        </div>
                        <div class="kpi-card">
                            <div class="kpi-info">
                                <span class="kpi-label">Tiempo de Recuperación (trec)</span>
                                <span class="kpi-value" style="color: ${active.recovers ? 'var(--text-primary)' : 'var(--error)'};">
                                    ${active.recovers ? `${num(active.tRecoverDays, 1)} días` : 'Infinito (Sin superávit)'}
                                </span>
                                <small>${active.recovers ? 'Tras agotar los días de autonomía' : 'Producción neta diaria insuficiente'}</small>
                            </div>
                        </div>
                    </div>
                    
                    <div class="conv-balance-summary-box ${deficitPercent > 0 ? 'warning' : 'positive'}">
                        <div>
                            <div class="conv-balance-summary-title">
                                Contraste contra el Generador Instalado (${num(inputs.ppkInstKW, 2)} kWp):
                            </div>
                            <div class="conv-balance-summary-text">
                                ${deficitPercent > 0 
                                    ? `Déficit de ${num(active.deltaPAnnualW, 0)} W (${num(deficitPercent, 1)}%). Se requieren +${active.deltaModulesAnnual} módulo(s) para satisfacer el balance anual (+${active.deltaModulesCritical} para mes crítico).`
                                    : `Margen positivo de ${num(Math.abs(active.deltaPAnnualW), 0)} W (${num(Math.abs(deficitPercent), 1)}%). El generador satisface la demanda con las pérdidas acumuladas.`
                                }
                            </div>
                        </div>
                        <div style="display: flex; gap: 0.6rem;">
                            ${deficitPercent > 0 && !isAdjusted ? `
                                <button type="button" class="btn btn-primary btn-sm" id="conv-btn-apply-adjust">
                                    ${ICONS.zap} Aplicar Ajuste (+${active.deltaModulesAnnual} mód)
                                </button>
                            ` : ''}
                            ${isAdjusted ? `
                                <button type="button" class="btn btn-secondary btn-sm" id="conv-btn-revert-adjust">
                                    ${ICONS.refresh} Revertir al Generador Original
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;

        const btnApply = $('conv-btn-apply-adjust');
        if (btnApply) btnApply.addEventListener('click', applyModuleAdjustment);
        const btnRevert = $('conv-btn-revert-adjust');
        if (btnRevert) btnRevert.addEventListener('click', revertModuleAdjustment);
    }

    /**
     * Tabla Comparativa de Inversores para Rama Conectada a Red (Sin Almacenamiento)
     */
    function renderInvertersTable(results, inputs, thermal) {
        const host = $('conv-inverters-table-container');
        if (!host) return;

        const rows = results.map(r => {
            const dev = r.device;
            const isRef = !!dev.isReference;
            const isSelected = dev.id === inputs.selectedInverterId;

            const reasons = Array.isArray(r.failureReasons) ? r.failureReasons : [];
            const verdict = r.verdict || 'cumple';

            let verdictBadge = '';
            if (verdict === 'cumple') {
                verdictBadge = `<span class="badge" style="background: rgba(16, 185, 129, 0.15); color: var(--success); font-weight: 700;">Cumple</span>`;
            } else if (verdict === 'alerta') {
                verdictBadge = `<span class="badge" style="background: rgba(245, 158, 11, 0.15); color: var(--warning); font-weight: 700;">Alerta</span>`;
            } else {
                verdictBadge = `<span class="badge" style="background: rgba(239, 68, 68, 0.15); color: var(--error); font-weight: 700;">No Cumple</span>`;
            }

            let refLink = '';
            if (isRef || !dev.url) {
                refLink = `<span class="badge" style="background: rgba(148, 163, 184, 0.15); color: var(--text-muted); font-size: 0.75rem;">Referencia TdR (Ideal)</span>`;
            } else {
                refLink = `
                    <a href="${dev.url}" target="_blank" rel="noopener noreferrer" class="btn btn-sm" onclick="event.stopPropagation()" style="background: #0284c7; color: #fff; padding: 0.3rem 0.6rem; font-size: 0.78rem; text-decoration: none; border-radius: var(--radius-xs); display: inline-flex; align-items: center; gap: 0.3rem;">
                        ${ICONS.externalLink} Ficha Oficial
                    </a>
                `;
            }

            let reconfigAction = '';
            if (r.proposedConfig) {
                reconfigAction = `
                    <div style="margin-top: 0.4rem;">
                        <button type="button" class="btn btn-sm btn-secondary" onclick="event.stopPropagation(); window.CONVERSION_UI.applyReconfig(${r.proposedConfig.ns}, ${r.proposedConfig.np})" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; border-color: var(--accent); color: var(--accent);">
                            Probar ${r.proposedConfig.ns}S × ${r.proposedConfig.np}P
                        </button>
                    </div>
                `;
            }

            return `
                <tr style="cursor: pointer; ${isSelected ? 'background: rgba(245, 158, 11, 0.12); border-left: 4px solid var(--accent);' : ''}" onclick="window.CONVERSION_UI.selectInverter('${dev.id}')">
                    <td>
                        <strong>${esc(dev.name)}</strong>
                        <div style="font-size: 0.74rem; color: var(--text-muted); margin-top: 0.15rem;">${esc(dev.manufacturer || '')} - ${esc(dev.model || '')}</div>
                        <div style="margin-top: 0.25rem;">${refLink}</div>
                    </td>
                    <td style="white-space: nowrap;">
                        <div><strong>${dev.pac} W</strong></div>
                        <div style="font-size: 0.74rem; color: var(--text-secondary); margin-top: 0.15rem;">Ratio DC/AC: <strong>${num(r.dcacRatio, 2)}</strong></div>
                    </td>
                    <td style="white-space: nowrap;">
                        <div>Voc Máx: <strong>${dev.maxPVVoc} V</strong></div>
                        <div style="font-size: 0.74rem; color: var(--text-muted); margin-top: 0.15rem;">MPPT: ${dev.mpptMin} - ${dev.mpptMax} V</div>
                    </td>
                    <td>
                        <div style="margin-bottom: 0.2rem;">${verdictBadge}</div>
                        <div style="font-size: 0.74rem; line-height: 1.35; color: ${verdict === 'no_cumple' ? 'var(--error)' : (verdict === 'alerta' ? 'var(--warning)' : 'var(--success)')}; font-weight: 600;">
                            ${reasons.length > 0 ? reasons.join(' · ') : 'Compatible con el generador y arranque de cargas'}
                        </div>
                        ${reconfigAction}
                    </td>
                    <td style="text-align: center; white-space: nowrap;">
                        <button type="button" class="btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}" onclick="event.stopPropagation(); window.CONVERSION_UI.selectInverter('${dev.id}')" style="padding: 0.3rem 0.65rem; font-size: 0.78rem;">
                            ${isSelected ? `${ICONS.check} Activo` : 'Seleccionar'}
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        host.innerHTML = `
            <div class="table-wrapper">
                <table class="data-table data-table-compact">
                    <thead>
                        <tr>
                            <th style="width: 28%;">Inversor y Ficha</th>
                            <th style="width: 18%;">Potencia AC & DC/AC</th>
                            <th style="width: 20%;">Ventana DC / MPPT</th>
                            <th style="width: 22%;">Veredicto y Diagnóstico</th>
                            <th style="width: 12%; text-align: center;">Selección</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            </div>
        `;
    }

    // Modal de gestión de catálogo
    function openCatalogModal() {
        const modal = $('conv-catalog-modal');
        if (!modal) return;
        renderCatalogModalTabs();
        modal.style.display = 'flex';
        modal.classList.add('active');
    }

    function closeCatalogModal() {
        const modal = $('conv-catalog-modal');
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('active');
        }
    }

    let currentCatalogTab = 'bats';
    let editingItemInfo = null; // { type: 'bats'|'mods'|'ctrls'|'invs', id: string }

    function renderCatalogModalTabs() {
        const body = $('conv-catalog-modal-body');
        if (!body || !window.CONVERSION_DB) return;

        const controllers = CONVERSION_DB.getControllers();
        const inverters = CONVERSION_DB.getInverters();
        const batteries = CONVERSION_DB.getBatteries();
        const modules = window.MODULES_DB ? MODULES_DB.getAll() : [];

        body.innerHTML = `
            <div style="display: flex; gap: 0.5rem; margin-bottom: 1.1rem; border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.6rem; flex-wrap: wrap;">
                <button type="button" class="btn btn-sm btn-secondary ${currentCatalogTab === 'bats' ? 'active' : ''}" id="modal-tab-bats" onclick="window.CONVERSION_UI.switchModalTab('bats')">
                    🔋 Baterías (${batteries.length})
                </button>
                <button type="button" class="btn btn-sm btn-secondary ${currentCatalogTab === 'mods' ? 'active' : ''}" id="modal-tab-mods" onclick="window.CONVERSION_UI.switchModalTab('mods')">
                    ☀️ Módulos FV (${modules.length})
                </button>
                <button type="button" class="btn btn-sm btn-secondary ${currentCatalogTab === 'ctrls' ? 'active' : ''}" id="modal-tab-ctrls" onclick="window.CONVERSION_UI.switchModalTab('ctrls')">
                    ⚡ Reguladores MPPT (${controllers.length})
                </button>
                <button type="button" class="btn btn-sm btn-secondary ${currentCatalogTab === 'invs' ? 'active' : ''}" id="modal-tab-invs" onclick="window.CONVERSION_UI.switchModalTab('invs')">
                    🔄 Inversores MPPT (${inverters.length})
                </button>
            </div>
            <div id="modal-tab-content"></div>
        `;

        switchModalTab(currentCatalogTab, editingItemInfo);
    }

    function switchModalTab(tab, editInfo = null) {
        currentCatalogTab = tab;
        editingItemInfo = editInfo;
        const content = $('modal-tab-content');
        if (!content || !window.CONVERSION_DB) return;

        ['bats', 'mods', 'ctrls', 'invs'].forEach(t => {
            const btn = $(`modal-tab-${t}`);
            if (btn) btn.classList.toggle('active', t === tab);
        });

        let editFormHtml = '';

        // Formulario de edición si se ha seleccionado un elemento
        if (editingItemInfo && editingItemInfo.type === tab) {
            const id = editingItemInfo.id;
            if (tab === 'bats') {
                const b = CONVERSION_DB.getBattery(id);
                if (b) {
                    editFormHtml = `
                        <div class="card" style="background: var(--bg-card); border: 2px solid var(--accent); padding: 1.1rem; margin-bottom: 1.25rem; border-radius: var(--radius-sm);">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.9rem;">
                                <h4 style="margin: 0; font-size: 0.98rem; color: var(--text-primary); font-weight: 700;">
                                    ✏️ Editando Atributos y Enlace: ${esc(b.name)}
                                </h4>
                                <span class="badge" style="font-size: 0.72rem;">ID: ${esc(b.id)}</span>
                            </div>
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem; margin-bottom: 1rem;">
                                <div>
                                    <label style="font-size: 0.76rem; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 0.2rem;">Nombre Comercial</label>
                                    <input type="text" id="edit-bat-name" value="${esc(b.name)}" style="width: 100%; height: 36px; padding: 0.35rem 0.6rem; border-radius: var(--radius-xs); border: 1px solid var(--border-input); background: var(--bg-input); color: var(--text-primary); font-size: 0.85rem;">
                                </div>
                                <div>
                                    <label style="font-size: 0.76rem; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 0.2rem;">Fabricante</label>
                                    <input type="text" id="edit-bat-manufacturer" value="${esc(b.manufacturer || '')}" style="width: 100%; height: 36px; padding: 0.35rem 0.6rem; border-radius: var(--radius-xs); border: 1px solid var(--border-input); background: var(--bg-input); color: var(--text-primary); font-size: 0.85rem;">
                                </div>
                                <div>
                                    <label style="font-size: 0.76rem; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 0.2rem;">Tecnología</label>
                                    <select id="edit-bat-technology" style="width: 100%; height: 36px; padding: 0.35rem 0.6rem; border-radius: var(--radius-xs); border: 1px solid var(--border-input); background: var(--bg-input); color: var(--text-primary); font-size: 0.85rem;">
                                        <option value="AGM" ${b.technology === 'AGM' ? 'selected' : ''}>AGM</option>
                                        <option value="GEL" ${b.technology === 'GEL' ? 'selected' : ''}>GEL</option>
                                        <option value="LFP" ${b.technology === 'LFP' ? 'selected' : ''}>LFP (Litio Ferro-Fosfato)</option>
                                        <option value="OpzV" ${b.technology === 'OpzV' ? 'selected' : ''}>OpzV / Tubular</option>
                                    </select>
                                </div>
                                <div>
                                    <label style="font-size: 0.76rem; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 0.2rem;">Tensión Nominal (V)</label>
                                    <input type="number" step="0.1" id="edit-bat-voltage" value="${b.voltage}" style="width: 100%; height: 36px; padding: 0.35rem 0.6rem; border-radius: var(--radius-xs); border: 1px solid var(--border-input); background: var(--bg-input); color: var(--text-primary); font-size: 0.85rem;">
                                </div>
                                <div>
                                    <label style="font-size: 0.76rem; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 0.2rem;">Capacidad (Ah)</label>
                                    <input type="number" step="1" id="edit-bat-ah" value="${b.ah}" style="width: 100%; height: 36px; padding: 0.35rem 0.6rem; border-radius: var(--radius-xs); border: 1px solid var(--border-input); background: var(--bg-input); color: var(--text-primary); font-size: 0.85rem;">
                                </div>
                                <div>
                                    <label style="font-size: 0.76rem; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 0.2rem;">Profundidad DoD Máx (%)</label>
                                    <input type="number" step="1" min="10" max="100" id="edit-bat-dod" value="${Math.round((b.dod || 0.5) * 100)}" style="width: 100%; height: 36px; padding: 0.35rem 0.6rem; border-radius: var(--radius-xs); border: 1px solid var(--border-input); background: var(--bg-input); color: var(--text-primary); font-size: 0.85rem;">
                                </div>
                                <div>
                                    <label style="font-size: 0.76rem; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 0.2rem;">Eficiencia Round-Trip (%)</label>
                                    <input type="number" step="1" min="50" max="100" id="edit-bat-efficiency" value="${Math.round((b.roundTrip || 0.8) * 100)}" style="width: 100%; height: 36px; padding: 0.35rem 0.6rem; border-radius: var(--radius-xs); border: 1px solid var(--border-input); background: var(--bg-input); color: var(--text-primary); font-size: 0.85rem;">
                                </div>
                                <div>
                                    <label style="font-size: 0.76rem; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 0.2rem;">Tasa C Carga Máx (C)</label>
                                    <input type="number" step="0.01" min="0.05" max="3" id="edit-bat-charge-c" value="${b.maxChargeC || 0.20}" style="width: 100%; height: 36px; padding: 0.35rem 0.6rem; border-radius: var(--radius-xs); border: 1px solid var(--border-input); background: var(--bg-input); color: var(--text-primary); font-size: 0.85rem;">
                                </div>
                                <div>
                                    <label style="font-size: 0.76rem; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 0.2rem;">Vida Útil (años)</label>
                                    <input type="number" step="1" min="1" max="30" id="edit-bat-life-years" value="${b.lifeYears || 1}" style="width: 100%; height: 36px; padding: 0.35rem 0.6rem; border-radius: var(--radius-xs); border: 1px solid var(--border-input); background: var(--bg-input); color: var(--text-primary); font-size: 0.85rem;">
                                </div>
                                <div style="grid-column: 1 / -1;">
                                    <label style="font-size: 0.76rem; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 0.2rem;">Enlace / URL a Ficha Técnica Oficial (AutoSolar / Fabricante)</label>
                                    <input type="url" id="edit-bat-url" value="${esc(b.url || '')}" placeholder="https://autosolar.co/..." style="width: 100%; height: 36px; padding: 0.35rem 0.6rem; border-radius: var(--radius-xs); border: 1px solid var(--border-input); background: var(--bg-input); color: var(--text-primary); font-size: 0.85rem;">
                                </div>
                            </div>
                            <div style="display: flex; gap: 0.6rem; flex-wrap: wrap;">
                                <button type="button" class="btn btn-primary btn-sm" onclick="window.CONVERSION_UI.saveItemEdit('bats', '${b.id}')">
                                    💾 Guardar Cambios
                                </button>
                                <button type="button" class="btn btn-secondary btn-sm" onclick="window.CONVERSION_UI.resetItemToDefault('bats', '${b.id}')">
                                    🔄 Restablecer a Valores por Defecto
                                </button>
                                <button type="button" class="btn btn-ghost btn-sm" onclick="window.CONVERSION_UI.cancelEditItem('bats')">
                                    ✕ Cancelar
                                </button>
                            </div>
                        </div>
                    `;
                }
            } else if (tab === 'mods') {
                const m = window.MODULES_DB ? MODULES_DB.getById(id) : null;
                if (m) {
                    editFormHtml = `
                        <div class="card" style="background: var(--bg-card); border: 2px solid var(--accent); padding: 1.1rem; margin-bottom: 1.25rem; border-radius: var(--radius-sm);">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.9rem;">
                                <h4 style="margin: 0; font-size: 0.98rem; color: var(--text-primary); font-weight: 700;">
                                    ✏️ Editando Atributos y Enlace: ${esc(m.name)}
                                </h4>
                                <span class="badge" style="font-size: 0.72rem;">ID: ${esc(m.id)}</span>
                            </div>
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem; margin-bottom: 1rem;">
                                <div>
                                    <label style="font-size: 0.76rem; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 0.2rem;">Nombre del Módulo</label>
                                    <input type="text" id="edit-mod-name" value="${esc(m.name)}" style="width: 100%; height: 36px; padding: 0.35rem 0.6rem; border-radius: var(--radius-xs); border: 1px solid var(--border-input); background: var(--bg-input); color: var(--text-primary); font-size: 0.85rem;">
                                </div>
                                <div>
                                    <label style="font-size: 0.76rem; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 0.2rem;">Fabricante</label>
                                    <input type="text" id="edit-mod-manufacturer" value="${esc(m.manufacturer || '')}" style="width: 100%; height: 36px; padding: 0.35rem 0.6rem; border-radius: var(--radius-xs); border: 1px solid var(--border-input); background: var(--bg-input); color: var(--text-primary); font-size: 0.85rem;">
                                </div>
                                <div>
                                    <label style="font-size: 0.76rem; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 0.2rem;">Modelo</label>
                                    <input type="text" id="edit-mod-model" value="${esc(m.model || '')}" style="width: 100%; height: 36px; padding: 0.35rem 0.6rem; border-radius: var(--radius-xs); border: 1px solid var(--border-input); background: var(--bg-input); color: var(--text-primary); font-size: 0.85rem;">
                                </div>
                                <div>
                                    <label style="font-size: 0.76rem; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 0.2rem;">Potencia Pico Pmax (Wp)</label>
                                    <input type="number" step="1" id="edit-mod-pmax" value="${m.pmax}" style="width: 100%; height: 36px; padding: 0.35rem 0.6rem; border-radius: var(--radius-xs); border: 1px solid var(--border-input); background: var(--bg-input); color: var(--text-primary); font-size: 0.85rem;">
                                </div>
                                <div>
                                    <label style="font-size: 0.76rem; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 0.2rem;">Tensión Voc (V)</label>
                                    <input type="number" step="0.01" id="edit-mod-voc" value="${m.voc}" style="width: 100%; height: 36px; padding: 0.35rem 0.6rem; border-radius: var(--radius-xs); border: 1px solid var(--border-input); background: var(--bg-input); color: var(--text-primary); font-size: 0.85rem;">
                                </div>
                                <div>
                                    <label style="font-size: 0.76rem; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 0.2rem;">Corriente Isc (A)</label>
                                    <input type="number" step="0.01" id="edit-mod-isc" value="${m.isc}" style="width: 100%; height: 36px; padding: 0.35rem 0.6rem; border-radius: var(--radius-xs); border: 1px solid var(--border-input); background: var(--bg-input); color: var(--text-primary); font-size: 0.85rem;">
                                </div>
                                <div>
                                    <label style="font-size: 0.76rem; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 0.2rem;">Tensión Vmp (V)</label>
                                    <input type="number" step="0.01" id="edit-mod-vmp" value="${m.vmp}" style="width: 100%; height: 36px; padding: 0.35rem 0.6rem; border-radius: var(--radius-xs); border: 1px solid var(--border-input); background: var(--bg-input); color: var(--text-primary); font-size: 0.85rem;">
                                </div>
                                <div>
                                    <label style="font-size: 0.76rem; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 0.2rem;">Corriente Imp (A)</label>
                                    <input type="number" step="0.01" id="edit-mod-imp" value="${m.imp}" style="width: 100%; height: 36px; padding: 0.35rem 0.6rem; border-radius: var(--radius-xs); border: 1px solid var(--border-input); background: var(--bg-input); color: var(--text-primary); font-size: 0.85rem;">
                                </div>
                                <div>
                                    <label style="font-size: 0.76rem; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 0.2rem;">Coef. Temp Voc (%/°C)</label>
                                    <input type="number" step="0.001" id="edit-mod-temp-voc" value="${m.tempCoefVoc}" style="width: 100%; height: 36px; padding: 0.35rem 0.6rem; border-radius: var(--radius-xs); border: 1px solid var(--border-input); background: var(--bg-input); color: var(--text-primary); font-size: 0.85rem;">
                                </div>
                                <div>
                                    <label style="font-size: 0.76rem; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 0.2rem;">Coef. Temp Pmp (%/°C)</label>
                                    <input type="number" step="0.001" id="edit-mod-temp-pmp" value="${m.tempCoefPmp}" style="width: 100%; height: 36px; padding: 0.35rem 0.6rem; border-radius: var(--radius-xs); border: 1px solid var(--border-input); background: var(--bg-input); color: var(--text-primary); font-size: 0.85rem;">
                                </div>
                                <div>
                                    <label style="font-size: 0.76rem; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 0.2rem;">NOCT (°C)</label>
                                    <input type="number" step="1" id="edit-mod-noct" value="${m.noct}" style="width: 100%; height: 36px; padding: 0.35rem 0.6rem; border-radius: var(--radius-xs); border: 1px solid var(--border-input); background: var(--bg-input); color: var(--text-primary); font-size: 0.85rem;">
                                </div>
                                <div style="grid-column: 1 / -1;">
                                    <label style="font-size: 0.76rem; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 0.2rem;">Enlace / URL a Ficha Técnica Oficial (AutoSolar / Fabricante)</label>
                                    <input type="url" id="edit-mod-url" value="${esc(m.url || '')}" placeholder="https://autosolar.co/..." style="width: 100%; height: 36px; padding: 0.35rem 0.6rem; border-radius: var(--radius-xs); border: 1px solid var(--border-input); background: var(--bg-input); color: var(--text-primary); font-size: 0.85rem;">
                                </div>
                            </div>
                            <div style="display: flex; gap: 0.6rem; flex-wrap: wrap;">
                                <button type="button" class="btn btn-primary btn-sm" onclick="window.CONVERSION_UI.saveItemEdit('mods', '${m.id}')">
                                    💾 Guardar Cambios
                                </button>
                                <button type="button" class="btn btn-secondary btn-sm" onclick="window.CONVERSION_UI.resetItemToDefault('mods', '${m.id}')">
                                    🔄 Restablecer a Valores por Defecto
                                </button>
                                <button type="button" class="btn btn-ghost btn-sm" onclick="window.CONVERSION_UI.cancelEditItem('mods')">
                                    ✕ Cancelar
                                </button>
                            </div>
                        </div>
                    `;
                }
            } else if (tab === 'ctrls') {
                const c = CONVERSION_DB.getController(id);
                if (c) {
                    editFormHtml = `
                        <div class="card" style="background: var(--bg-card); border: 2px solid var(--accent); padding: 1.1rem; margin-bottom: 1.25rem; border-radius: var(--radius-sm);">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.9rem;">
                                <h4 style="margin: 0; font-size: 0.98rem; color: var(--text-primary); font-weight: 700;">
                                    ✏️ Editando Atributos y Enlace: ${esc(c.name)}
                                </h4>
                                <span class="badge" style="font-size: 0.72rem;">ID: ${esc(c.id)}</span>
                            </div>
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem; margin-bottom: 1rem;">
                                <div>
                                    <label style="font-size: 0.76rem; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 0.2rem;">Nombre Comercial</label>
                                    <input type="text" id="edit-ctrl-name" value="${esc(c.name)}" style="width: 100%; height: 36px; padding: 0.35rem 0.6rem; border-radius: var(--radius-xs); border: 1px solid var(--border-input); background: var(--bg-input); color: var(--text-primary); font-size: 0.85rem;">
                                </div>
                                <div>
                                    <label style="font-size: 0.76rem; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 0.2rem;">Fabricante</label>
                                    <input type="text" id="edit-ctrl-manufacturer" value="${esc(c.manufacturer || '')}" style="width: 100%; height: 36px; padding: 0.35rem 0.6rem; border-radius: var(--radius-xs); border: 1px solid var(--border-input); background: var(--bg-input); color: var(--text-primary); font-size: 0.85rem;">
                                </div>
                                <div>
                                    <label style="font-size: 0.76rem; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 0.2rem;">Modelo</label>
                                    <input type="text" id="edit-ctrl-model" value="${esc(c.model || '')}" style="width: 100%; height: 36px; padding: 0.35rem 0.6rem; border-radius: var(--radius-xs); border: 1px solid var(--border-input); background: var(--bg-input); color: var(--text-primary); font-size: 0.85rem;">
                                </div>
                                <div>
                                    <label style="font-size: 0.76rem; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 0.2rem;">Voc Máximo (V)</label>
                                    <input type="number" step="1" id="edit-ctrl-voc" value="${c.maxPVVoc}" style="width: 100%; height: 36px; padding: 0.35rem 0.6rem; border-radius: var(--radius-xs); border: 1px solid var(--border-input); background: var(--bg-input); color: var(--text-primary); font-size: 0.85rem;">
                                </div>
                                <div>
                                    <label style="font-size: 0.76rem; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 0.2rem;">Corriente de Carga Máx (A)</label>
                                    <input type="number" step="1" id="edit-ctrl-charge-a" value="${c.maxChargeA}" style="width: 100%; height: 36px; padding: 0.35rem 0.6rem; border-radius: var(--radius-xs); border: 1px solid var(--border-input); background: var(--bg-input); color: var(--text-primary); font-size: 0.85rem;">
                                </div>
                                <div>
                                    <label style="font-size: 0.76rem; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 0.2rem;">Isc Entrada Máx (A)</label>
                                    <input type="number" step="1" id="edit-ctrl-input-a" value="${c.maxPVInputA || 50}" style="width: 100%; height: 36px; padding: 0.35rem 0.6rem; border-radius: var(--radius-xs); border: 1px solid var(--border-input); background: var(--bg-input); color: var(--text-primary); font-size: 0.85rem;">
                                </div>
                                <div>
                                    <label style="font-size: 0.76rem; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 0.2rem;">Vmp Mínimo de Entrada (V)</label>
                                    <input type="number" step="1" id="edit-ctrl-vmp-min" value="${c.minPVVmp || 30}" style="width: 100%; height: 36px; padding: 0.35rem 0.6rem; border-radius: var(--radius-xs); border: 1px solid var(--border-input); background: var(--bg-input); color: var(--text-primary); font-size: 0.85rem;">
                                </div>
                                <div style="grid-column: 1 / -1;">
                                    <label style="font-size: 0.76rem; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 0.2rem;">Enlace / URL a Ficha Técnica Oficial (AutoSolar / Fabricante)</label>
                                    <input type="url" id="edit-ctrl-url" value="${esc(c.url || '')}" placeholder="https://autosolar.co/..." style="width: 100%; height: 36px; padding: 0.35rem 0.6rem; border-radius: var(--radius-xs); border: 1px solid var(--border-input); background: var(--bg-input); color: var(--text-primary); font-size: 0.85rem;">
                                </div>
                            </div>
                            <div style="display: flex; gap: 0.6rem; flex-wrap: wrap;">
                                <button type="button" class="btn btn-primary btn-sm" onclick="window.CONVERSION_UI.saveItemEdit('ctrls', '${c.id}')">
                                    💾 Guardar Cambios
                                </button>
                                <button type="button" class="btn btn-secondary btn-sm" onclick="window.CONVERSION_UI.resetItemToDefault('ctrls', '${c.id}')">
                                    🔄 Restablecer a Valores por Defecto
                                </button>
                                <button type="button" class="btn btn-ghost btn-sm" onclick="window.CONVERSION_UI.cancelEditItem('ctrls')">
                                    ✕ Cancelar
                                </button>
                            </div>
                        </div>
                    `;
                }
            } else if (tab === 'invs') {
                const inv = CONVERSION_DB.getInverter(id);
                if (inv) {
                    editFormHtml = `
                        <div class="card" style="background: var(--bg-card); border: 2px solid var(--accent); padding: 1.1rem; margin-bottom: 1.25rem; border-radius: var(--radius-sm);">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.9rem;">
                                <h4 style="margin: 0; font-size: 0.98rem; color: var(--text-primary); font-weight: 700;">
                                    ✏️ Editando Atributos y Enlace: ${esc(inv.name)}
                                </h4>
                                <span class="badge" style="font-size: 0.72rem;">ID: ${esc(inv.id)}</span>
                            </div>
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem; margin-bottom: 1rem;">
                                <div>
                                    <label style="font-size: 0.76rem; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 0.2rem;">Nombre Comercial</label>
                                    <input type="text" id="edit-inv-name" value="${esc(inv.name)}" style="width: 100%; height: 36px; padding: 0.35rem 0.6rem; border-radius: var(--radius-xs); border: 1px solid var(--border-input); background: var(--bg-input); color: var(--text-primary); font-size: 0.85rem;">
                                </div>
                                <div>
                                    <label style="font-size: 0.76rem; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 0.2rem;">Fabricante</label>
                                    <input type="text" id="edit-inv-manufacturer" value="${esc(inv.manufacturer || '')}" style="width: 100%; height: 36px; padding: 0.35rem 0.6rem; border-radius: var(--radius-xs); border: 1px solid var(--border-input); background: var(--bg-input); color: var(--text-primary); font-size: 0.85rem;">
                                </div>
                                <div>
                                    <label style="font-size: 0.76rem; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 0.2rem;">Modelo</label>
                                    <input type="text" id="edit-inv-model" value="${esc(inv.model || '')}" style="width: 100%; height: 36px; padding: 0.35rem 0.6rem; border-radius: var(--radius-xs); border: 1px solid var(--border-input); background: var(--bg-input); color: var(--text-primary); font-size: 0.85rem;">
                                </div>
                                <div>
                                    <label style="font-size: 0.76rem; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 0.2rem;">Potencia Nominal Pac (W)</label>
                                    <input type="number" step="100" id="edit-inv-pac" value="${inv.pac}" style="width: 100%; height: 36px; padding: 0.35rem 0.6rem; border-radius: var(--radius-xs); border: 1px solid var(--border-input); background: var(--bg-input); color: var(--text-primary); font-size: 0.85rem;">
                                </div>
                                <div>
                                    <label style="font-size: 0.76rem; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 0.2rem;">Potencia Pico (W)</label>
                                    <input type="number" step="100" id="edit-inv-peak" value="${inv.peakW || inv.pac * 2}" style="width: 100%; height: 36px; padding: 0.35rem 0.6rem; border-radius: var(--radius-xs); border: 1px solid var(--border-input); background: var(--bg-input); color: var(--text-primary); font-size: 0.85rem;">
                                </div>
                                <div>
                                    <label style="font-size: 0.76rem; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 0.2rem;">Voc Máximo Entrada FV (V)</label>
                                    <input type="number" step="1" id="edit-inv-voc" value="${inv.maxPVVoc}" style="width: 100%; height: 36px; padding: 0.35rem 0.6rem; border-radius: var(--radius-xs); border: 1px solid var(--border-input); background: var(--bg-input); color: var(--text-primary); font-size: 0.85rem;">
                                </div>
                                <div>
                                    <label style="font-size: 0.76rem; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 0.2rem;">MPPT Mínimo (V)</label>
                                    <input type="number" step="1" id="edit-inv-mppt-min" value="${inv.mpptMin || 80}" style="width: 100%; height: 36px; padding: 0.35rem 0.6rem; border-radius: var(--radius-xs); border: 1px solid var(--border-input); background: var(--bg-input); color: var(--text-primary); font-size: 0.85rem;">
                                </div>
                                <div>
                                    <label style="font-size: 0.76rem; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 0.2rem;">MPPT Máximo (V)</label>
                                    <input type="number" step="1" id="edit-inv-mppt-max" value="${inv.mpptMax || 500}" style="width: 100%; height: 36px; padding: 0.35rem 0.6rem; border-radius: var(--radius-xs); border: 1px solid var(--border-input); background: var(--bg-input); color: var(--text-primary); font-size: 0.85rem;">
                                </div>
                                <div style="grid-column: 1 / -1;">
                                    <label style="font-size: 0.76rem; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 0.2rem;">Enlace / URL a Ficha Técnica Oficial (AutoSolar / Fabricante)</label>
                                    <input type="url" id="edit-inv-url" value="${esc(inv.url || '')}" placeholder="https://autosolar.co/..." style="width: 100%; height: 36px; padding: 0.35rem 0.6rem; border-radius: var(--radius-xs); border: 1px solid var(--border-input); background: var(--bg-input); color: var(--text-primary); font-size: 0.85rem;">
                                </div>
                            </div>
                            <div style="display: flex; gap: 0.6rem; flex-wrap: wrap;">
                                <button type="button" class="btn btn-primary btn-sm" onclick="window.CONVERSION_UI.saveItemEdit('invs', '${inv.id}')">
                                    💾 Guardar Cambios
                                </button>
                                <button type="button" class="btn btn-secondary btn-sm" onclick="window.CONVERSION_UI.resetItemToDefault('invs', '${inv.id}')">
                                    🔄 Restablecer a Valores por Defecto
                                </button>
                                <button type="button" class="btn btn-ghost btn-sm" onclick="window.CONVERSION_UI.cancelEditItem('invs')">
                                    ✕ Cancelar
                                </button>
                            </div>
                        </div>
                    `;
                }
            }
        }

        if (tab === 'ctrls') {
            const ctrls = CONVERSION_DB.getControllers();
            content.innerHTML = `
                ${editFormHtml}
                <div class="table-wrapper">
                    <table class="data-table data-table-compact">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Voc Máx</th>
                                <th>I Carga</th>
                                <th>Isc Entrada</th>
                                <th>Vmp Mín</th>
                                <th>Ficha Técnica</th>
                                <th style="text-align: center;">Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${ctrls.map(c => `
                                <tr>
                                    <td>
                                        <strong>${esc(c.name)}</strong>
                                        <div style="font-size: 0.74rem; color: var(--text-muted);">${esc(c.manufacturer || '')} - ${esc(c.model || '')}</div>
                                    </td>
                                    <td>${c.maxPVVoc} V</td>
                                    <td>${c.maxChargeA} A</td>
                                    <td>${c.maxPVInputA || 50} A</td>
                                    <td>${c.minPVVmp || 30} V</td>
                                    <td>${c.url ? `<a href="${c.url}" target="_blank" rel="noopener noreferrer" class="btn btn-sm" style="background: #0284c7; color: #fff; padding: 0.25rem 0.5rem; font-size: 0.74rem; text-decoration: none; border-radius: var(--radius-xs); display: inline-flex; align-items: center; gap: 0.3rem;">${ICONS.externalLink} Enlace Oficial</a>` : '<span class="badge" style="background: rgba(148, 163, 184, 0.15); color: var(--text-muted); font-size: 0.72rem;">Referencia TdR</span>'}</td>
                                    <td style="text-align: center;">
                                        <button type="button" class="btn btn-sm btn-secondary" onclick="window.CONVERSION_UI.startEditItem('ctrls', '${c.id}')" style="padding: 0.25rem 0.55rem; font-size: 0.75rem;">
                                            ✏️ Modificar
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        } else if (tab === 'invs') {
            const invs = CONVERSION_DB.getInverters();
            content.innerHTML = `
                ${editFormHtml}
                <div class="table-wrapper">
                    <table class="data-table data-table-compact">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Tipo</th>
                                <th>Pac (W)</th>
                                <th>Pico (W)</th>
                                <th>Voc Máx</th>
                                <th>MPPT (V)</th>
                                <th>Ficha Técnica</th>
                                <th style="text-align: center;">Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${invs.map(i => `
                                <tr>
                                    <td>
                                        <strong>${esc(i.name)}</strong>
                                        <div style="font-size: 0.74rem; color: var(--text-muted);">${esc(i.manufacturer || '')} - ${esc(i.model || '')}</div>
                                    </td>
                                    <td>${i.isHybrid ? '<span class="badge" style="color: #c084fc;">Híbrido</span>' : 'On-Grid'}</td>
                                    <td>${i.pac} W</td>
                                    <td>${i.peakW || i.pac * 2} W</td>
                                    <td>${i.maxPVVoc} V</td>
                                    <td>${i.mpptMin} - ${i.mpptMax} V</td>
                                    <td>${i.url ? `<a href="${i.url}" target="_blank" rel="noopener noreferrer" class="btn btn-sm" style="background: #0284c7; color: #fff; padding: 0.25rem 0.5rem; font-size: 0.74rem; text-decoration: none; border-radius: var(--radius-xs); display: inline-flex; align-items: center; gap: 0.3rem;">${ICONS.externalLink} Enlace Oficial</a>` : '<span class="badge" style="background: rgba(148, 163, 184, 0.15); color: var(--text-muted); font-size: 0.72rem;">Referencia TdR</span>'}</td>
                                    <td style="text-align: center;">
                                        <button type="button" class="btn btn-sm btn-secondary" onclick="window.CONVERSION_UI.startEditItem('invs', '${i.id}')" style="padding: 0.25rem 0.55rem; font-size: 0.75rem;">
                                            ✏️ Modificar
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        } else if (tab === 'bats') {
            const bats = CONVERSION_DB.getBatteries();
            content.innerHTML = `
                ${editFormHtml}
                <div class="table-wrapper">
                    <table class="data-table data-table-compact">
                        <thead>
                            <tr>
                                <th>Batería</th>
                                <th>Voltaje</th>
                                <th>Capacidad</th>
                                <th>DoD Máx</th>
                                <th>Eficiencia</th>
                                <th>Tasa C</th>
                                <th>Vida Útil</th>
                                <th>Ficha Técnica</th>
                                <th style="text-align: center;">Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${bats.map(b => `
                                <tr>
                                    <td>
                                        <strong>${esc(b.name)}</strong>
                                        <div style="font-size: 0.74rem; color: var(--text-muted);">${esc(b.manufacturer || '')} · <span class="badge" style="font-size: 0.68rem; padding: 0.1rem 0.35rem;">${esc(b.technology || 'N/A')}</span></div>
                                    </td>
                                    <td><strong>${b.voltage} V</strong></td>
                                    <td><strong>${b.ah} Ah</strong></td>
                                    <td>${Math.round((b.dod || 0.5) * 100)}%</td>
                                    <td>${Math.round((b.roundTrip || 0.8) * 100)}%</td>
                                    <td>${b.maxChargeC || 0.2} C</td>
                                    <td>${b.lifeYears} años</td>
                                    <td>${b.url ? `<a href="${b.url}" target="_blank" rel="noopener noreferrer" class="btn btn-sm" style="background: #0284c7; color: #fff; padding: 0.25rem 0.5rem; font-size: 0.74rem; text-decoration: none; border-radius: var(--radius-xs); display: inline-flex; align-items: center; gap: 0.3rem;">${ICONS.externalLink} Enlace Oficial</a>` : '<span class="badge" style="background: rgba(148, 163, 184, 0.15); color: var(--text-muted); font-size: 0.72rem;">Referencia TdR</span>'}</td>
                                    <td style="text-align: center;">
                                        <button type="button" class="btn btn-sm btn-secondary" onclick="window.CONVERSION_UI.startEditItem('bats', '${b.id}')" style="padding: 0.25rem 0.55rem; font-size: 0.75rem;">
                                            ✏️ Modificar
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        } else if (tab === 'mods') {
            const modules = window.MODULES_DB ? MODULES_DB.getAll() : [];
            content.innerHTML = `
                ${editFormHtml}
                <div class="table-wrapper">
                    <table class="data-table data-table-compact">
                        <thead>
                            <tr>
                                <th>Módulo</th>
                                <th>Potencia (Wp)</th>
                                <th>Voc (V)</th>
                                <th>Isc (A)</th>
                                <th>Vmp / Imp</th>
                                <th>Coef. Voc / Pmp</th>
                                <th>Ficha Técnica</th>
                                <th style="text-align: center;">Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${modules.map(m => `
                                <tr>
                                    <td>
                                        <strong>${esc(m.name)}</strong>
                                        <div style="font-size: 0.74rem; color: var(--text-muted);">${esc(m.manufacturer || '')} - ${esc(m.model || '')}</div>
                                    </td>
                                    <td><strong style="color: var(--accent); font-size: 0.9rem;">${m.pmax} Wp</strong></td>
                                    <td>${m.voc} V</td>
                                    <td>${m.isc} A</td>
                                    <td>${m.vmp} V / ${m.imp} A</td>
                                    <td style="font-size: 0.75rem;">${m.tempCoefVoc}% / ${m.tempCoefPmp}%</td>
                                    <td>${m.url ? `<a href="${m.url}" target="_blank" rel="noopener noreferrer" class="btn btn-sm" style="background: #0284c7; color: #fff; padding: 0.25rem 0.5rem; font-size: 0.74rem; text-decoration: none; border-radius: var(--radius-xs); display: inline-flex; align-items: center; gap: 0.3rem;">${ICONS.externalLink} Enlace Oficial</a>` : '<span class="badge" style="background: rgba(148, 163, 184, 0.15); color: var(--text-muted); font-size: 0.72rem;">Referencia TdR</span>'}</td>
                                    <td style="text-align: center;">
                                        <button type="button" class="btn btn-sm btn-secondary" onclick="window.CONVERSION_UI.startEditItem('mods', '${m.id}')" style="padding: 0.25rem 0.55rem; font-size: 0.75rem;">
                                            ✏️ Modificar
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }
    }

    function startEditItem(type, id) {
        editingItemInfo = { type, id };
        renderCatalogModalTabs();
    }

    function cancelEditItem() {
        editingItemInfo = null;
        renderCatalogModalTabs();
    }

    function saveItemEdit(type, id) {
        if (type === 'bats') {
            const item = CONVERSION_DB.getBattery(id);
            if (!item) return;
            const updated = {
                ...item,
                name: $('edit-bat-name')?.value.trim() || item.name,
                manufacturer: $('edit-bat-manufacturer')?.value.trim() || item.manufacturer,
                model: $('edit-bat-model')?.value.trim() || item.model,
                technology: $('edit-bat-technology')?.value || item.technology,
                voltage: parseFloat($('edit-bat-voltage')?.value) || item.voltage,
                ah: parseFloat($('edit-bat-ah')?.value) || item.ah,
                dod: (parseFloat($('edit-bat-dod')?.value) || 50) / 100,
                roundTrip: (parseFloat($('edit-bat-efficiency')?.value) || 80) / 100,
                maxChargeC: parseFloat($('edit-bat-charge-c')?.value) || item.maxChargeC,
                lifeYears: parseInt($('edit-bat-life-years')?.value, 10) || item.lifeYears,
                url: $('edit-bat-url')?.value.trim() || ''
            };
            CONVERSION_DB.saveBattery(updated);
            if (typeof showToast === 'function') showToast(`Batería "${updated.name}" actualizada correctamente`, 'success');
        } else if (type === 'mods') {
            const item = window.MODULES_DB ? MODULES_DB.getById(id) : null;
            if (!item) return;
            const updated = {
                ...item,
                name: $('edit-mod-name')?.value.trim() || item.name,
                manufacturer: $('edit-mod-manufacturer')?.value.trim() || item.manufacturer,
                model: $('edit-mod-model')?.value.trim() || item.model,
                pmax: parseFloat($('edit-mod-pmax')?.value) || item.pmax,
                voc: parseFloat($('edit-mod-voc')?.value) || item.voc,
                isc: parseFloat($('edit-mod-isc')?.value) || item.isc,
                vmp: parseFloat($('edit-mod-vmp')?.value) || item.vmp,
                imp: parseFloat($('edit-mod-imp')?.value) || item.imp,
                tempCoefVoc: parseFloat($('edit-mod-temp-voc')?.value) || item.tempCoefVoc,
                tempCoefPmp: parseFloat($('edit-mod-temp-pmp')?.value) || item.tempCoefPmp,
                noct: parseFloat($('edit-mod-noct')?.value) || item.noct,
                url: $('edit-mod-url')?.value.trim() || ''
            };
            MODULES_DB.updateModule(id, updated);
            if (typeof showToast === 'function') showToast(`Módulo "${updated.name}" actualizado correctamente`, 'success');
        } else if (type === 'ctrls') {
            const item = CONVERSION_DB.getController(id);
            if (!item) return;
            const updated = {
                ...item,
                name: $('edit-ctrl-name')?.value.trim() || item.name,
                manufacturer: $('edit-ctrl-manufacturer')?.value.trim() || item.manufacturer,
                model: $('edit-ctrl-model')?.value.trim() || item.model,
                maxPVVoc: parseFloat($('edit-ctrl-voc')?.value) || item.maxPVVoc,
                maxChargeA: parseFloat($('edit-ctrl-charge-a')?.value) || item.maxChargeA,
                maxPVInputA: parseFloat($('edit-ctrl-input-a')?.value) || item.maxPVInputA,
                minPVVmp: parseFloat($('edit-ctrl-vmp-min')?.value) || item.minPVVmp,
                url: $('edit-ctrl-url')?.value.trim() || ''
            };
            CONVERSION_DB.saveController(updated);
            if (typeof showToast === 'function') showToast(`Regulador "${updated.name}" actualizado correctamente`, 'success');
        } else if (type === 'invs') {
            const item = CONVERSION_DB.getInverter(id);
            if (!item) return;
            const updated = {
                ...item,
                name: $('edit-inv-name')?.value.trim() || item.name,
                manufacturer: $('edit-inv-manufacturer')?.value.trim() || item.manufacturer,
                model: $('edit-inv-model')?.value.trim() || item.model,
                pac: parseFloat($('edit-inv-pac')?.value) || item.pac,
                peakW: parseFloat($('edit-inv-peak')?.value) || item.peakW,
                maxPVVoc: parseFloat($('edit-inv-voc')?.value) || item.maxPVVoc,
                mpptMin: parseFloat($('edit-inv-mppt-min')?.value) || item.mpptMin,
                mpptMax: parseFloat($('edit-inv-mppt-max')?.value) || item.mpptMax,
                url: $('edit-inv-url')?.value.trim() || ''
            };
            CONVERSION_DB.saveInverter(updated);
            if (typeof showToast === 'function') showToast(`Inversor "${updated.name}" actualizado correctamente`, 'success');
        }

        editingItemInfo = null;
        renderCatalogModalTabs();
        renderConversion();
        if (window.SIZING_UI?.render) {
            try { SIZING_UI.render(); } catch(e){}
        }
    }

    function resetItemToDefault(type, id) {
        if (type === 'bats') {
            CONVERSION_DB.resetBattery(id);
            if (typeof showToast === 'function') showToast('Batería restablecida a valores y enlace por defecto', 'info');
        } else if (type === 'mods') {
            if (window.MODULES_DB) MODULES_DB.resetModule(id);
            if (typeof showToast === 'function') showToast('Módulo restablecido a valores y enlace por defecto', 'info');
        } else if (type === 'ctrls') {
            CONVERSION_DB.resetController(id);
            if (typeof showToast === 'function') showToast('Regulador restablecido a valores y enlace por defecto', 'info');
        } else if (type === 'invs') {
            CONVERSION_DB.resetInverter(id);
            if (typeof showToast === 'function') showToast('Inversor restablecido a valores y enlace por defecto', 'info');
        }

        editingItemInfo = null;
        renderCatalogModalTabs();
        renderConversion();
        if (window.SIZING_UI?.render) {
            try { SIZING_UI.render(); } catch(e){}
        }
    }

    // Exponer API de UI globalmente
    window.CONVERSION_UI = {
        init: initConversionUI,
        render: renderConversion,
        setBranch,
        applyReconfig: applyStringReconfig,
        selectBattery: id => {
            if (window.APP?.state?.conversion) {
                APP.state.conversion.selectedBatteryId = id;
                const bat = window.CONVERSION_DB ? CONVERSION_DB.getBattery(id) : null;
                if (bat && Number.isFinite(bat.dod)) {
                    APP.state.conversion.dodDesign = bat.dod;
                    const dodInput = document.getElementById('conv-dod');
                    if (dodInput) dodInput.value = Math.round(bat.dod * 100);
                }
                renderConversion();
                if (typeof showToast === 'function') {
                    if (bat) showToast(`Batería seleccionada: ${bat.name}`, 'info');
                }
            }
        },
        selectController: id => {
            if (window.APP?.state?.conversion) {
                APP.state.conversion.selectedControllerId = id;
                renderConversion();
                if (typeof showToast === 'function') {
                    const dev = window.CONVERSION_DB ? CONVERSION_DB.getController(id) : null;
                    if (dev) showToast(`Equipo seleccionado: ${dev.name}`, 'info');
                }
            }
        },
        selectInverter: id => {
            if (window.APP?.state?.conversion) {
                APP.state.conversion.selectedInverterId = id;
                renderConversion();
                if (typeof showToast === 'function') {
                    const dev = window.CONVERSION_DB ? CONVERSION_DB.getInverter(id) : null;
                    if (dev) showToast(`Inversor seleccionado: ${dev.name}`, 'info');
                }
            }
        },
        openCatalogModal,
        closeCatalogModal,
        switchModalTab,
        startEditItem,
        cancelEditItem,
        saveItemEdit,
        resetItemToDefault
    };

    // Auto-inicializar cuando el DOM esté listo
    document.addEventListener('DOMContentLoaded', () => {
        if (window.CONVERSION_DB) CONVERSION_DB.init();
        initConversionUI();
    });

})();
