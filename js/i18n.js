/* ═══════════════════════════════════════════════
   i18n.js — Language Localization
   ═══════════════════════════════════════════════ */

const translations = {
    // English translations for Spanish original strings
    'es': {},
    'en': {
        // Headers & Meta
        'SolarCalc — Caracterización de Demanda Energética': 'SolarCalc — Energy Demand Characterization',
        'Caracterización de Demanda Energética Fotovoltaica': 'Photovoltaic Energy Demand Characterization',
        'Modo Claro': 'Light Mode',
        'Modo Oscuro': 'Dark Mode',

        // Tabs
        'Proyecto': 'Project',
        'Cuadro de Cargas': 'Load Table',
        'Resultados': 'Results',
        'Informe': 'Report',

        // Project Tab
        'Información del Proyecto': 'Project Information',
        'Nombre del Proyecto': 'Project Name',
        'ID del Proyecto': 'Project ID',
        'Integrantes': 'Members',
        'Fecha': 'Date',
        'Tipo de Instalación': 'Installation Type',
        'Residencial (Máx. 600 V)': 'Residential (Max. 600 V)',
        'Industrial (Máx. 1000 V)': 'Industrial (Max. 1000 V)',
        'Tipo de Aplicación': 'System Type',
        'Off-Grid (Aislado)': 'Off-Grid (Isolated)',
        'On-Grid (Conectado a Red)': 'On-Grid (Grid-Tied)',
        'Híbrido Off-Grid': 'Hybrid Off-Grid',
        'Híbrido On-Grid': 'Hybrid On-Grid',
        'Configuración Día / Noche': 'Day / Night Configuration',
        'Define el criterio horario para clasificar las cargas como diurnas, nocturnas o mixtas.': 'Define the time criteria to classify loads as diurnal, nocturnal, or mixed.',
        'Inicio del Día': 'Start of Day',
        'Inicio de la Noche': 'Start of Night',
        'Vista previa 24 h': '24h Preview',
        'Día': 'Day',
        'Noche': 'Night',

        // Load Table Tab
        'Frecuencia de Operación por Defecto': 'Default Operating Frequency',
        'Establece los días y meses de operación estándar para todas las cargas (puedes personalizar cargas individuales en el formulario).': 'Sets standard operating days and months for all loads (you can customize individual loads in the form).',
        'Días de operación / mes (por defecto)': 'Operating days / month (default)',
        'Meses de operación / año (por defecto)': 'Operating months / year (default)',
        'Agregar Carga': 'Add Load',
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
        'Cancelar': 'Cancel',
        'Cargas Registradas': 'Registered Loads',
        'No hay cargas registradas.': 'No registered loads.',
        'Agregue una carga eléctrica para comenzar el análisis.': 'Add an electrical load to start the analysis.',

        // Table Headers
        'Cant.': 'Qty.',
        'P. Unit. (W)': 'U. Power (W)',
        'P. Total (W)': 'Total P. (W)',
        'Horario': 'Schedule',
        'h/día': 'h/day',
        'Frecuencia': 'Frequency',
        'Clasif.': 'Classif.',
        'Acciones': 'Actions',

        // Results Tab
        'Potencia Instalada': 'Installed Power',
        'Demanda Máxima Simultánea': 'Max Simultaneous Demand',
        'Energía Diaria': 'Daily Energy',
        'Energía Mensual': 'Monthly Energy',
        'Energía Anual': 'Annual Energy',
        'Parámetros de Proyección': 'Projection Parameters',
        'Días de operación / mes': 'Days of operation / month',
        'Meses de operación / año': 'Months of operation / year',
        'Costo Unitario CU (COP/kWh)': 'Unit Cost (COP/kWh)',
        'Costo Unitario CU (COP/kWh):': 'Unit Cost (COP/kWh):',
        'Perfil de Demanda — 24 Horas': 'Demand Profile — 24 Hours',
        'Área': 'Area',
        'Barras': 'Bars',
        'Estimación de Costos': 'Cost Estimation',
        'Costo Diario': 'Daily Cost',
        'Costo Mensual': 'Monthly Cost',
        'Costo Anual': 'Annual Cost',

        // Report Tab
        'Persistencia del Proyecto': 'Project Persistence',
        'Guarde o cargue el estado completo del proyecto como archivo JSON.': 'Save or load the complete project state as a JSON file.',
        'Guardar Proyecto (.json)': 'Save Project (.json)',
        'Cargar Proyecto': 'Load Project',
        'El archivo guarda toda la información: proyecto, configuración, cargas y parámetros.': 'The file saves all information: project, config, loads, and parameters.',
        'Informe Ejecutivo': 'Executive Report',
        'Genere un informe de una página con todos los datos, indicadores, perfil 24 h y costos.': 'Generate a one-page report with all data, indicators, 24h profile, and costs.',
        'Generar Informe PDF': 'Generate PDF Report',
        'Cuadro de Cargas — Excel': 'Load Table — Excel',
        'Exporte el cuadro de cargas como archivo Excel (.xlsx) o importe uno con el mismo formato.': 'Export the load table as an Excel (.xlsx) file or import one with the same format.',
        'Descargar Excel (.xlsx)': 'Download Excel (.xlsx)',
        'Importar Excel': 'Import Excel',
        'El archivo Excel sigue el formato del cuadro de cargas: Descripción, Cantidad, Potencia (W), y Franjas Horarias.': 'The Excel file follows the load table format: Description, Quantity, Power (W), and Time Slots.',

        // Footer
        'SolarCalc v1.0 — Energía Solar Fotovoltaica — 2026': 'SolarCalc v1.0 — Photovoltaic Solar Energy — 2026',

        // Placeholders (can't easily do text nodes for placeholders unless querying them, so we will handle them)
        'Ej: Vivienda García – Barranquilla': 'e.g., Garcia Residence – Barranquilla',
        'Ej: PV-2026-001': 'e.g., PV-2026-001',
        'Nombres separados por coma': 'Comma separated names',
        'Ej: Foco LED': 'e.g., LED Bulb',
        'Ej: 10': 'e.g., 10',
        'Ej: 20': 'e.g., 20',
        'Ej: 12': 'e.g., 12'
    }
};

window.APP_LANG = 'es'; // default

function isTextNode(node) {
    return node.nodeType === Node.TEXT_NODE && node.nodeValue.trim() !== '';
}

function collectTextNodes(el, list = []) {
    // Avoid scripts and styles
    if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE') return list;

    for (let child of el.childNodes) {
        if (isTextNode(child)) {
            // Save original Spanish text in a custom property if not already saved
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

    const allTextNodes = collectTextNodes(document.body);
    
    allTextNodes.forEach(node => {
        const orig = node.originalText;
        const trimmedOrig = orig.trim();
        
        // Match exact trimmed string
        if (isEn && dict[trimmedOrig]) {
            node.nodeValue = orig.replace(trimmedOrig, dict[trimmedOrig]);
        } else if (!isEn) {
            // Revert to Spanish
            node.nodeValue = orig;
        }
    });

    // Update Placeholders
    const inputs = document.querySelectorAll('[placeholder]');
    inputs.forEach(input => {
        if (!input.originalPlaceholder) {
            input.originalPlaceholder = input.getAttribute('placeholder');
        }
        const orig = input.originalPlaceholder.trim();
        if (isEn && dict[orig]) {
            input.setAttribute('placeholder', dict[orig]);
        } else if (!isEn) {
            input.setAttribute('placeholder', input.originalPlaceholder);
        }
    });
}

function toggleLanguage() {
    window.APP_LANG = window.APP_LANG === 'es' ? 'en' : 'es';
    
    const btnText = document.getElementById('lang-label');
    if (btnText) {
        btnText.textContent = window.APP_LANG === 'es' ? 'ES' : 'EN';
    }
    
    document.documentElement.lang = window.APP_LANG;

    updateUITexts();
    
    // Render loads to translate dynamic elements like badges and table rows
    if (typeof updateFrequencyHints === 'function') updateFrequencyHints();
    if (typeof renderLoads === 'function') renderLoads();
    if (typeof recalculateAll === 'function') recalculateAll();
}

function initI18n() {
    const langBtn = document.getElementById('btn-lang');
    if (langBtn) {
        langBtn.addEventListener('click', toggleLanguage);
    }
}

window.addEventListener('DOMContentLoaded', initI18n);
