/* ═══════════════════════════════════════════════
   cases_db.js — Example Cases Database & Manager (Reto 01 & Reto 02)
   Provides curated test cases with verified demand profiles and certified fixed solar resources.
   ═══════════════════════════════════════════════ */

const CASES_DB = {
    cases: {
        'caso-1': {
            id: 'caso-1',
            name: 'Caso 1: Laboratorio de Electrónica Analoga y Digital-Hangar A',
            shortName: 'Caso 1',
            description: 'Laboratorio de Electrónica - Santa Marta (11.225°, -74.185°)',
            isPreset: true,
            isPlaceholder: false,

            // Reto 01: Información del Proyecto
            project: {
                name: 'Laboratorio de Electrónica Analoga y Digital-Hangar A',
                id: 'C-1',
                members: 'Carlos Forero, Sebastián Martínez, Esteban Romero, Mario Celedón',
                date: '2026-08-27',
                installationType: 'industrial',
                systemType: 'off-grid'
            },

            // Reto 01: Configuración Día / Noche y Tarifaria
            config: {
                dayStart: 6,
                dayEnd: 16, // Inicio de la noche: 16:00
                daysPerMonth: 28,
                monthsPerYear: 5,
                unitCost: 890
            },

            // Reto 01: 15 Cargas del Caso 1
            loads: [
                {
                    id: 'c-1',
                    description: 'Aire acondicionado',
                    quantity: 1,
                    power: 6000,
                    timeSlots: [{ start: 6, end: 22 }],
                    hours: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
                    daysPerMonth: 28,
                    monthsPerYear: 5
                },
                {
                    id: 'c-2',
                    description: 'Cautin',
                    quantity: 10,
                    power: 60,
                    timeSlots: [{ start: 6, end: 7 }, { start: 16, end: 17 }],
                    hours: [6, 16],
                    daysPerMonth: 28,
                    monthsPerYear: 5
                },
                {
                    id: 'c-3',
                    description: 'Multimetro Owon',
                    quantity: 12,
                    power: 15,
                    timeSlots: [{ start: 10, end: 18 }],
                    hours: [10, 11, 12, 13, 14, 15, 16, 17],
                    daysPerMonth: 28,
                    monthsPerYear: 5
                },
                {
                    id: 'c-4',
                    description: 'Computadoras',
                    quantity: 32,
                    power: 400,
                    timeSlots: [{ start: 10, end: 18 }],
                    hours: [10, 11, 12, 13, 14, 15, 16, 17],
                    daysPerMonth: 28,
                    monthsPerYear: 5
                },
                {
                    id: 'c-5',
                    description: 'Cámaras Topo',
                    quantity: 2,
                    power: 5,
                    timeSlots: [{ start: 6, end: 22 }],
                    hours: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
                    daysPerMonth: 28,
                    monthsPerYear: 5
                },
                {
                    id: 'c-6',
                    description: 'Osciloscopio Uni-T',
                    quantity: 14,
                    power: 45,
                    timeSlots: [{ start: 12, end: 18 }],
                    hours: [12, 13, 14, 15, 16, 17],
                    daysPerMonth: 28,
                    monthsPerYear: 5
                },
                {
                    id: 'c-7',
                    description: 'Luces LED',
                    quantity: 4,
                    power: 40,
                    timeSlots: [{ start: 12, end: 22 }],
                    hours: [12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
                    daysPerMonth: 28,
                    monthsPerYear: 5
                },
                {
                    id: 'c-8',
                    description: 'Fuente GWinstek',
                    quantity: 8,
                    power: 180,
                    timeSlots: [{ start: 10, end: 22 }],
                    hours: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
                    daysPerMonth: 28,
                    monthsPerYear: 5
                },
                {
                    id: 'c-9',
                    description: 'Generador de señales Owon',
                    quantity: 8,
                    power: 15,
                    timeSlots: [{ start: 12, end: 16 }],
                    hours: [12, 13, 14, 15],
                    daysPerMonth: 28,
                    monthsPerYear: 5
                },
                {
                    id: 'c-10',
                    description: 'Fuentes antiguas',
                    quantity: 4,
                    power: 100,
                    timeSlots: [{ start: 10, end: 18 }],
                    hours: [10, 11, 12, 13, 14, 15, 16, 17],
                    daysPerMonth: 28,
                    monthsPerYear: 5
                },
                {
                    id: 'c-11',
                    description: 'Consumo general de circuitos',
                    quantity: 1,
                    power: 120,
                    timeSlots: [{ start: 6, end: 22 }],
                    hours: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
                    daysPerMonth: 28,
                    monthsPerYear: 5
                },
                {
                    id: 'c-12',
                    description: 'Computadoras de estudiantes',
                    quantity: 1,
                    power: 300,
                    timeSlots: [{ start: 6, end: 22 }],
                    hours: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
                    daysPerMonth: 28,
                    monthsPerYear: 5
                },
                {
                    id: 'c-13',
                    description: 'Celulares de estudiantes',
                    quantity: 10,
                    power: 40,
                    timeSlots: [{ start: 6, end: 22 }],
                    hours: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
                    daysPerMonth: 28,
                    monthsPerYear: 5
                },
                {
                    id: 'c-14',
                    description: 'Impresora 3D',
                    quantity: 1,
                    power: 120,
                    timeSlots: [{ start: 10, end: 14 }, { start: 16, end: 20 }],
                    hours: [10, 11, 12, 13, 16, 17, 18, 19],
                    daysPerMonth: 28,
                    monthsPerYear: 5
                },
                {
                    id: 'c-15',
                    description: 'Video Beam',
                    quantity: 1,
                    power: 280,
                    timeSlots: [{ start: 6, end: 16 }],
                    hours: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
                    daysPerMonth: 28,
                    monthsPerYear: 5
                }
            ],

            // Reto 02: Dimensionamiento con Parámetros Fijos Certificados (PVGIS Santa Marta)
            sizing: {
                lat: 11.225,
                lon: -74.185,
                tilt: 11,
                azimuth: 180,
                arrayType: 0,
                losses: 0,
                tmin: 21.3,
                tambOp: 27.3,
                vmaxSystem: 1000,
                solarProvider: 'pvgis',
                availableArea: 300,
                pr: 0.80,
                solarResource: {
                    source: 'PVGIS (Santa Marta - Certificado Fijo)',
                    isFixedCase: true,
                    isFallback: false,
                    isCached: true,
                    lat: 11.225,
                    lon: -74.185,
                    tilt: 11,
                    azimuth: 180,
                    annualHsp: 5.71,
                    criticalMonthHsp: 4.92,
                    criticalMonthIndex: 10, // Noviembre
                    criticalMonthName: 'Noviembre',
                    maxMonthHsp: 6.34,
                    maxMonthIndex: 2, // Marzo
                    maxMonthName: 'Marzo',
                    monthlyHsp: [5.66, 6.15, 6.34, 6.15, 5.63, 5.76, 5.97, 5.95, 5.70, 5.17, 4.92, 5.20],
                    notes: 'Recurso solar promedio PVGIS para Santa Marta (11.225°, -74.185°). Datos fijos de caso de estudio.'
                }
            }
        },

        'caso-2': {
            id: 'caso-2',
            name: 'Caso 2',
            shortName: 'Caso 2',
            isPreset: true,
            isPlaceholder: true,
            notes: 'Pendiente por definir'
        },

        'caso-3': {
            id: 'caso-3',
            name: 'Caso 3',
            shortName: 'Caso 3',
            isPreset: true,
            isPlaceholder: true,
            notes: 'Pendiente por definir'
        },

        'custom': {
            id: 'custom',
            name: 'Coordenadas Libres',
            shortName: 'Coordenadas Libres',
            isPreset: false,
            isPlaceholder: false
        }
    },

    getById(id) {
        if (!id) return this.cases['custom'];
        if (id === 'santa-marta') id = 'caso-1';
        if (id === 'barranquilla') id = 'caso-2';
        if (id === 'medellin') id = 'caso-3';
        return this.cases[id] || null;
    }
};

/**
 * Carga completa de un caso de estudio en el estado global y actualiza la interfaz
 * @param {string} rawCaseId - Identificador del caso ('caso-1', 'caso-2', 'custom', etc.)
 * @param {Object} options - { silent: boolean }
 */
function loadCase(rawCaseId, options = {}) {
    let caseId = rawCaseId;
    if (caseId === 'santa-marta') caseId = 'caso-1';
    if (caseId === 'barranquilla') caseId = 'caso-2';
    if (caseId === 'medellin') caseId = 'caso-3';

    const caseData = CASES_DB.getById(caseId);
    if (!caseData) return;

    if (caseData.isPlaceholder) {
        if (!options.silent && typeof showToast === 'function') {
            showToast(`${caseData.name}: Los datos para este caso se agregarán próximamente.`, 'info');
        }
        return;
    }

    // 1. Sincronizar botones activos en toda la aplicación
    document.querySelectorAll('.dim-case-btn').forEach(btn => {
        const c = btn.dataset.case;
        const isActive = (c === caseId) || (caseId === 'caso-1' && c === 'santa-marta');
        btn.classList.toggle('active', isActive);
    });

    const s = APP.state.sizing;

    // 2. Manejo de Modo Coordenadas Libres
    if (caseId === 'custom') {
        s.isFixedCase = false;
        s.activeCaseId = 'custom';

        // Desbloquear campos para edición libre
        setFieldsLockState(false);

        // Actualizar badge de estado
        const badge = document.getElementById('pvwatts-status-badge');
        if (badge) {
            badge.className = 'status-badge info';
            badge.textContent = 'Coordenadas Libres';
        }

        // Ocultar banner de caso fijo
        updateCaseBanner(null);

        if (!options.silent && typeof showToast === 'function') {
            showToast('Modo de Coordenadas Libres activado. Ingrese coordenadas y ejecute el cálculo.', 'info');
        }

        if (typeof updateSizing === 'function') {
            updateSizing();
        }
        return;
    }

    // 3. Caso Predeterminado (Caso 1)
    s.isFixedCase = true;
    s.activeCaseId = caseId;

    // A. Cargar Datos del Reto 01: Proyecto
    if (caseData.project) {
        APP.state.project = JSON.parse(JSON.stringify(caseData.project));
        if (typeof restoreProjectUI === 'function') {
            restoreProjectUI();
        }
    }

    // B. Cargar Datos del Reto 01: Configuración
    if (caseData.config) {
        APP.state.config = JSON.parse(JSON.stringify(caseData.config));
        if (typeof restoreConfigUI === 'function') {
            restoreConfigUI();
        }
    }

    // C. Cargar Datos del Reto 01: Cuadro de Cargas
    if (caseData.loads) {
        APP.state.loads = JSON.parse(JSON.stringify(caseData.loads));
        if (typeof renderLoads === 'function') {
            renderLoads();
        }
        if (typeof recalculateAll === 'function') {
            recalculateAll();
        }
    }

    // D. Cargar Datos del Reto 02: Dimensionamiento y Recurso Solar Fijo
    if (caseData.sizing) {
        s.lat = caseData.sizing.lat;
        s.lon = caseData.sizing.lon;
        s.tilt = caseData.sizing.tilt;
        s.azimuth = caseData.sizing.azimuth;
        s.arrayType = caseData.sizing.arrayType || 0;
        s.losses = caseData.sizing.losses || 0;
        s.tmin = caseData.sizing.tmin;
        s.tambOp = caseData.sizing.tambOp;
        s.vmaxSystem = caseData.sizing.vmaxSystem || 1000;

        if (caseData.sizing.availableArea && (!s.availableArea || s.availableArea === 20)) {
            s.availableArea = caseData.sizing.availableArea;
        }
        if (caseData.sizing.pr) {
            s.pr = caseData.sizing.pr;
        }

        // Asignar recurso solar certificado directamente (evita dependencias de red o fallas externas)
        s.solarResource = JSON.parse(JSON.stringify(caseData.sizing.solarResource));

        // Sincronizar inputs en la interfaz
        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el && val !== undefined) el.value = val;
        };

        setVal('pvwatts-lat', s.lat);
        setVal('pvwatts-lon', s.lon);
        setVal('pvwatts-tilt', s.tilt);
        setVal('pvwatts-azimuth', s.azimuth);
        setVal('sizing-tmin', s.tmin);
        setVal('sizing-tamb-op', s.tambOp);
        setVal('sizing-area', s.availableArea);
        setVal('sizing-pr', s.pr);

        const bTilt = document.getElementById('badge-pvgis-tilt');
        const bAz = document.getElementById('badge-pvgis-azimuth');
        if (bTilt) bTilt.textContent = `Inclinación: ${s.tilt}°`;
        if (bAz) bAz.textContent = `Azimut: ${s.azimuth}°`;

        // Bloquear coordenadas, tilt y temperaturas (fijos para el caso)
        setFieldsLockState(true, caseData.shortName);

        // Actualizar status badge
        const badge = document.getElementById('pvwatts-status-badge');
        if (badge) {
            badge.className = 'status-badge success';
            badge.textContent = `🔒 ${caseData.shortName} · PVGIS Fijo`;
        }

        // Mostrar banner explicativo
        updateCaseBanner(caseData);

        // Ejecutar dimensionamiento de inmediato con datos certificados
        if (typeof updateSizing === 'function') {
            updateSizing();
        }

        if (!options.silent && typeof showToast === 'function') {
            showToast(`${caseData.shortName} cargado: Demanda (Reto 01) y Recurso Solar Fijo (Reto 02).`, 'success');
        }
    }
}

/**
 * Controla el estado bloqueado/desbloqueado de los campos fijos de coordenadas y temperatura
 */
function setFieldsLockState(isLocked, caseName = 'Caso') {
    const lockedInputIds = [
        'pvwatts-lat',
        'pvwatts-lon',
        'pvwatts-tilt',
        'pvwatts-azimuth',
        'sizing-tmin',
        'sizing-tamb-op'
    ];

    lockedInputIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.readOnly = isLocked;
            if (isLocked) {
                el.style.backgroundColor = 'rgba(148, 163, 184, 0.12)';
                el.style.cursor = 'not-allowed';
                el.title = `Valor fijo predeterminado para ${caseName}. Para ingresar valores libres, seleccione 'Coordenadas Libres'.`;
            } else {
                el.style.backgroundColor = '';
                el.style.cursor = '';
                el.title = '';
            }
        }
    });

    const btnUseProj = document.getElementById('btn-use-project-coords');
    if (btnUseProj) {
        btnUseProj.disabled = isLocked;
        btnUseProj.style.opacity = isLocked ? '0.45' : '1';
        btnUseProj.style.cursor = isLocked ? 'not-allowed' : 'pointer';
    }
}

/**
 * Muestra u oculta el banner informativo del caso fijo en la sección de Dimensionamiento
 */
function updateCaseBanner(caseData) {
    const banner = document.getElementById('case-lock-banner');
    if (!banner) return;

    if (!caseData || !caseData.isPreset) {
        banner.style.display = 'none';
        return;
    }

    const titleEl = document.getElementById('case-lock-title');
    const descEl = document.getElementById('case-lock-desc');

    if (titleEl) {
        titleEl.textContent = `🔒 ${caseData.name}`;
    }
    if (descEl) {
        descEl.innerHTML = `Coordenadas (<strong>${caseData.sizing.lat}°, ${caseData.sizing.lon}°</strong>), Inclinación (<strong>${caseData.sizing.tilt}°</strong>), Temperaturas (Tmin: <strong>${caseData.sizing.tmin}°C</strong>, Tamb: <strong>${caseData.sizing.tambOp}°C</strong>) e Irradiancia fija de PVGIS. <strong>Área Disponible y PR son variables para dimensionamiento.</strong>`;
    }

    banner.style.display = 'flex';
}

window.CASES_DB = CASES_DB;
window.loadCase = loadCase;
window.setFieldsLockState = setFieldsLockState;
window.updateCaseBanner = updateCaseBanner;
