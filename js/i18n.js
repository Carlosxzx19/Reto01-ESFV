/* ═══════════════════════════════════════════════
   i18n.js — Language Localization (ES / EN)
   Solar PV Technical Localization System
   ═══════════════════════════════════════════════ */

const translations = {
    'es': {},
    'en': {
        // App Header & Branding
        'Planeación Solar Práctica': 'Practical Solar Planning',
        'Planeación Solar Práctica — Caracterización de Demanda Energética': 'Practical Solar Planning — Energy Demand Characterization',
        'Caracterización de Demanda Energética Fotovoltaica': 'Photovoltaic Energy Demand Characterization',
        'Modo Claro': 'Light Mode',
        'Modo Oscuro': 'Dark Mode',
        'Configuración de APIs': 'API Configuration',
        'Configuración': 'Settings',
        'Cambiar idioma': 'Switch Language (ES / EN)',
        'Cambiar tema': 'Toggle Theme',

        // Macro-Stage Navigation
        'Etapas del Proyecto': 'Project Stages',
        'Etapa 1': 'Stage 1',
        'Requerimiento': 'Requirements',
        'Caracterización de Demanda (Reto 01)': 'Demand Characterization (Challenge 01)',
        'Etapa 2': 'Stage 2',
        'Dimensionamiento': 'PV Sizing',
        'Generador Fotovoltaico (Reto 02)': 'Photovoltaic Generator (Challenge 02)',

        // Tabs (Stage 1)
        'Proyecto': 'Project',
        'Cuadro de Cargas': 'Load Table',
        'Resultados': 'Results',
        'Informe': 'Report',

        // Example Cases Bar
        'Casos de Ejemplo:': 'Example Cases:',
        'Caso Estándar': 'Standard Case',
        'Caso Estándar (Nazareth)': 'Standard Case (Nazareth)',
        'Caso 1 (Santa Marta)': 'Case 1 (Santa Marta)',
        'Caso 2 (Villavicencio)': 'Case 2 (Villavicencio)',
        'Caso 3 (Bogotá)': 'Case 3 (Bogota)',
        'Caso 4 (Barranquilla)': 'Case 4 (Barranquilla)',
        'Caso 5 (Pasto)': 'Case 5 (Pasto)',
        'Coordenadas Libres': 'Custom Coordinates',
        'Caso 1': 'Case 1',
        'Caso 2': 'Case 2',
        'Caso 3': 'Case 3',
        'Caso 4': 'Case 4',
        'Caso 5': 'Case 5',

        // Tab 1: Project Information
        'Información del Proyecto': 'Project Information',
        'Nombre del Proyecto': 'Project Name',
        'ID del Proyecto': 'Project ID',
        'Integrantes': 'Team Members',
        'Fecha': 'Date',
        'Tipo de Instalación': 'Installation Type',
        'Residencial (Máx. 600 V)': 'Residential (Max. 600 V)',
        'Industrial (Máx. 1000 V)': 'Industrial (Max. 1000 V)',
        'Tipo de Aplicación': 'System Type',
        'Off-Grid (Aislado)': 'Off-Grid (Stand-Alone)',
        'On-Grid (Conectado a Red)': 'On-Grid (Grid-Tied)',
        'Híbrido Off-Grid': 'Hybrid Off-Grid',
        'Híbrido On-Grid': 'Hybrid On-Grid',
        'Configuración Día / Noche': 'Day / Night Configuration',
        'Define el criterio horario para clasificar las cargas como diurnas, nocturnas o mixtas.': 'Define time criteria to classify loads as diurnal, nocturnal, or mixed.',
        'Inicio del Día': 'Day Start',
        'Inicio de la Noche': 'Night Start',
        'Vista previa 24 h': '24h Preview',
        'Día': 'Day',
        'Noche': 'Night',

        // Tab 2: Load Table
        'Frecuencia de Operación por Defecto': 'Default Operating Frequency',
        'Establece los días y meses de operación estándar para todas las cargas (puedes personalizar cargas individuales en el formulario).': 'Sets standard operating days and months for all loads (you can customize individual loads in the form).',
        'Días de operación / mes (por defecto)': 'Operating days / month (default)',
        'Meses de operación / año (por defecto)': 'Operating months / year (default)',
        'Agregar Carga': 'Add Load',
        'Editar Carga': 'Edit Load',
        'Descripción': 'Description',
        'Cantidad': 'Quantity',
        'Potencia Unitaria (W)': 'Unit Power (W)',
        'Horario de Uso': 'Schedule of Use',
        'Agregue una o más franjas horarias. Admite cruces de medianoche (ej: 22:00 – 06:00).': 'Add one or more time slots. Supports midnight crossing (e.g. 22:00 – 06:00).',
        'Días / Mes (Específico)': 'Days / Month (Specific)',
        'Meses / Año (Específico)': 'Months / Year (Specific)',
        'Días / Mes (Opcional)': 'Days / Month (Optional)',
        'Meses / Año (Opcional)': 'Months / Year (Optional)',
        'En blanco usa global': 'Leave blank for global',
        'Agregar': 'Add',
        'Actualizar': 'Update',
        'Cancelar': 'Cancel',
        'Cargas Registradas': 'Registered Loads',
        'No hay cargas registradas.': 'No registered loads.',
        'Agregue una carga eléctrica para comenzar el análisis.': 'Add an electrical load to start the analysis.',
        'Cant.': 'Qty.',
        'P. Unit. (W)': 'Unit P. (W)',
        'P. Total (W)': 'Total P. (W)',
        'Horario': 'Schedule',
        'h/día': 'h/day',
        'Frecuencia': 'Frequency',
        'Clasif.': 'Classif.',
        'Acciones': 'Actions',
        'Diurna': 'Diurnal',
        'Nocturna': 'Nocturnal',
        'Mixta': 'Mixed',
        'carga': 'load',
        'cargas': 'loads',
        'Editar': 'Edit',
        'Eliminar': 'Delete',

        // Tab 3: Results
        'Potencia Instalada': 'Installed Power',
        'Demanda Máxima Simultánea': 'Max Simultaneous Demand',
        'Energía Diaria': 'Daily Energy',
        'Energía Mensual': 'Monthly Energy',
        'Energía Anual': 'Annual Energy',
        'Parámetros de Proyección': 'Projection Parameters',
        'Días de operación / mes': 'Operating days / month',
        'Meses de operación / año': 'Operating months / year',
        'Costo Unitario CU (COP/kWh)': 'Unit Cost CU (COP/kWh)',
        'Costo Unitario CU (COP/kWh):': 'Unit Cost CU (COP/kWh):',
        'Perfil de Demanda — 24 Horas': 'Demand Profile — 24 Hours',
        'Área': 'Area',
        'Barras': 'Bars',
        'Estimación de Costos': 'Cost Estimation',
        'Costo Diario': 'Daily Cost',
        'Costo Mensual': 'Monthly Cost',
        'Costo Anual': 'Annual Cost',

        // Tab 4: Report & Persistence
        'Persistencia del Proyecto': 'Project Persistence',
        'Guarde o cargue el estado completo del proyecto como archivo JSON.': 'Save or load the complete project state as a JSON file.',
        'Guardar Proyecto (.json)': 'Save Project (.json)',
        'Cargar Proyecto': 'Load Project',
        'El archivo guarda toda la información: proyecto, configuración, cargas y parámetros.': 'The file saves all project information: settings, loads, and sizing parameters.',
        'Informe Ejecutivo': 'Executive Report',
        'Genere un informe de una página con todos los datos, indicadores, perfil 24 h y costos.': 'Generate a full executive report with all project metrics, 24h profile, and sizing data.',
        'Generar Informe PDF': 'Generate PDF Report',
        'Cuadro de Cargas — Excel': 'Load Table — Excel',
        'Exporte el cuadro de cargas como archivo Excel (.xlsx) o importe uno con el mismo formato.': 'Export the load table as an Excel (.xlsx) file or import one with the same format.',
        'Descargar Excel (.xlsx)': 'Download Excel (.xlsx)',
        'Importar Excel': 'Import Excel',
        'El archivo Excel sigue el formato del cuadro de cargas: Descripción, Cantidad, Potencia (W), y Franjas Horarias.': 'The Excel file follows the load table format: Description, Quantity, Power (W), and Time Slots.',

        // Stage 2: Sizing (Reto 02)
        'Datos Heredados de la Caracterización de Demanda': 'Data Inherited from Demand Characterization',
        'Parámetros transferidos directamente desde el Reto 01 sin reintroducción (RF-13).': 'Parameters transferred directly from Challenge 01 without re-entry (RF-13).',
        '✓ Sincronizado en Memoria': '✓ Synchronized in Memory',
        'Energía Diaria (Ed)': 'Daily Energy (Ed)',
        'Demanda Máx. (Pmax)': 'Max Demand (Pmax)',
        'Energía Mensual (Em)': 'Monthly Energy (Em)',
        'Energía Anual (Ea)': 'Annual Energy (Ea)',
        'Coincidencia de Demanda en Ventana Solar (06:00 – 18:00 h) — RF-17': 'Demand Match in Solar Window (06:00 – 18:00 h) — RF-17',
        'Clasificación de energía solar directa vs almacenamiento': 'Direct solar energy vs battery storage classification',
        'Dentro de Ventana Solar:': 'Inside Solar Window:',
        'Fuera de Ventana (Nocturno):': 'Outside Window (Nighttime):',
        'Recurso solar — PVGIS (Comisión Europea)': 'Solar Resource — PVGIS (European Commission)',
        'Recurso solar y ubicación geográfica': 'Solar Resource and Geographic Location',
        '🌐 PVGIS (Ángulos Óptimos)': '🌐 PVGIS (Optimal Angles)',
        '⚡ NREL PVWatts v8': '⚡ NREL PVWatts v8',
        '🌍 Base Continental': '🌍 Continental Database',
        'Parámetros Fijos': 'Fixed Parameters',
        'Coordenadas Geográficas (Latitud y Longitud)': 'Geographic Coordinates (Latitude & Longitude)',
        'Latitud (°)': 'Latitude (°)',
        'Longitud (°)': 'Longitude (°)',
        'Inclinación de Módulos (Tilt °)': 'Module Tilt Angle (Tilt °)',
        'Ángulo de inclinación óptimo': 'Optimal tilt angle',
        'Azimut (°)': 'Azimuth (°)',
        'Orientación azimutal': 'Azimuthal orientation',
        'Consultar PVGIS': 'Query PVGIS',
        'Consultar NREL': 'Query NREL',
        'Tmin Histórica (°C)': 'Historical Tmin (°C)',
        'Tamb Operación (°C)': 'Operating Tamb (°C)',
        'HSP Anual Promedio': 'Average Annual PSH',
        'HSP Mes Crítico': 'Critical Month PSH',
        'HSP Mes Máximo': 'Maximum Month PSH',
        'Mes Crítico (Diseño)': 'Critical Month (Design)',
        'Irradiancia Mensual (HSP · kWh/m²/día)': 'Monthly Irradiance (PSH · kWh/m²/day)',
        'Selección y Dimensionamiento del Generador Fotovoltaico': 'Photovoltaic Generator Selection & Sizing',
        'Módulo Fotovoltaico Seleccionado': 'Selected Photovoltaic Module',
        'Editar Módulo Actual': 'Edit Current Module',
        'Potencia Nominal (Pmp / STC)': 'Nominal Power (Pmp / STC)',
        'Tensión Voc mín (Tmin)': 'Min Voc Voltage (Tmin)',
        'Tensión Vmp real (Tamb)': 'Real Vmp Voltage (Tamb)',
        'Corriente Máx. Potencia (Imp)': 'Max Power Current (Imp)',
        'Corriente Cortocircuito (Isc)': 'Short Circuit Current (Isc)',
        'Eficiencia del Módulo': 'Module Efficiency',
        'Área del Módulo': 'Module Area',
        'Parámetros del Sistema y Criterio de Diseño': 'System Parameters & Design Criteria',
        'Área Disponible en Techo (m²)': 'Available Roof Area (m²)',
        'Performance Ratio (PR)': 'Performance Ratio (PR)',
        'Criterio de Dimensionamiento': 'Sizing Criterion',
        'Mes Crítico (Conservador / Recomendado)': 'Critical Month (Conservative / Recommended)',
        'Promedio Anual (Equilibrado)': 'Annual Average (Balanced)',
        'Resultados del Dimensionamiento — Generador FV': 'Sizing Results — PV Generator',
        'Módulos Necesarios (Energía)': 'Required Modules (Energy)',
        'Módulos Máximos (Área)': 'Maximum Modules (Area)',
        'Módulos Recomendados': 'Recommended Modules',
        'Potencia Pico del Generador': 'Generator Peak Power',
        'Área Total Ocupada': 'Total Occupied Area',
        'Generación Diaria Estimada': 'Estimated Daily Generation',
        'Generación Mensual Estimada': 'Estimated Monthly Generation',
        'Generación Anual Estimada': 'Estimated Annual Generation',
        'Cobertura de la Demanda': 'Demand Coverage',
        'Comparativa de Módulos Alternativos': 'Alternative Modules Comparison',
        'Proyección de Generación vs Demanda Energética': 'Generation vs Energy Demand Projection',
        'Vista Mensual (12 Meses)': 'Monthly View (12 Months)',
        'Vista Anual Proyectada': 'Projected Annual View',

        // Card 7: Project Management in Sizing
        'Gestión del Proyecto e Informe Ejecutivo': 'Project Management & Executive Report',
        'Genere el informe ejecutivo o gestione la persistencia del proyecto sin salir de la etapa de dimensionamiento.': 'Generate the executive report or manage project persistence without leaving the PV sizing stage.',
        'Informe Ejecutivo (PDF)': 'Executive Report (PDF)',
        'Genera un informe integral con todos los datos del proyecto, cuadro de cargas, perfil 24 h, dimensionamiento solar e indicadores clave de ambos retos.': 'Generates a comprehensive report with all project parameters, load schedule, 24h profile, PV sizing, and key indicators from both challenges.',
        'Persistencia (.json)': 'Persistence (.json)',
        'Guarde o recupere el estado completo del proyecto (cargas, configuración y dimensionamiento) en un archivo local JSON.': 'Save or restore the complete project state (loads, configuration, and sizing) to a local JSON file.',
        'Cuadro de Cargas (.xlsx)': 'Load Table (.xlsx)',
        'Exporte las cargas en formato Excel estructurado o importe una planilla existente con franjas horarias.': 'Export loads to a structured Excel spreadsheet or import an existing sheet with hourly schedules.',
        'Guardar': 'Save',
        'Cargar': 'Load',
        'Exportar Excel': 'Export Excel',

        // Config Modal
        'Configuración y Metodología de Cálculo': 'Configuration & Calculation Methodology',
        'APIs y Servicios': 'APIs & Services',
        'Ecuaciones Generales y Metodología': 'General Equations & Methodology',
        'Modo de Obtención del Recurso Solar': 'Solar Resource Acquisition Mode',
        'Consultar datos en línea por API (PVGIS / PVWatts)': 'Online API Query (PVGIS / PVWatts)',
        'Desactivar búsqueda por API y usar Base de Datos Manual Continental': 'Disable API and use Manual Continental Database',
        'Continente para la Instalación (Base de Datos Continental)': 'Installation Continent (Continental Database)',
        'Clave de API PVWatts (NREL)': 'PVWatts (NREL) API Key',
        'Clave de API NASA POWER / NASA Open API': 'NASA POWER / NASA Open API Key',
        'Rango de Evaluación de Temperaturas NASA': 'NASA Temperature Evaluation Range',
        'Guardar Configuración': 'Save Configuration',
        'Cerrar': 'Close',

        // Months
        'Enero': 'January',
        'Febrero': 'February',
        'Marzo': 'March',
        'Abril': 'April',
        'Mayo': 'May',
        'Junio': 'June',
        'Julio': 'July',
        'Agosto': 'August',
        'Septiembre': 'September',
        'Octubre': 'October',
        'Noviembre': 'November',
        'Diciembre': 'December',

        // Footer
        'Planeación Solar Práctica v2.0 — Energía Solar Fotovoltaica (Reto 01 & Reto 02) — 2026': 'Practical Solar Planning v2.0 — Solar Photovoltaic Energy (Challenge 01 & Challenge 02) — 2026',

        // Placeholders
        'Ej: Vivienda García – Barranquilla': 'e.g., Garcia Residence – Barranquilla',
        'Ej: PV-2026-001': 'e.g., PV-2026-001',
        'Nombres separados por coma': 'Comma separated names',
        'Ej: Foco LED': 'e.g., LED Bulb',
        'Ej: 10': 'e.g., 10',
        'Ej: 20': 'e.g., 20',
        'Ej: 12': 'e.g., 12'
    }
};

// Current active language: read from localStorage or default to 'es'
window.APP_LANG = localStorage.getItem('app_lang') || 'es';

function isTextNode(node) {
    return node.nodeType === Node.TEXT_NODE && node.nodeValue.trim() !== '';
}

function collectTextNodes(el, list = []) {
    if (!el || el.tagName === 'SCRIPT' || el.tagName === 'STYLE') return list;

    for (let child of el.childNodes) {
        if (isTextNode(child)) {
            if (!child.originalText) {
                child.originalText = child.nodeValue;
            }
            list.push(child);
        } else if (child.nodeType === Node.ELEMENT_NODE) {
            collectTextNodes(child, list);
        }
    }
    return list;
}

window.translateText = function(text, targetLang) {
    const lang = targetLang || window.APP_LANG;
    if (lang === 'en' && translations['en'][text]) {
        return translations['en'][text];
    }
    return text;
};

function updateUITexts() {
    const isEn = window.APP_LANG === 'en';
    const dict = isEn ? translations['en'] : null;

    // 1. Text nodes in DOM
    const allTextNodes = collectTextNodes(document.body);
    allTextNodes.forEach(node => {
        const orig = node.originalText;
        const trimmedOrig = orig.trim();

        if (isEn && dict && dict[trimmedOrig]) {
            node.nodeValue = orig.replace(trimmedOrig, dict[trimmedOrig]);
        } else if (!isEn) {
            node.nodeValue = orig;
        }
    });

    // 2. Form input placeholders
    const inputs = document.querySelectorAll('[placeholder]');
    inputs.forEach(input => {
        if (!input.originalPlaceholder) {
            input.originalPlaceholder = input.getAttribute('placeholder');
        }
        const orig = input.originalPlaceholder.trim();
        if (isEn && dict && dict[orig]) {
            input.setAttribute('placeholder', dict[orig]);
        } else if (!isEn) {
            input.setAttribute('placeholder', input.originalPlaceholder);
        }
    });

    // 3. Titles and tooltips
    const elementsWithTitle = document.querySelectorAll('[title]');
    elementsWithTitle.forEach(el => {
        if (!el.originalTitle) {
            el.originalTitle = el.getAttribute('title');
        }
        const orig = el.originalTitle.trim();
        if (isEn && dict && dict[orig]) {
            el.setAttribute('title', dict[orig]);
        } else if (!isEn) {
            el.setAttribute('title', el.originalTitle);
        }
    });

    // 4. Update Header Buttons
    const btnText = document.getElementById('lang-label');
    if (btnText) {
        btnText.textContent = isEn ? 'EN' : 'ES';
    }
    const btnLang = document.getElementById('btn-lang');
    if (btnLang) {
        btnLang.title = isEn ? 'Cambiar a Español' : 'Switch to English';
    }

    // 5. Update HTML lang and title
    document.documentElement.lang = window.APP_LANG;
    if (isEn) {
        document.title = 'Practical Solar Planning — Solar Photovoltaic Energy';
    } else {
        document.title = 'Planeación Solar Práctica — Caracterización de Demanda Energética';
    }
}

function toggleLanguage() {
    window.APP_LANG = window.APP_LANG === 'es' ? 'en' : 'es';
    localStorage.setItem('app_lang', window.APP_LANG);

    updateUITexts();

    // Re-render dynamic elements
    if (typeof updateFrequencyHints === 'function') updateFrequencyHints();
    if (typeof renderLoads === 'function') renderLoads();
    if (typeof recalculateAll === 'function') recalculateAll();
    if (typeof updateSizing === 'function') updateSizing();

    if (typeof showToast === 'function') {
        const msg = window.APP_LANG === 'en' ? 'Language switched to English' : 'Idioma cambiado a Español';
        showToast(msg, 'info');
    }
}

function initI18n() {
    // If language was saved as 'en', apply it immediately
    const savedLang = localStorage.getItem('app_lang');
    if (savedLang === 'en') {
        window.APP_LANG = 'en';
        updateUITexts();
    }

    const langBtn = document.getElementById('btn-lang');
    if (langBtn) {
        // Remove duplicate listeners if any
        langBtn.removeEventListener('click', toggleLanguage);
        langBtn.addEventListener('click', toggleLanguage);
    }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initI18n);
} else {
    initI18n();
}

window.initI18n = initI18n;
window.toggleLanguage = toggleLanguage;
window.updateUITexts = updateUITexts;
