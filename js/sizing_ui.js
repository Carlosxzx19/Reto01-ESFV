/* ═══════════════════════════════════════════════
   sizing_ui.js — UI Controller for Reto 02
   Renders PV inputs, queries PVWatts, calculates the 3 panels,
   validates area, and visualizes monthly/annual generation.
   ═══════════════════════════════════════════════ */

let generationChart = null;

function initSizingUI() {
    // 1. Initialize local DB and Modules DB
    if (window.SOLAR_DB) SOLAR_DB.init();
    if (window.MODULES_DB) MODULES_DB.init();

    // 2. Bind form inputs to state
    bindSizingInputs();

    // 3. Bind default cases navigation (Reto 02 cases tabs)
    bindDimensioningCases();
    if (!APP.state.sizing.activeCaseId) {
        selectDimensioningCase('custom', { silent: true });
    }

    // 4. Bind configuration modal for APIs
    initConfigModal();

    // 5. Bind provider toggle buttons (PVGIS default vs PVWatts vs Base Continental)
    const btnPvgis = document.getElementById('btn-provider-pvgis');
    const btnPvwatts = document.getElementById('btn-provider-pvwatts');
    const btnContinent = document.getElementById('btn-provider-continent');
    if (btnPvgis && btnPvwatts) {
        btnPvgis.addEventListener('click', () => {
            if (window.CONTINENTS_DB) CONTINENTS_DB.setMode('api');
            setSolarProvider('pvgis');
        });
        btnPvwatts.addEventListener('click', () => {
            if (window.CONTINENTS_DB) CONTINENTS_DB.setMode('api');
            setSolarProvider('pvwatts');
        });
    }
    if (btnContinent) {
        btnContinent.addEventListener('click', () => {
            if (window.CONTINENTS_DB) CONTINENTS_DB.setMode('manual');
            setSolarProvider('continent');
            handlePVWattsQuery();
        });
    }
    const selSizingCont = document.getElementById('sizing-continent-select');
    if (selSizingCont) {
        selSizingCont.addEventListener('change', () => {
            if (window.CONTINENTS_DB) {
                CONTINENTS_DB.setSelectedContinent(selSizingCont.value);
                const c = CONTINENTS_DB.get(selSizingCont.value);
                const title = document.getElementById('continent-banner-title');
                if (title) title.textContent = `Base de Datos Continental: ${c.name}`;
                if (APP.state.sizing.solarProvider === 'continent' || (APP.state.sizing.solarResource && APP.state.sizing.solarResource.isFallback)) {
                    handlePVWattsQuery();
                }
            }
        });
    }
    const btnSwitchPvgis = document.getElementById('btn-banner-switch-pvgis');
    if (btnSwitchPvgis) {
        btnSwitchPvgis.addEventListener('click', () => {
            if (window.CONTINENTS_DB) CONTINENTS_DB.setMode('api');
            setSolarProvider('pvgis');
        });
    }

    const initMode = (window.CONTINENTS_DB && CONTINENTS_DB.getMode()) || 'api';
    setSolarProvider(initMode === 'manual' ? 'continent' : 'pvgis');

    // 6. Bind calculation buttons
    const btnQuery = document.getElementById('btn-pvwatts-query');
    if (btnQuery) {
        btnQuery.addEventListener('click', handlePVWattsQuery);
    }

    const btnCritAnual = document.getElementById('btn-crit-anual');
    const btnCritCritico = document.getElementById('btn-crit-critico');
    if (btnCritAnual && btnCritCritico) {
        btnCritAnual.addEventListener('click', () => {
            APP.state.sizing.criterion = 'anual';
            btnCritAnual.classList.add('active');
            btnCritCritico.classList.remove('active');
            updateSizing();
        });
        btnCritCritico.addEventListener('click', () => {
            APP.state.sizing.criterion = 'critico';
            btnCritCritico.classList.add('active');
            btnCritAnual.classList.remove('active');
            updateSizing();
        });
    }

    const btnViewMensual = document.getElementById('btn-view-mensual');
    const btnViewAnual = document.getElementById('btn-view-anual');
    if (btnViewMensual && btnViewAnual) {
        btnViewMensual.addEventListener('click', () => {
            APP.state.sizing.projectionView = 'mensual';
            btnViewMensual.classList.add('active');
            btnViewAnual.classList.remove('active');
            renderGenerationSection();
        });
        btnViewAnual.addEventListener('click', () => {
            APP.state.sizing.projectionView = 'anual';
            btnViewAnual.classList.add('active');
            btnViewMensual.classList.remove('active');
            renderGenerationSection();
        });
    }

    const btnEditMod = document.getElementById('btn-edit-modules');
    if (btnEditMod) {
        btnEditMod.addEventListener('click', (e) => {
            e.preventDefault();
            if (typeof window.openModuleEditorModal === 'function') {
                window.openModuleEditorModal();
            }
        });
    }

    // 4. Initial calculation
    updateSizing();
}

/** Bind input elements to state */
function bindSizingInputs() {
    const s = (window.APP || APP).state.sizing;

    const bindNumber = (id, prop, callback) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.value = (s[prop] !== null && s[prop] !== undefined) ? s[prop] : '';
        el.addEventListener('input', () => {
            if (el.value === '') {
                s[prop] = null;
                if (callback) callback();
                else updateSizing();
                return;
            }
            const v = parseFloat(el.value);
            if (!isNaN(v)) {
                s[prop] = v;
                if (callback) callback();
                else updateSizing();
            }
        });
    };

    bindNumber('sizing-area', 'availableArea');
    bindNumber('pvwatts-lat', 'lat');
    bindNumber('pvwatts-lon', 'lon');
    bindNumber('pvwatts-tilt', 'tilt');
    bindNumber('pvwatts-azimuth', 'azimuth');
    bindNumber('pvwatts-losses', 'losses');
    bindNumber('sizing-pr', 'pr');
    bindNumber('sizing-tmin', 'tmin');
    bindNumber('sizing-tamb-op', 'tambOp');

    // Array type selector (1: Roof, 0: Ground/Floor)
    const arrayTypeEl = document.getElementById('pvwatts-array-type');
    if (arrayTypeEl) {
        arrayTypeEl.value = s.arrayType;
        arrayTypeEl.addEventListener('change', () => {
            s.arrayType = parseInt(arrayTypeEl.value);
            updateSizing();
        });
    }
}

/** Configuration modal is initialized globally in app.js. Keep compatibility hook */
function initConfigModal() {
    // If not already bound, ensure button clicks call window.openConfigModal
    const btnConfig = document.getElementById('btn-config');
    if (btnConfig && !btnConfig.onclick) {
        btnConfig.onclick = (e) => {
            e.preventDefault();
            if (typeof window.openConfigModal === 'function') {
                window.openConfigModal();
            }
        };
    }
}

/** Bind default cases tabs under Dimensionamiento */
function bindDimensioningCases() {
    const caseBtns = document.querySelectorAll('.dim-case-btn');
    caseBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            selectDimensioningCase(btn.dataset.case);
        });
    });
}

/** Switch active dimensioning case and automate NASA POWER temperatures */
async function selectDimensioningCase(caseId, options = {}) {
    if (typeof loadCase === 'function') {
        loadCase(caseId, options);
        return;
    }

    // 1. Update active tab UI
    document.querySelectorAll('.dim-case-btn').forEach(b => b.classList.remove('active'));
    const targetBtn = document.querySelector(`.dim-case-btn[data-case="${caseId}"]`);
    if (targetBtn) targetBtn.classList.add('active');

    const s = APP.state.sizing;
    const badge = document.getElementById('pvwatts-status-badge');

    if (caseId === 'custom') {
        s.lat = null;
        s.lon = null;
        s.tilt = null;
        s.azimuth = null;
        s.solarResource = null;

        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.value = (val !== null && val !== undefined) ? val : '';
        };
        setVal('pvwatts-lat', '');
        setVal('pvwatts-lon', '');
        setVal('pvwatts-tilt', '');
        setVal('pvwatts-azimuth', '');

        if (badge) {
            badge.className = 'status-badge info';
            badge.textContent = 'Coordenadas Libres';
        }
        updateSizing();
        if (!options.silent) {
            showToast('Modo libre activado. Ingrese coordenadas y presione Cálculo Solar.', 'info');
        }
        return;
    }

    // 2. Retrieve location from SOLAR_DB
    const loc = (typeof SOLAR_DB !== 'undefined') ? SOLAR_DB.getById(caseId) : null;
    if (!loc) return;

    s.lat = loc.lat;
    s.lon = loc.lon;
    s.tilt = loc.tilt;
    s.azimuth = loc.azimuth;

    // Load baseline contingency temperatures
    s.tmin = loc.tmin || 20;
    s.tambOp = loc.tambOp || 32;

    s.solarResource = {
        source: loc.source,
        isFallback: false,
        isCached: false,
        lat: loc.lat,
        lon: loc.lon,
        tilt: loc.tilt,
        azimuth: loc.azimuth,
        annualHsp: loc.annualHsp,
        criticalMonthHsp: loc.criticalMonthHsp,
        criticalMonthIndex: loc.criticalMonthIndex,
        criticalMonthName: loc.criticalMonthName,
        maxMonthHsp: loc.maxMonthHsp || (loc.monthlyHsp ? Math.max(...loc.monthlyHsp) : loc.annualHsp),
        maxMonthIndex: loc.maxMonthIndex !== undefined ? loc.maxMonthIndex : (loc.monthlyHsp ? loc.monthlyHsp.indexOf(Math.max(...loc.monthlyHsp)) : 0),
        maxMonthName: loc.maxMonthName || (loc.monthlyHsp && SOLAR_DB.monthNames ? SOLAR_DB.monthNames[loc.monthlyHsp.indexOf(Math.max(...loc.monthlyHsp))] : 'Mes Máximo'),
        monthlyHsp: [...loc.monthlyHsp],
        queryDate: loc.consultationDate,
        notes: loc.notes
    };

    // Sync input fields
    const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = val;
    };

    setVal('pvwatts-lat', s.lat);
    setVal('pvwatts-lon', s.lon);
    setVal('pvwatts-tilt', s.tilt);
    setVal('pvwatts-azimuth', s.azimuth);
    setVal('sizing-tmin', s.tmin);
    setVal('sizing-tamb-op', s.tambOp);

    if (badge) {
        badge.className = 'status-badge info';
        badge.textContent = `${loc.shortName || loc.name} · Sincronizando NASA POWER...`;
    }

    // Immediate calculation with documented values
    updateSizing();

    // 3. Automated query to NASA POWER Climatology API (20-year history)
    if (window.NASA_POWER_SERVICE) {
        try {
            const nasaData = await NASA_POWER_SERVICE.fetchTemperatures(s.lat, s.lon);
            s.tmin = nasaData.tmin;
            s.tambOp = nasaData.tambOp;
            setVal('sizing-tmin', s.tmin);
            setVal('sizing-tamb-op', s.tambOp);

            if (badge) {
                badge.className = 'status-badge success';
                badge.textContent = `${loc.shortName || loc.name} · Tmin NASA: ${s.tmin}°C`;
            }
            updateSizing();
            showToast(`Temperaturas NASA POWER (${loc.shortName || loc.name}): Tmin=${s.tmin}°C, Tamb=${s.tambOp}°C`, 'success');
        } catch (e) {
            console.warn('Error consultando NASA POWER:', e);
            if (badge) {
                badge.className = 'status-badge info';
                badge.textContent = `${loc.shortName || loc.name} (Tmin local: ${s.tmin}°C)`;
            }
        }
    }
}

/** Handle query to PVWatts, PVGIS or Continental Database */
async function handlePVWattsQuery() {
    const s = APP.state.sizing;
    const btn = document.getElementById('btn-pvwatts-query');
    const badge = document.getElementById('pvwatts-status-badge');
    const mode = window.CONTINENTS_DB ? CONTINENTS_DB.getMode() : 'api';
    const isManualContinental = (mode === 'manual' || s.solarProvider === 'continent');

    if (s.isFixedCase && s.solarResource) {
        updateSizing();
        if (badge) {
            badge.className = 'status-badge success';
            badge.textContent = `🔒 ${s.activeCaseId === 'caso-1' ? 'Caso 1' : 'Caso Fijo'} · PVGIS Fijo`;
        }
        showToast('Cálculo solar actualizado con los datos certificados del caso.', 'success');
        return;
    }

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-sm"></span> Calculando...';
    }

    try {
        // A. MODO MANUAL / BASE CONTINENTAL (Sin peticiones de red a APIs)
        if (isManualContinental) {
            const contId = window.CONTINENTS_DB ? CONTINENTS_DB.getSelectedContinent() : 'America_del_Sur';
            const contRes = window.CONTINENTS_DB ? CONTINENTS_DB.toSolarResource(contId, {
                isFallback: false,
                lat: s.lat,
                lon: s.lon,
                tilt: s.tilt || 0,
                azimuth: s.azimuth || 180
            }) : null;

            if (contRes) {
                s.solarResource = contRes;
                s.tmin = contRes.tempMinimaExtrema;
                s.tambOp = contRes.tempAmbientePromedio;

                const elTmin = document.getElementById('sizing-tmin');
                const elTamb = document.getElementById('sizing-tamb-op');
                if (elTmin) elTmin.value = s.tmin;
                if (elTamb) elTamb.value = s.tambOp;

                const contBanner = document.getElementById('continent-active-banner');
                const contTitle = document.getElementById('continent-banner-title');
                const contDesc = document.getElementById('continent-banner-desc');
                const selCont = document.getElementById('sizing-continent-select');
                if (contBanner) contBanner.style.display = 'flex';
                if (contTitle) contTitle.textContent = `Base de Datos Continental: ${contRes.continentName}`;
                if (contDesc) contDesc.innerHTML = '⚠️ <strong>Aviso metodológico:</strong> La irradiancia de esta base es <strong>horizontal (GHI)</strong>, no hacia el plano inclinado.';
                if (selCont) selCont.value = contRes.continentId;

                if (badge) {
                    badge.className = 'status-badge info';
                    badge.textContent = `🌍 ${contRes.continentName} (GHI)`;
                }

                updateSizing();
                showToast(`Cálculo cargado con base continental: ${contRes.continentName} (GHI Horizontal).`, 'success');
                return;
            }
        }

        // B. MODO EN LÍNEA POR API (PVGIS / PVWatts)
        if (s.lat === null || s.lat === undefined || isNaN(s.lat) || s.lon === null || s.lon === undefined || isNaN(s.lon)) {
            showToast('Por favor ingrese las coordenadas (Latitud y Longitud) antes de calcular.', 'warning');
            return;
        }

        const isPvgis = s.solarProvider === 'pvgis';
        let solarPromise;
        if (isPvgis) {
            solarPromise = window.PVGIS_SERVICE
                ? PVGIS_SERVICE.fetchSolarResource({ lat: s.lat, lon: s.lon, forceRefresh: true })
                : Promise.reject(new Error('Servicio PVGIS no inicializado'));
        } else {
            solarPromise = window.PVWATTS_SERVICE
                ? PVWATTS_SERVICE.fetchSolarResource({
                    lat: s.lat,
                    lon: s.lon,
                    tilt: s.tilt,
                    azimuth: s.azimuth,
                    arrayType: s.arrayType,
                    losses: s.losses,
                    forceRefresh: true
                })
                : Promise.reject(new Error('Servicio PVWatts no inicializado'));
        }

        const [solarResult, nasaResult] = await Promise.allSettled([
            solarPromise,
            window.NASA_POWER_SERVICE ? NASA_POWER_SERVICE.fetchTemperatures(s.lat, s.lon) : Promise.resolve(null)
        ]);

        let isFallbackData = false;
        if (solarResult.status === 'fulfilled' && solarResult.value) {
            s.solarResource = solarResult.value;
            isFallbackData = !!solarResult.value.isFallback;

            if (isPvgis && !isFallbackData) {
                s.tilt = solarResult.value.tilt;
                s.azimuth = solarResult.value.azimuth;
                const bTilt = document.getElementById('badge-pvgis-tilt');
                const bAz = document.getElementById('badge-pvgis-azimuth');
                if (bTilt) bTilt.textContent = `Inclinación: ${s.tilt}°`;
                if (bAz) bAz.textContent = `Azimut: ${s.azimuth}°`;
            }
        }

        let nasaSuccess = false;
        if (nasaResult.status === 'fulfilled' && nasaResult.value) {
            s.tmin = nasaResult.value.tmin;
            s.tambOp = nasaResult.value.tambOp;
            nasaSuccess = true;
            const elTmin = document.getElementById('sizing-tmin');
            const elTamb = document.getElementById('sizing-tamb-op');
            if (elTmin) elTmin.value = s.tmin;
            if (elTamb) elTamb.value = s.tambOp;
        } else if (isFallbackData && s.solarResource && s.solarResource.tempMinimaExtrema !== undefined) {
            // Apply continental temperatures if NASA fails in fallback mode
            s.tmin = s.solarResource.tempMinimaExtrema;
            s.tambOp = s.solarResource.tempAmbientePromedio;
            const elTmin = document.getElementById('sizing-tmin');
            const elTamb = document.getElementById('sizing-tamb-op');
            if (elTmin) elTmin.value = s.tmin;
            if (elTamb) elTamb.value = s.tambOp;
        }

        // Update badge and banners
        const contBanner = document.getElementById('continent-active-banner');
        const contTitle = document.getElementById('continent-banner-title');
        const contDesc = document.getElementById('continent-banner-desc');
        const selCont = document.getElementById('sizing-continent-select');

        if (badge) {
            const solOk = solarResult.status === 'fulfilled';
            const providerName = isPvgis ? 'PVGIS' : 'PVWatts';

            if (solOk && !isFallbackData) {
                badge.className = 'status-badge success';
                badge.textContent = isPvgis ? '🟢 PVGIS en vivo' : '🟢 PVWatts en vivo';
                if (contBanner) contBanner.style.display = 'none';
                showToast(`Recurso solar (${providerName}) sincronizado en vivo.`, 'success');
            } else {
                const contName = (s.solarResource && s.solarResource.continentName) ? s.solarResource.continentName : 'Continental';
                badge.className = 'status-badge warning';
                badge.textContent = `🟡 Respaldo: ${contName}`;

                if (contBanner) contBanner.style.display = 'flex';
                if (contTitle) contTitle.textContent = `Respaldo Continental: ${contName}`;
                if (contDesc) contDesc.innerHTML = '⚠️ <strong>APIs remotas no disponibles:</strong> Se activó contingencia continental. Aviso: La irradiancia es <strong>horizontal (GHI)</strong>, no hacia el plano inclinado.';
                if (selCont && s.solarResource && s.solarResource.continentId) selCont.value = s.solarResource.continentId;

                showToast(`Las APIs no respondieron. Se aplicó contingencia continental (${contName} · GHI Horizontal).`, 'warning');
            }
        }

        updateSizing();

    } catch (err) {
        console.error('Error al consultar APIs:', err);
        showToast('Error en consulta de recurso solar: ' + err.message, 'error');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<span class="btn-icon" style="font-size: 0.9rem;">☀️</span> Cálculo Solar';
        }
    }
}

/** Toggle solar provider between PVGIS (default), PVWatts and Continental Database */
function setSolarProvider(provider) {
    const s = APP.state.sizing;
    s.solarProvider = provider;

    const btnPvgis = document.getElementById('btn-provider-pvgis');
    const btnPvwatts = document.getElementById('btn-provider-pvwatts');
    const btnContinent = document.getElementById('btn-provider-continent');
    const titleEl = document.getElementById('solar-resource-main-title');
    const bannerEl = document.getElementById('pvgis-optimal-banner');
    const recBannerEl = document.getElementById('pvwatts-recommendation-banner');
    const contBannerEl = document.getElementById('continent-active-banner');
    const pvwMountingLosses = document.getElementById('row-pvwatts-mounting-losses');
    const fieldTilt = document.getElementById('field-group-tilt');
    const fieldAzimuth = document.getElementById('field-group-azimuth');
    const refBadge = document.getElementById('solar-chart-ref-badge');

    if (btnPvgis) btnPvgis.classList.toggle('active', provider === 'pvgis');
    if (btnPvwatts) btnPvwatts.classList.toggle('active', provider === 'pvwatts');
    if (btnContinent) btnContinent.classList.toggle('active', provider === 'continent');

    if (provider === 'continent') {
        if (titleEl) titleEl.textContent = 'Recurso solar — Base Continental (GHI Horizontal)';
        if (bannerEl) bannerEl.style.display = 'none';
        if (recBannerEl) recBannerEl.style.display = 'none';
        if (contBannerEl) contBannerEl.style.display = 'flex';
        if (pvwMountingLosses) pvwMountingLosses.style.display = 'none';
        if (fieldTilt) fieldTilt.style.display = 'none';
        if (fieldAzimuth) fieldAzimuth.style.display = 'none';
        if (refBadge) refBadge.textContent = 'Referencia: Base de Datos Continental (GHI Horizontal)';

        const selCont = document.getElementById('sizing-continent-select');
        if (selCont && window.CONTINENTS_DB) {
            selCont.value = CONTINENTS_DB.getSelectedContinent();
            const contData = CONTINENTS_DB.get(selCont.value);
            const bannerTitle = document.getElementById('continent-banner-title');
            if (bannerTitle) bannerTitle.textContent = `Base de Datos Continental: ${contData.name}`;
        }
    } else if (provider === 'pvgis') {
        if (titleEl) titleEl.textContent = 'Recurso solar — PVGIS (Comisión Europea)';
        if (bannerEl) bannerEl.style.display = 'inline-flex';
        if (recBannerEl) recBannerEl.style.display = 'none';
        if (contBannerEl && (!s.solarResource || !s.solarResource.isFallback)) contBannerEl.style.display = 'none';
        if (pvwMountingLosses) pvwMountingLosses.style.display = 'none';
        if (fieldTilt) fieldTilt.style.display = 'none';
        if (fieldAzimuth) fieldAzimuth.style.display = 'none';
        if (refBadge) refBadge.textContent = 'Referencia: PVGIS (JRC Comisión Europea · Ángulos Óptimos)';
    } else {
        if (titleEl) titleEl.textContent = 'Recurso solar — NREL PVWatts v8';
        if (bannerEl) bannerEl.style.display = 'none';
        if (recBannerEl) recBannerEl.style.display = 'inline-flex';
        if (contBannerEl && (!s.solarResource || !s.solarResource.isFallback)) contBannerEl.style.display = 'none';
        if (pvwMountingLosses) pvwMountingLosses.style.display = 'grid';
        if (fieldTilt) fieldTilt.style.display = 'block';
        if (fieldAzimuth) fieldAzimuth.style.display = 'block';
        if (refBadge) refBadge.textContent = 'Referencia: NREL PVWatts v8 (Serie 2025)';
    }
}

/**
 * Recomputes solar resource metrics (annual average, critical month, max month)
 * strictly considering the active (non-cancelled) operating months.
 */
function recomputeHspMetrics(s) {
    if (!s || !s.solarResource || !s.solarResource.monthlyHsp) return;
    const res = s.solarResource;
    const monthlyHsp = res.monthlyHsp;
    const disabled = s.disabledMonths || [];

    const monthNames = (typeof SOLAR_DB !== 'undefined' && SOLAR_DB.monthNames)
        ? SOLAR_DB.monthNames
        : ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    // Operating month indices (0..11)
    let activeIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].filter(i => !disabled.includes(i));
    if (activeIndices.length === 0) {
        activeIndices = [0];
        s.disabledMonths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    }

    // 1. Average HSP of active operating months
    const sumActive = activeIndices.reduce((acc, i) => acc + monthlyHsp[i], 0);
    res.annualHsp = Math.round((sumActive / activeIndices.length) * 100) / 100;

    // 2. Minimum HSP among active months (critical month: selects second lowest if lowest was cancelled)
    let critIdx = activeIndices[0];
    for (const i of activeIndices) {
        if (monthlyHsp[i] < monthlyHsp[critIdx]) {
            critIdx = i;
        }
    }
    res.criticalMonthIndex = critIdx;
    res.criticalMonthHsp = monthlyHsp[critIdx];
    res.criticalMonthName = monthNames[critIdx];

    // 3. Maximum HSP among active months (selects second highest if highest was cancelled)
    let maxIdx = activeIndices[0];
    for (const i of activeIndices) {
        if (monthlyHsp[i] > monthlyHsp[maxIdx]) {
            maxIdx = i;
        }
    }
    res.maxMonthIndex = maxIdx;
    res.maxMonthHsp = monthlyHsp[maxIdx];
    res.maxMonthName = monthNames[maxIdx];
}

/**
 * Toggles an operating month on/off by clicking its bar or label.
 * Cancelled months appear grey and are excluded from average, min and max HSP calculations.
 */
function toggleOperatingMonth(monthIdx) {
    const s = APP.state.sizing;
    s.disabledMonths = s.disabledMonths || [];

    const monthNames = (typeof SOLAR_DB !== 'undefined' && SOLAR_DB.monthNames)
        ? SOLAR_DB.monthNames
        : ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const name = monthNames[monthIdx] || `Mes ${monthIdx + 1}`;

    const existsIndex = s.disabledMonths.indexOf(monthIdx);
    if (existsIndex >= 0) {
        // Re-activate month
        s.disabledMonths.splice(existsIndex, 1);
        showToast(`${name} reactivado en el cálculo operativo.`, 'info');
    } else {
        // Cancel / suspend month
        const activeCount = 12 - s.disabledMonths.length;
        if (activeCount <= 1) {
            showToast('Debe mantenerse al menos un mes operativo.', 'warning');
            return;
        }
        s.disabledMonths.push(monthIdx);
        showToast(`${name} suspendido (no operativo). Barra en gris.`, 'warning');
    }

    updateSizing();
}

/**
 * Main update function for Sizing module
 */
function updateSizing() {
    const s = APP.state.sizing;
    s.disabledMonths = s.disabledMonths || [];
    recomputeHspMetrics(s);

    const profile = calcHourlyProfile();
    const edKwh = calcDailyEnergy(profile);
    const pmax = calcMaxDemand(profile);

    // 1. Update Inherited Data Banner (RF-13)
    const inheritedEd = document.getElementById('inh-ed');
    const inheritedPmax = document.getElementById('inh-pmax');
    const inheritedEm = document.getElementById('inh-em');
    const inheritedEa = document.getElementById('inh-ea');

    const emKwh = typeof calcMonthlyEnergy === 'function' ? calcMonthlyEnergy() : (edKwh * (APP.state.config.daysPerMonth || 30));
    const eaKwh = typeof calcAnnualEnergy === 'function' ? calcAnnualEnergy() : (emKwh * (APP.state.config.monthsPerYear || 12));

    if (inheritedEd) inheritedEd.textContent = `${edKwh.toFixed(3)} kWh/día`;
    if (inheritedPmax) inheritedPmax.textContent = `${pmax.toLocaleString('es-CO')} W`;
    if (inheritedEm) inheritedEm.textContent = `${emKwh.toFixed(2)} kWh/mes`;
    if (inheritedEa) inheritedEa.textContent = `${eaKwh.toFixed(2)} kWh/año`;

    // 2. Solar Window Coincidence (RF-17)
    const solarWin = PV_SIZING.calcSolarWindowCoincidence(profile, APP.state.config.dayStart || 6, APP.state.config.dayEnd || 18);
    s.solarWindow = solarWin;

    const winInside = document.getElementById('win-inside');
    const winOutside = document.getElementById('win-outside');
    const winBarInside = document.getElementById('win-bar-inside');

    if (winInside) winInside.textContent = `${solarWin.insideKwh.toFixed(3)} kWh (${solarWin.insidePercent}%)`;
    if (winOutside) winOutside.textContent = `${solarWin.outsideKwh.toFixed(3)} kWh (${solarWin.outsidePercent}%)`;
    if (winBarInside) winBarInside.style.width = `${solarWin.insidePercent}%`;

    // 3. Current active HSP based on selected criterion (RF-16)
    const res = s.solarResource;
    const hasResource = !!(res && res.monthlyHsp && res.monthlyHsp.length === 12);
    const isAnual = s.criterion === 'anual';
    const activeHsp = hasResource ? (isAnual ? res.annualHsp : res.criticalMonthHsp) : 0;

    const opCount = 12 - (s.disabledMonths ? s.disabledMonths.length : 0);
    const opSuffix = opCount < 12 ? ` (${opCount} meses op.)` : '';

    // Display resource metrics
    const elHspAnual = document.getElementById('disp-hsp-anual');
    const elHspCrit = document.getElementById('disp-hsp-critico');
    const elHspMax = document.getElementById('disp-hsp-maximo');
    const elHspActive = document.getElementById('disp-hsp-active');

    if (hasResource) {
        if (elHspAnual) elHspAnual.textContent = `${res.annualHsp.toFixed(2)} h/día${opSuffix}`;
        if (elHspCrit) elHspCrit.textContent = `${res.criticalMonthHsp.toFixed(2)} h/día (${res.criticalMonthName || 'Mes Crítico'})`;
        if (elHspMax) {
            elHspMax.textContent = `${res.maxMonthHsp.toFixed(2)} h/día (${res.maxMonthName || 'Mes Máximo'})`;
        }
        if (elHspActive) elHspActive.textContent = `${activeHsp.toFixed(2)} h/día`;
    } else {
        if (elHspAnual) elHspAnual.textContent = '— h/día';
        if (elHspCrit) elHspCrit.textContent = '— h/día';
        if (elHspMax) elHspMax.textContent = '— h/día';
        if (elHspActive) elHspActive.textContent = '— h/día';
    }

    // Update PVGIS optimal geometry badges
    const badgeTilt = document.getElementById('badge-pvgis-tilt');
    const badgeAz = document.getElementById('badge-pvgis-azimuth');
    if (badgeTilt) {
        const tiltVal = s.tilt !== null && s.tilt !== undefined && s.tilt !== '' ? s.tilt : (res ? res.tilt : null);
        badgeTilt.textContent = tiltVal !== null && tiltVal !== undefined ? `Inclinación: ${tiltVal}°` : 'Inclinación: —';
    }
    if (badgeAz) {
        const azVal = s.azimuth !== null && s.azimuth !== undefined && s.azimuth !== '' ? s.azimuth : (res ? res.azimuth : null);
        badgeAz.textContent = azVal !== null && azVal !== undefined ? `Azimut: ${azVal}°` : 'Azimut: —';
    }

    // Render / update monthly irradiance table and chart
    updateSolarMonthlyDisplay(res, s.disabledMonths);

    // 4. Calculate Peak Power (RF-18)
    const peakPowerKwp = (hasResource && activeHsp > 0) ? PV_SIZING.calcPeakPower(edKwh, activeHsp, s.pr) : 0;
    const dispPpeak = document.getElementById('disp-ppeak-kwp');
    const dispPpeakFormula = document.getElementById('disp-ppeak-formula');

    if (hasResource && activeHsp > 0) {
        if (dispPpeak) dispPpeak.textContent = `${peakPowerKwp.toFixed(2)} kWp`;
        if (dispPpeakFormula) {
            dispPpeakFormula.textContent = `Ppico = ${edKwh.toFixed(3)} kWh / (${activeHsp.toFixed(2)} h × ${s.pr.toFixed(2)}) = ${peakPowerKwp.toFixed(2)} kWp`;
        }
    } else {
        if (dispPpeak) dispPpeak.textContent = '0.00 kWp';
        if (dispPpeakFormula) {
            dispPpeakFormula.textContent = 'Ppico = Ingrese coordenadas y presione "Cálculo Solar" para dimensionar.';
        }
    }

    // 5. Evaluate modules (RF-19, RF-20, RF-21, RF-22, RF-23)
    const isEstandar = !!(s.lockedModule || s.activeCaseId === 'caso-estandar');
    let modules;
    if (isEstandar) {
        modules = [MODULES_DB.getStandardModule()];
        s.selectedModuleId = 'panel-estandar';
    } else {
        modules = MODULES_DB.getAll().filter(m => m.id !== 'panel-estandar');
        if (s.selectedModuleId === 'panel-estandar') {
            s.selectedModuleId = 'panel-150w';
        }
    }

    const evaluated = PV_SIZING.evaluateAllModules(modules, {
        edKwh,
        hsp: activeHsp,
        pr: s.pr,
        tmin: s.tmin,
        tambOp: s.tambOp,
        vmaxSystem: s.vmaxSystem,
        availableArea: s.availableArea
    });

    s.evaluatedModules = evaluated;
    s.selectedResult = evaluated.find(r => r.module.id === s.selectedModuleId) || evaluated[0];

    // Update dynamic Voc/Vmp table headers
    const thVoc = document.getElementById('th-voc-tmin');
    if (thVoc) thVoc.textContent = `Voc @ Tmin (${s.tmin}°C) [≤${s.vmaxSystem}V]`;
    const thVmp = document.getElementById('th-vmp-top');
    if (thVmp) thVmp.textContent = `Vmp @ Top (${s.tambOp}°C)`;

    // Update dynamic NTC 2050 limit badge
    const badgeNtc = document.getElementById('badge-ntc-vmax');
    if (badgeNtc) {
        if (s.vmaxSystem === 1000) {
            badgeNtc.textContent = 'Máx. 1000 V (Industrial NTC 2050)';
            badgeNtc.style.color = '#a855f7';
            badgeNtc.style.background = 'rgba(168, 85, 247, 0.15)';
            badgeNtc.style.border = '1px solid rgba(168, 85, 247, 0.4)';
        } else {
            badgeNtc.textContent = 'Máx. 600 V (Residencial NTC 2050)';
            badgeNtc.style.color = '#38bdf8';
            badgeNtc.style.background = 'rgba(56, 189, 248, 0.15)';
            badgeNtc.style.border = '1px solid rgba(56, 189, 248, 0.4)';
        }
    }

    // 6. Render comparison cards & table
    renderModuleCards(evaluated);
    renderModuleTable(evaluated);

    // 7. Render Generation projections
    renderGenerationSection();
}

/** Render the module summary cards (1 for Caso Estándar, 3 for general cases) */
function renderModuleCards(evaluated) {
    const container = document.getElementById('module-cards-container');
    if (!container) return;

    const s = APP.state.sizing;
    const isEstandar = !!(s.lockedModule || s.activeCaseId === 'caso-estandar');
    const isEn = window.APP_LANG === 'en';

    // Gear icon button for editing catalog
    const btnEditMod = document.getElementById('btn-edit-modules');
    if (btnEditMod) {
        btnEditMod.style.display = isEstandar ? 'none' : 'inline-flex';
    }

    if (isEstandar) {
        container.style.gridTemplateColumns = 'minmax(320px, 460px)';
        container.style.justifyContent = 'center';
    } else {
        container.style.gridTemplateColumns = '';
        container.style.justifyContent = '';
    }

    container.innerHTML = evaluated.map(item => {
        const isSelected = item.module.id === s.selectedModuleId || isEstandar;
        const fitClass = item.fitsArea ? 'status-ok' : 'status-danger';
        const fitText = item.fitsArea
            ? (isEn ? '✓ Fits available area' : '✓ Cabe en el área')
            : (isEn ? '✗ Does not fit (insufficient area)' : '✗ No cabe (insuficiente)');
        const excedentSign = item.excedentPercent >= 0 ? '+' : '';
        const fallbackName = isEn
            ? (item.module.id === 'panel-estandar' ? 'Official Reference Module' : item.module.id === 'panel-150w' ? 'Module 1' : item.module.id === 'panel-330w' ? 'Module 2' : 'Module 3')
            : (item.module.id === 'panel-estandar' ? 'Módulo de Referencia Oficial' : item.module.id === 'panel-150w' ? 'Módulo 1' : item.module.id === 'panel-330w' ? 'Módulo 2' : 'Módulo 3');
        const cleanName = isEstandar
            ? (isEn ? 'Declared Reference Module (Standard Case)' : 'Módulo de Referencia Declarado (Caso Estándar)')
            : ((item.module.name || '').replace(/[-_].*$/, '').trim() || fallbackName);
        const hasGen = item.finalModCount > 0;

        const vocMod = item.vocTmin;
        const vmpMod = item.vmpModOp || PV_SIZING.calcVmpAtTemp(item.module.vmp, item.module.tempCoefVoc, item.tCellOp || 45);
        const iscMod = item.module.isc;
        const idesignMod = Math.round(1.25 * 1.25 * iscMod * 10) / 10;
        const impMod = item.module.imp;

        const displayVoc = hasGen ? `${item.vocGeneratorTmin.toFixed(1)} V` : `${vocMod.toFixed(1)} V`;
        const displayVmp = hasGen ? `${item.vmpGeneratorOp.toFixed(1)} V` : `${vmpMod.toFixed(1)} V`;
        const displayIdesign = hasGen ? `${item.idesign.toFixed(1)} A` : `${idesignMod.toFixed(1)} A`;
        const displayImp = hasGen ? `${item.impGenerator.toFixed(1)} A` : `${impMod.toFixed(1)} A`;
        const displayStrings = hasGen ? `${item.np}PX${item.ns}S` : `0PX0S`;

        const badgeLockedHtml = isEstandar ? `
            <div style="margin-bottom: 0.6rem; padding: 0.35rem 0.6rem; background: rgba(56, 189, 248, 0.12); border: 1px solid rgba(56, 189, 248, 0.35); border-radius: 6px; font-size: 0.76rem; color: #38bdf8; display: flex; align-items: center; justify-content: center; gap: 0.4rem; font-weight: 600;">
                <span>🔒</span> ${isEn ? 'Exclusive Official Reference — Not modifiable' : 'Referencia Oficial Exclusiva — No modificable'}
            </div>
        ` : '';

        const buttonHtml = isEstandar ? `
            <button class="btn btn-sm btn-primary btn-select-mod" style="margin-top: 0.8rem; width: 100%; cursor: default; opacity: 0.95;" onclick="event.stopPropagation();">
                ${isEn ? '★ Unique Official Module (Standard Case)' : '★ Módulo Oficial Único (Caso Estándar)'}
            </button>
        ` : `
            <button class="btn btn-sm ${isSelected ? 'btn-primary' : 'btn-ghost'} btn-select-mod" style="margin-top: 0.8rem; width: 100%;">
                ${isSelected ? (isEn ? '★ Selected Module' : '★ Módulo Seleccionado') : (isEn ? 'Select this Reference' : 'Seleccionar esta Referencia')}
            </button>
        `;

        return `
        <div class="module-card ${isSelected ? 'selected' : ''}" onclick="selectModule('${item.module.id}')">
            ${badgeLockedHtml}
            <div class="module-card-header" style="justify-content: flex-end;">
                <span class="module-pmax">${item.module.pmax} Wp</span>
            </div>
            <h3 class="module-name" style="margin-top: 0.25rem; margin-bottom: 0.75rem;">${cleanName}</h3>

            <!-- Voc del Sistema con la menor temperatura de la ubicación -->
            <div class="voc-tmin-callout" style="background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 8px; padding: 0.65rem 0.85rem; margin: 0.8rem 0;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size:0.78rem; text-transform:uppercase; font-weight:700; color:var(--accent);">${isEn ? 'System Voc @ Tmin' : 'Voc Sistema @ Tmin'} (${s.tmin}°C) [≤${s.vmaxSystem}V]</span>
                    <span class="voc-system-val">${displayVoc}</span>
                </div>
                <div class="voc-details-row" style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px; font-size: 0.8rem; font-weight: 700; white-space: nowrap; gap: 0.35rem;">
                    <span>Voc: ${vocMod.toFixed(2)} V</span>
                    <span style="font-size: 0.86rem; font-weight: 800; background: rgba(245, 158, 11, 0.15); padding: 2px 6px; border-radius: 4px;">${displayStrings}</span>
                    <span>${isEn ? 'Max Ns' : 'Ns máx'}: ${item.nsMax}</span>
                </div>
            </div>

            <div class="module-metrics-grid">
                <div class="metric-item">
                    <span class="m-label">${isEn ? 'Modules' : 'Módulos'}</span>
                    <span class="m-val highlight">${item.finalModCount} un.</span>
                </div>
                <div class="metric-item">
                    <span class="m-label">${isEn ? 'Inst. Power' : 'Potencia Inst.'}</span>
                    <span class="m-val">${item.installedPowerKwp.toFixed(2)} kWp</span>
                </div>
                <div class="metric-item">
                    <span class="m-label">${isEn ? 'Surplus' : 'Excedente'}</span>
                    <span class="m-val">${excedentSign}${item.excedentPercent.toFixed(1)}%</span>
                </div>
                <div class="metric-item" title="Tensión Vmp a temperatura real de operación de la celda Tc (${item.tCellOp.toFixed(1)}°C con G=800 W/m²). Vmp módulo: ${vmpMod.toFixed(2)} V · Ns: ${item.ns}">
                    <span class="m-label">${isEn ? 'Op. Vmp' : 'Vmp Op.'} (@${item.tCellOp.toFixed(1)}°C)</span>
                    <span class="m-val">${displayVmp}</span>
                </div>
                <div class="metric-item">
                    <span class="m-label">${isEn ? 'Design I (690-8)' : 'I diseño (690-8)'}</span>
                    <span class="m-val">${displayIdesign}</span>
                </div>
                <div class="metric-item">
                    <span class="m-label">${isEn ? 'System Imp' : 'Imp Sist.'}</span>
                    <span class="m-val">${displayImp}</span>
                </div>
                <div class="metric-item">
                    <span class="m-label">${isEn ? 'Generator Area' : 'Área Generador'}</span>
                    <span class="m-val">${item.totalArea.toFixed(2)} m²</span>
                </div>
                <div class="metric-item">
                    <span class="m-label">${isEn ? 'Est. Generation' : 'Generación Est.'}</span>
                    <span class="m-val">${item.estimatedDailyKwh.toFixed(2)} kWh/d</span>
                </div>
            </div>

            <div class="area-badge ${fitClass}">
                ${fitText} (${item.totalArea.toFixed(1)} m² ${isEn ? 'of' : 'de'} ${item.availableArea} m²)
            </div>

            ${buttonHtml}
            ${item.module.url && item.module.url.trim() !== '' ? `
            <a href="${item.module.url}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation();" class="btn btn-sm btn-module-ref" style="margin-top: 0.4rem; width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.35rem; background: #0284c7; color: #ffffff !important; font-size: 0.8rem; font-weight: 600; text-decoration: none; border-radius: var(--radius-sm); padding: 0.42rem 0.6rem; border: none; cursor: pointer; transition: all 0.2s ease;">
                🔗 ${isEn ? 'Datasheet' : 'Referencia'}
            </a>
            ` : ''}
        </div>
        `;
    }).join('');
}

/** Render detailed technical comparison table (blue catalog table) */
function renderModuleTable(evaluated) {
    const table = document.getElementById('table-modules-catalog');
    const tbody = document.getElementById('modules-comparison-tbody');
    if (!tbody || !table) return;

    const s = APP.state.sizing;
    const isEstandar = !!(s.lockedModule || s.activeCaseId === 'caso-estandar');
    const isEn = window.APP_LANG === 'en';

    const formatVal = (val, unit = '') => {
        if (val === undefined || val === null || val === '' || isNaN(val)) return '—';
        return `${val}${unit ? ' ' + unit : ''}`;
    };

    const formatSign = (val, unit = '') => {
        if (val === undefined || val === null || val === '' || isNaN(val)) return '—';
        const num = Number(val);
        const sign = num > 0 ? '+' : '';
        return `${sign}${val}${unit ? ' ' + unit : ''}`;
    };

    if (isEstandar) {
        // Adapt table layout to 2 columns (Parámetro and Módulo de Referencia 550 Wp)
        const colgroup = table.querySelector('colgroup');
        if (colgroup) {
            colgroup.innerHTML = `
                <col style="width: 45%;">
                <col style="width: 55%;">
            `;
        }
        const thead = table.querySelector('thead');
        if (thead) {
            thead.innerHTML = `
                <tr>
                    <th style="width: 45%; text-align: left;">${isEn ? 'Parameter (Table 7.2 Reference module)' : 'Parámetro (Tabla 7.2 Módulo de referencia)'}</th>
                    <th style="width: 55%; text-align: center;">${isEn ? 'Declared Reference Module (550 Wp)' : 'Módulo de Referencia Declarado (550 Wp)'}</th>
                </tr>
            `;
        }

        const m = (evaluated && evaluated.length > 0) ? evaluated[0].module : MODULES_DB.getStandardModule();

        const rows = [
            { label: isEn ? 'Peak power (Pmax)' : 'Potencia pico (Pmax)', val: formatVal(m.pmax, 'Wp') },
            { label: isEn ? 'Cells in series' : 'Celdas en serie', val: `${m.cellsInSeries || 72}` },
            { label: isEn ? 'Open circuit voltage (Voc)' : 'Tensión de circuito abierto (Voc)', val: formatVal(m.voc, 'V') },
            { label: isEn ? 'Short circuit current (Isc)' : 'Corriente de cortocircuito (Isc)', val: formatVal(m.isc, 'A') },
            { label: isEn ? 'Maximum power voltage (Vmp)' : 'Tensión en punto de máxima potencia (Vmp)', val: formatVal(m.vmp, 'V') },
            { label: isEn ? 'Maximum power current (Imp)' : 'Corriente en punto de máxima potencia (Imp)', val: formatVal(m.imp, 'A') },
            { label: isEn ? 'Module area' : 'Área del módulo', val: formatVal(m.area, 'm²') },
            { label: isEn ? 'Temperature coefficient of Voc (β)' : 'Coeficiente de temperatura de Voc (β)', val: formatSign(m.tempCoefVoc, '%/°C') },
            { label: isEn ? 'Temperature coefficient of Isc (α)' : 'Coeficiente de temperatura de Isc (α)', val: formatSign(m.tempCoefIsc, '%/°C') },
            { label: isEn ? 'Temperature coefficient of Pmp (γ)' : 'Coeficiente de temperatura de Pmp (γ)', val: formatSign(m.tempCoefPmp, '%/°C') },
            { label: isEn ? 'Nominal operating cell temperature (NOCT)' : 'Temperatura de operación nominal de celda (NOCT)', val: formatVal(m.noct, '°C') },
            { label: isEn ? 'Declared efficiency' : 'Eficiencia declarada', val: formatVal(m.efficiency, '%') }
        ];

        tbody.innerHTML = rows.map(r => `
            <tr>
                <td style="font-weight: 600; text-align: left; padding: 0.52rem 1rem 0.52rem 1.25rem;">${r.label}</td>
                <td style="text-align: center; font-weight: 700; color: var(--accent); padding: 0.52rem 1rem;">${r.val}</td>
            </tr>
        `).join('');
        return;
    }

    // Normal 3 modules table
    const colgroup = table.querySelector('colgroup');
    if (colgroup) {
        colgroup.innerHTML = `
            <col style="width: 25%;">
            <col style="width: 25%;">
            <col style="width: 25%;">
            <col style="width: 25%;">
        `;
    }
    const thead = table.querySelector('thead');
    if (thead) {
        thead.innerHTML = `
            <tr>
                <th style="width: 25%; text-align: left;">${isEn ? 'Parameter' : 'Parámetro'}</th>
                <th style="width: 25%; text-align: center;">${isEn ? 'Module 1' : 'Módulo 1'}</th>
                <th style="width: 25%; text-align: center;">${isEn ? 'Module 2' : 'Módulo 2'}</th>
                <th style="width: 25%; text-align: center;">${isEn ? 'Module 3' : 'Módulo 3'}</th>
            </tr>
        `;
    }

    const regularModules = MODULES_DB.getAll().filter(m => m.id !== 'panel-estandar');
    const modules = (evaluated && evaluated.length === 3)
        ? evaluated.map(e => e.module)
        : regularModules;

    const m1 = modules[0] || {};
    const m2 = modules[1] || {};
    const m3 = modules[2] || {};

    const rows = [
        { label: isEn ? 'Peak Power (Pmax)' : 'Potencia Pico (Pmax)', v1: formatVal(m1.pmax ?? 210, 'Wp'), v2: formatVal(m2.pmax ?? 340, 'Wp'), v3: formatVal(m3.pmax ?? 550, 'Wp') },
        { label: isEn ? 'Cells in series' : 'Celdas en serie', v1: `${m1.cellsInSeries ?? 36}`, v2: `${m2.cellsInSeries ?? 72}`, v3: `${m3.cellsInSeries ?? 144}` },
        { label: isEn ? 'Voc (Open Circuit)' : 'Voc (Circuito Abierto)', v1: formatVal(m1.voc ?? 23.95, 'V'), v2: formatVal(m2.voc ?? 41.55, 'V'), v3: formatVal(m3.voc ?? 49.8, 'V') },
        { label: isEn ? 'Isc (Short Circuit)' : 'Isc (Cortocircuito)', v1: formatVal(m1.isc ?? 11.07, 'A'), v2: formatVal(m2.isc ?? 10.46, 'A'), v3: formatVal(m3.isc ?? 13.99, 'A') },
        { label: isEn ? 'Pmax NMOT' : 'Pmax NMOT', v1: formatVal(m1.pmaxNmot ?? 156.8, 'W'), v2: formatVal(m2.pmaxNmot ?? 257, 'W'), v3: formatVal(m3.pmaxNmot ?? 410, 'W') },
        { label: isEn ? 'Vmp (Pmax Voltage)' : 'Vmp (Voltaje Pmax)', v1: formatVal(m1.vmp ?? 20.05, 'V'), v2: formatVal(m2.vmp ?? 34.73, 'V'), v3: formatVal(m3.vmp ?? 41.6, 'V') },
        { label: isEn ? 'Imp (Pmax Current)' : 'Imp (Corriente Pmax)', v1: formatVal(m1.imp ?? 10.47, 'A'), v2: formatVal(m2.imp ?? 9.79, 'A'), v3: formatVal(m3.imp ?? 13.23, 'A') },
        { label: isEn ? 'Temp. Coef. Voc (β)' : 'Coef. Temp. Voc (β)', v1: formatSign(m1.tempCoefVoc ?? -0.32, '%/°C'), v2: formatSign(m2.tempCoefVoc ?? -0.272, '%/°C'), v3: formatSign(m3.tempCoefVoc ?? -0.28, '%/°C') },
        { label: isEn ? 'Temp. Coef. Isc (α)' : 'Coef. Temp. Isc (α)', v1: formatSign(m1.tempCoefIsc ?? 0.05, '%/°C'), v2: formatSign(m2.tempCoefIsc ?? 0.044, '%/°C'), v3: formatSign(m3.tempCoefIsc ?? 0.05, '%/°C') },
        { label: isEn ? 'Temp. Coef. Pmp (γ)' : 'Coef. Temp. Pmp (γ)', v1: formatSign(m1.tempCoefPmp ?? -0.39, '%/°C'), v2: formatSign(m2.tempCoefPmp ?? -0.35, '%/°C'), v3: formatSign(m3.tempCoefPmp ?? -0.36, '%/°C') },
        { label: isEn ? 'NOCT' : 'NOCT', v1: formatVal(m1.noct ?? 45, '°C'), v2: formatVal(m2.noct ?? 45, '°C'), v3: formatVal(m3.noct ?? 45, '°C') },
        { label: isEn ? 'Area' : 'Área', v1: formatVal(m1.area ?? 1.092, 'm²'), v2: formatVal(m2.area ?? 1.682, 'm²'), v3: formatVal(m3.area ?? 2.584, 'm²') },
        { label: isEn ? 'Efficiency' : 'Eficiencia', v1: formatVal(m1.efficiency ?? 19.23, '%'), v2: formatVal(m2.efficiency ?? 16.9, '%'), v3: formatVal(m3.efficiency ?? 21.5, '%') }
    ];

    tbody.innerHTML = rows.map(r => `
        <tr>
            <td style="font-weight: 600; text-align: left; padding: 0.52rem 1rem 0.52rem 1.25rem;">${r.label}</td>
            <td style="text-align: center; padding: 0.52rem 1rem;">${r.v1}</td>
            <td style="text-align: center; padding: 0.52rem 1rem;">${r.v2}</td>
            <td style="text-align: center; padding: 0.52rem 1rem;">${r.v3}</td>
        </tr>
    `).join('');
}

/** Select a module as preferred proposed solution */
function selectModule(id) {
    const s = APP.state.sizing;
    if (s.lockedModule || s.activeCaseId === 'caso-estandar') {
        if (typeof showToast === 'function') {
            showToast('En el Caso Estándar solo se utiliza el módulo de referencia oficial de 550 Wp.', 'warning');
        }
        return;
    }
    s.selectedModuleId = id;
    updateSizing();
    if (typeof showToast === 'function') {
        showToast(`Módulo ${id} seleccionado para el informe`, 'info');
    }
}

/** Render monthly or annual generation section */
function renderGenerationSection() {
    const s = APP.state.sizing;
    const selected = s.selectedResult;
    const container = document.getElementById('generation-display');
    const canvas = document.getElementById('generation-chart');
    if (!container) return;

    const res = s.solarResource;
    if (!res || !res.monthlyHsp || res.monthlyHsp.length !== 12 || !selected || !selected.installedPowerKwp) {
        container.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--text-muted); font-style: italic;">
            Sin datos de radiación ni dimensionamiento activo. Ingrese coordenadas y presione "Cálculo Solar" para ver la proyección mensual y balance anual.
        </div>
        `;
        if (generationChart) {
            generationChart.destroy();
            generationChart = null;
        }
        if (canvas) canvas.style.display = 'none';
        return;
    }
    if (canvas) canvas.style.display = 'block';

    const monthlyData = PV_SIZING.calcMonthlyProjections(
        selected.installedPowerKwp,
        res.monthlyHsp,
        s.pr,
        APP.state.config.daysPerMonth
    );

    // Monthly demand
    const profile = calcHourlyProfile();
    const dailyDemand = calcDailyEnergy(profile);
    const monthlyDemand = dailyDemand * APP.state.config.daysPerMonth;
    const annualDemand = calcAnnualEnergy();

    const disabled = s.disabledMonths || [];
    const opCount = 12 - disabled.length;

    // Zero out generation for non-operating months
    let annualGenTotal = 0;
    const adjustedMonthlyData = monthlyData.map((m, idx) => {
        const isDis = disabled.includes(idx);
        const dailyKwh = isDis ? 0 : m.dailyKwh;
        const monthlyKwh = isDis ? 0 : m.monthlyKwh;
        if (!isDis) annualGenTotal += monthlyKwh;
        return {
            ...m,
            isOperating: !isDis,
            dailyKwh,
            monthlyKwh
        };
    });

    const isMensual = (s.projectionView !== 'anual');

    if (isMensual) {
        container.innerHTML = `
        <div class="gen-table-wrapper">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Mes</th>
                        <th>HSP (h/día)</th>
                        <th>Gen. Diaria (kWh/d)</th>
                        <th>Gen. Mensual (kWh/mes)</th>
                        <th>Demanda (kWh/mes)</th>
                        <th>Balance (Excedente / Déficit)</th>
                    </tr>
                </thead>
                <tbody>
                    ${adjustedMonthlyData.map((m, idx) => {
                        const isDis = disabled.includes(idx);
                        const balance = isDis ? 0 : (m.monthlyKwh - monthlyDemand);
                        const balSign = balance >= 0 ? '+' : '';
                        const balClass = isDis ? 'text-muted' : (balance >= 0 ? 'text-success' : 'text-danger');
                        const isCritical = !isDis && (idx === res.criticalMonthIndex);

                        return `
                        <tr class="${isCritical ? 'highlight-row' : ''}" style="${isDis ? 'opacity: 0.55; background: rgba(148, 163, 184, 0.08);' : ''}">
                            <td><strong>${SOLAR_DB.monthNames[idx]}</strong> ${isCritical ? '⚠️ (Mes Crítico)' : ''} ${isDis ? '<span class="badge" style="background: rgba(148, 163, 184, 0.2); color: #94a3b8; font-size: 0.72rem; padding: 2px 6px;">No operativo</span>' : ''}</td>
                            <td style="text-align:center">${m.hsp.toFixed(2)}</td>
                            <td style="text-align:center">${isDis ? '-' : m.dailyKwh.toFixed(2)}</td>
                            <td style="text-align:center"><strong>${isDis ? '0.0' : m.monthlyKwh.toFixed(1)}</strong></td>
                            <td style="text-align:center">${monthlyDemand.toFixed(1)}</td>
                            <td style="text-align:center" class="${balClass}"><strong>${isDis ? 'No opera' : `${balSign}${balance.toFixed(1)} kWh`}</strong></td>
                        </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
        `;
    } else {
        const effectiveAnnualDemand = monthlyDemand * opCount;
        const annualBalance = annualGenTotal - effectiveAnnualDemand;
        const balSign = annualBalance >= 0 ? '+' : '';
        const balClass = annualBalance >= 0 ? 'text-success' : 'text-danger';
        const coveragePercent = effectiveAnnualDemand > 0 ? (annualGenTotal / effectiveAnnualDemand) * 100 : 0;

        container.innerHTML = `
        <div class="annual-summary-grid">
            <div class="annual-card">
                <span class="ann-label">Generación Estimada (${opCount} meses op.)</span>
                <span class="ann-value highlight">${annualGenTotal.toLocaleString('es-CO', { maximumFractionDigits: 1 })} kWh/año</span>
            </div>
            <div class="annual-card">
                <span class="ann-label">Demanda Proyectada (${opCount} meses op.)</span>
                <span class="ann-value">${effectiveAnnualDemand.toLocaleString('es-CO', { maximumFractionDigits: 1 })} kWh/año</span>
            </div>
            <div class="annual-card">
                <span class="ann-label">Balance Anual Neto</span>
                <span class="ann-value ${balClass}">${balSign}${annualBalance.toLocaleString('es-CO', { maximumFractionDigits: 1 })} kWh/año</span>
            </div>
            <div class="annual-card">
                <span class="ann-label">Cobertura de la Demanda</span>
                <span class="ann-value ${coveragePercent >= 100 ? 'text-success' : 'text-danger'}">${coveragePercent.toFixed(1)}%</span>
            </div>
        </div>
        `;
    }

    renderGenerationChart(adjustedMonthlyData, monthlyDemand);
}

/** Render generation Chart.js chart */
function renderGenerationChart(monthlyData, monthlyDemand) {
    const canvas = document.getElementById('generation-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const labels = SOLAR_DB.monthNames;
    const genData = monthlyData.map(m => m.monthlyKwh);
    const demandData = monthlyData.map(m => m.isOperating === false ? 0 : Math.round(monthlyDemand * 10) / 10);

    const bgColors = monthlyData.map(m => m.isOperating === false ? 'rgba(148, 163, 184, 0.35)' : 'rgba(245, 158, 11, 0.75)');
    const borderColors = monthlyData.map(m => m.isOperating === false ? '#94a3b8' : '#f59e0b');

    if (generationChart) {
        generationChart.destroy();
    }

    generationChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                {
                    label: 'Generación Estimada (kWh)',
                    data: genData,
                    backgroundColor: bgColors,
                    borderColor: borderColors,
                    borderWidth: 1.5,
                    borderRadius: 4
                },
                {
                    type: 'line',
                    label: 'Demanda Mensual (kWh)',
                    data: demandData,
                    borderColor: '#38bdf8',
                    borderWidth: 2.5,
                    borderDash: [5, 5],
                    pointRadius: 3,
                    pointBackgroundColor: '#38bdf8',
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: { color: getComputedStyle(document.body).getPropertyValue('--text-primary') || '#fff' }
                },
                tooltip: {
                    callbacks: {
                        label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString('es-CO')} kWh`
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255,255,255,0.06)' },
                    ticks: { color: getComputedStyle(document.body).getPropertyValue('--text-secondary') || '#94a3b8' }
                },
                y: {
                    grid: { color: 'rgba(255,255,255,0.06)' },
                    ticks: { color: getComputedStyle(document.body).getPropertyValue('--text-secondary') || '#94a3b8' }
                }
            }
        }
    });
}

/** Restore Sizing UI from state (called when loading a project JSON) */
function restoreSizingUI() {
    const s = APP.state.sizing;
    if (!s) return;

    const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el && val !== undefined) el.value = val;
    };

    setVal('sizing-area', s.availableArea);
    setVal('pvwatts-lat', s.lat);
    setVal('pvwatts-lon', s.lon);
    setVal('pvwatts-tilt', s.tilt);
    setVal('pvwatts-azimuth', s.azimuth);
    setVal('pvwatts-losses', s.losses);
    setVal('pvwatts-array-type', s.arrayType);
    setVal('sizing-pr', s.pr);
    setVal('sizing-tmin', s.tmin);
    setVal('sizing-tamb-op', s.tambOp);
    setVal('sizing-vmax', s.vmaxSystem);

    const btnCritAnual = document.getElementById('btn-crit-anual');
    const btnCritCritico = document.getElementById('btn-crit-critico');
    if (btnCritAnual && btnCritCritico) {
        if (s.criterion === 'critico') {
            btnCritCritico.classList.add('active');
            btnCritAnual.classList.remove('active');
        } else {
            btnCritAnual.classList.add('active');
            btnCritCritico.classList.remove('active');
        }
    }

    const btnViewMensual = document.getElementById('btn-view-mensual');
    const btnViewAnual = document.getElementById('btn-view-anual');
    if (btnViewMensual && btnViewAnual) {
        if (s.projectionView === 'anual') {
            btnViewAnual.classList.add('active');
            btnViewMensual.classList.remove('active');
        } else {
            btnViewMensual.classList.add('active');
            btnViewAnual.classList.remove('active');
        }
    }

    updateSizing();
}

// ───── TABLA Y GRÁFICA DE IRRADIANCIA MENSUAL (HSP) ─────
let solarMonthlyChart = null;

function updateSolarMonthlyDisplay(res, disabledMonths = []) {
    const row = document.getElementById('solar-monthly-values-row');
    const emptyMsg = document.getElementById('solar-chart-empty-msg');
    const canvas = document.getElementById('solar-monthly-chart');

    if (!res || !res.monthlyHsp || res.monthlyHsp.length !== 12) {
        if (row) {
            row.innerHTML = `<td colspan="15" style="text-align: center; color: var(--text-muted); padding: 1.2rem; font-style: italic;">
                Sin datos de radiación. Ingrese coordenadas (Latitud y Longitud) y presione "Cálculo Solar" para consultar el recurso.
            </td>`;
        }
        if (solarMonthlyChart) {
            solarMonthlyChart.destroy();
            solarMonthlyChart = null;
        }
        if (canvas) canvas.style.display = 'none';
        if (emptyMsg) emptyMsg.style.display = 'flex';
        return;
    }

    if (canvas) canvas.style.display = 'block';
    if (emptyMsg) emptyMsg.style.display = 'none';

    const monthlyHsp = res.monthlyHsp;
    const annualHsp = res.annualHsp !== undefined ? res.annualHsp : 0;
    const critHsp = res.criticalMonthHsp !== undefined ? res.criticalMonthHsp : 0;
    const critIdx = res.criticalMonthIndex !== undefined ? res.criticalMonthIndex : 0;
    const maxHsp = res.maxMonthHsp !== undefined ? res.maxMonthHsp : Math.max(...monthlyHsp);
    const maxIdx = res.maxMonthIndex !== undefined ? res.maxMonthIndex : monthlyHsp.indexOf(maxHsp);

    // 1. Update table headers with clickable toggle support
    const theadTr = document.querySelector('#solar-monthly-table thead tr');
    const monthShort = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    if (theadTr) {
        let thHtml = '';
        monthShort.forEach((m, idx) => {
            const isDis = disabledMonths.includes(idx);
            thHtml += `<th class="th-clickable ${isDis ? 'th-disabled' : ''}" data-month-idx="${idx}" title="${isDis ? 'Mes suspendido (Clic para reactivar ' + m + ')' : 'Clic para suspender ' + m}">${m}</th>`;
        });
        thHtml += `<th class="th-special">ANUAL</th><th class="th-special">MÍN.</th><th class="th-special">MÁX.</th>`;
        theadTr.innerHTML = thHtml;

        theadTr.querySelectorAll('.th-clickable').forEach(th => {
            th.onclick = (e) => {
                e.preventDefault();
                const idx = parseInt(th.dataset.monthIdx);
                if (!isNaN(idx)) toggleOperatingMonth(idx);
            };
        });
    }

    // 2. Update table values row
    if (row) {
        let html = '';
        monthlyHsp.forEach((val, idx) => {
            const isDis = disabledMonths.includes(idx);
            let cls = 'td-clickable';
            if (isDis) cls += ' td-disabled';
            else if (idx === critIdx) cls += ' td-critical';
            else if (idx === maxIdx) cls += ' td-max';
            html += `<td class="${cls}" data-month-idx="${idx}" title="${isDis ? 'Mes no operativo (Clic para reactivar)' : 'Clic para suspender este mes'}">${val.toFixed(2)}</td>`;
        });
        html += `<td class="td-bold" title="Promedio de los meses operativos">${annualHsp.toFixed(2)}</td>`;
        html += `<td class="td-critical" title="Mes crítico entre los meses operativos">${critHsp.toFixed(2)}</td>`;
        html += `<td class="td-max" title="Mes máximo entre los meses operativos">${maxHsp.toFixed(2)}</td>`;
        row.innerHTML = html;

        row.querySelectorAll('.td-clickable').forEach(td => {
            td.onclick = (e) => {
                e.preventDefault();
                const idx = parseInt(td.dataset.monthIdx);
                if (!isNaN(idx)) toggleOperatingMonth(idx);
            };
        });
    }

    // 3. Update chart
    renderSolarMonthlyChart(monthlyHsp, critIdx, maxIdx, disabledMonths);
}

function renderSolarMonthlyChart(monthlyHsp, critIdx, maxIdx, disabledMonths = []) {
    const canvas = document.getElementById('solar-monthly-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';

    const labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    // In friend's app: light sky-blue bars for active months, critical month in soft orange (#f59e0b)
    // Non-operating / cancelled months appear grey (#94a3b8 / #64748b)
    const bgColors = monthlyHsp.map((_, idx) => {
        if (disabledMonths.includes(idx)) {
            return isLight ? 'rgba(148, 163, 184, 0.45)' : 'rgba(100, 116, 139, 0.4)';
        }
        if (idx === critIdx) {
            return 'rgba(245, 158, 11, 0.9)'; // Orange for critical month
        }
        return 'rgba(125, 211, 252, 0.85)'; // Light sky blue
    });

    const borderColors = monthlyHsp.map((_, idx) => {
        if (disabledMonths.includes(idx)) {
            return isLight ? '#94a3b8' : '#64748b';
        }
        if (idx === critIdx) return '#d97706';
        return '#38bdf8';
    });

    const textColor = isLight ? '#334155' : '#cbd5e1';
    const gridColor = isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.08)';

    const tickColorFn = (c) => {
        const idx = c.index;
        const s = (window.APP && window.APP.state && window.APP.state.sizing) || {};
        const dis = s.disabledMonths || disabledMonths;
        if (dis.includes(idx)) return isLight ? '#94a3b8' : '#64748b';
        if (idx === critIdx) return '#d97706';
        return textColor;
    };

    if (solarMonthlyChart) {
        solarMonthlyChart.data.datasets[0].data = monthlyHsp;
        solarMonthlyChart.data.datasets[0].backgroundColor = bgColors;
        solarMonthlyChart.data.datasets[0].borderColor = borderColors;
        solarMonthlyChart.options.scales.x.ticks.color = tickColorFn;
        solarMonthlyChart.options.scales.y.ticks.color = textColor;
        solarMonthlyChart.options.scales.y.grid.color = gridColor;
        solarMonthlyChart.options.scales.y.title.color = textColor;
        if (solarMonthlyChart.options.plugins && solarMonthlyChart.options.plugins.legend) {
            solarMonthlyChart.options.plugins.legend.labels.color = textColor;
        }
        solarMonthlyChart.update();
        return;
    }

    solarMonthlyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'HSP mensual [kWh/m²-día]',
                data: monthlyHsp,
                backgroundColor: bgColors,
                borderColor: borderColors,
                borderWidth: 1.5,
                borderRadius: 4,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 300 },
            onClick: (evt, elements, chart) => {
                let monthIdx = -1;
                if (elements && elements.length > 0) {
                    monthIdx = elements[0].index;
                } else if (chart.scales && chart.scales.x) {
                    const x = evt.x !== undefined ? evt.x : (evt.native ? evt.native.offsetX : undefined);
                    if (x !== undefined) {
                        const val = chart.scales.x.getValueForPixel(x);
                        if (typeof val === 'number' && val >= 0 && val < 12) {
                            monthIdx = Math.round(val);
                        }
                    }
                }
                if (monthIdx >= 0 && monthIdx < 12) {
                    toggleOperatingMonth(monthIdx);
                }
            },
            onHover: (evt, elements, chart) => {
                const canvas = chart.canvas;
                const x = evt.x !== undefined ? evt.x : (evt.native ? evt.native.offsetX : undefined);
                let isTarget = (elements && elements.length > 0);
                if (!isTarget && x !== undefined && chart.scales.x) {
                    const val = chart.scales.x.getValueForPixel(x);
                    if (typeof val === 'number' && val >= 0 && val < 12) {
                        isTarget = true;
                    }
                }
                canvas.style.cursor = isTarget ? 'pointer' : 'default';
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: textColor,
                        boxWidth: 14,
                        font: { size: 12, weight: 600 }
                    }
                },
                tooltip: {
                    callbacks: {
                        title: function(items) {
                            if (!items || !items.length) return '';
                            const idx = items[0].dataIndex;
                            const fullNames = (typeof SOLAR_DB !== 'undefined' && SOLAR_DB.monthNames)
                                ? SOLAR_DB.monthNames
                                : ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                            return fullNames[idx] || labels[idx];
                        },
                        label: function(context) {
                            const idx = context.dataIndex;
                            const s = (window.APP && window.APP.state && window.APP.state.sizing) || {};
                            const dis = s.disabledMonths || [];
                            if (dis.includes(idx)) {
                                return ` ✕ Cancelado (No operativo) · HSP: ${context.parsed.y.toFixed(2)} kWh/m²-día`;
                            }
                            let extra = '';
                            if (idx === critIdx) extra = ' ⚠️ (Mes Crítico de Diseño)';
                            else if (idx === maxIdx) extra = ' ☀️ (Mes Máximo)';
                            return ` HSP: ${context.parsed.y.toFixed(2)} kWh/m²-día${extra}`;
                        },
                        afterLabel: function(context) {
                            const idx = context.dataIndex;
                            const s = (window.APP && window.APP.state && window.APP.state.sizing) || {};
                            const dis = s.disabledMonths || [];
                            return dis.includes(idx) ? ' ▶ Clic en el nombre o barra para reactivar' : ' ▶ Clic en el nombre o barra para suspender';
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: tickColorFn,
                        font: { size: 11, weight: 600 }
                    },
                    grid: { display: false }
                },
                y: {
                    beginAtZero: true,
                    suggestedMax: 7.5,
                    ticks: {
                        stepSize: 1,
                        color: textColor,
                        font: { size: 11 }
                    },
                    grid: {
                        color: gridColor
                    },
                    title: {
                        display: true,
                        text: 'kWh/m²-día',
                        color: textColor,
                        font: { size: 11, weight: 600 }
                    }
                }
            }
        }
    });

    if (window.APP) {
        window.APP.solarMonthlyChart = solarMonthlyChart;
    }
}

function updateSolarMonthlyChartColors() {
    if (!solarMonthlyChart) return;
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const textColor = isLight ? '#334155' : '#cbd5e1';
    const gridColor = isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.08)';

    const s = (window.APP && window.APP.state && window.APP.state.sizing) || {};
    const dis = s.disabledMonths || [];
    const critIdx = (s.solarResource && s.solarResource.criticalMonthIndex !== undefined) ? s.solarResource.criticalMonthIndex : 9;

    solarMonthlyChart.options.scales.x.ticks.color = (c) => {
        const idx = c.index;
        if (dis.includes(idx)) return isLight ? '#94a3b8' : '#64748b';
        if (idx === critIdx) return '#d97706';
        return textColor;
    };
    solarMonthlyChart.options.scales.y.ticks.color = textColor;
    solarMonthlyChart.options.scales.y.grid.color = gridColor;
    solarMonthlyChart.options.scales.y.title.color = textColor;
    if (solarMonthlyChart.options.plugins && solarMonthlyChart.options.plugins.legend) {
        solarMonthlyChart.options.plugins.legend.labels.color = textColor;
    }
    solarMonthlyChart.update();
}

window.initSizingUI = initSizingUI;
window.updateSizing = updateSizing;
window.selectModule = selectModule;
window.restoreSizingUI = restoreSizingUI;
window.updateSolarMonthlyDisplay = updateSolarMonthlyDisplay;
window.updateSolarMonthlyChartColors = updateSolarMonthlyChartColors;
window.setSolarProvider = setSolarProvider;
window.toggleOperatingMonth = toggleOperatingMonth;
window.recomputeHspMetrics = recomputeHspMetrics;

