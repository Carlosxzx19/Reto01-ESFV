/* ═══════════════════════════════════════════════
   modules_db.js — PV Modules Catalog Manager (RF-23)
   External editable catalog of solar panel models
   ═══════════════════════════════════════════════ */

const DEFAULT_MODULES = [
    {
        id: 'panel-150w',
        name: 'Módulo 1',
        manufacturer: 'AutoSolar',
        model: 'AS-210W-12V',
        pmax: 210,
        cellsInSeries: 36,
        voc: 23.95,
        isc: 11.07,
        pmaxNmot: 156.8,
        vmp: 20.05,
        imp: 10.47,
        tempCoefVoc: -0.32,
        tempCoefIsc: 0.05,
        tempCoefPmp: -0.39,
        noct: 45,
        area: 1.092,
        efficiency: 19.23,
        nominalVoltage: '12V',
        notes: 'Panel Solar 210W 12V Monocristalino',
        datasheetSource: 'Ficha técnica oficial AutoSolar',
        datasheetDate: '2026-10-01',
        url: 'https://autosolar.co/paneles-solares-12v/panel-solar-210w-12v-monocristalino'
    },
    {
        id: 'panel-330w',
        name: 'Módulo 2',
        manufacturer: 'JA Solar',
        model: 'JAM72S01-340/PR',
        pmax: 340,
        cellsInSeries: 72,
        voc: 41.55,
        isc: 10.46,
        pmaxNmot: 257,
        vmp: 34.73,
        imp: 9.79,
        tempCoefVoc: -0.272,
        tempCoefIsc: 0.044,
        tempCoefPmp: -0.35,
        noct: 45,
        area: 1.682,
        efficiency: 16.9,
        nominalVoltage: '24V',
        notes: 'Panel Solar 340W 24V Monocristalino PERC JA Solar',
        datasheetSource: 'Ficha técnica oficial AutoSolar',
        datasheetDate: '2026-10-01',
        url: 'https://autosolar.co/paneles-solares-24v/panel-solar-340w-24v-monocristalino-perc-ja-solar'
    },
    {
        id: 'panel-550w',
        name: 'Módulo 3',
        manufacturer: 'EcoGreen',
        model: 'EG-550M-144',
        pmax: 550,
        cellsInSeries: 144,
        voc: 49.8,
        isc: 13.99,
        pmaxNmot: 410,
        vmp: 41.6,
        imp: 13.23,
        tempCoefVoc: -0.28,
        tempCoefIsc: 0.05,
        tempCoefPmp: -0.36,
        noct: 45,
        area: 2.584,
        efficiency: 21.5,
        nominalVoltage: '24V / On-Grid',
        notes: 'Panel Solar 550W 24V Monocristalino PERC EcoGreen',
        datasheetSource: 'Ficha técnica oficial AutoSolar',
        datasheetDate: '2026-10-01',
        url: 'https://autosolar.co/paneles-solares-24v/panel-solar-550w-24v-monocristalino-perc-ecogreen'
    },
    {
        id: 'panel-estandar',
        name: 'Módulo Estándar (550 Wp)',
        manufacturer: 'Caso Estándar Oficial',
        model: 'REF-550W-72C',
        pmax: 550,
        cellsInSeries: 72,
        voc: 49.5,
        isc: 14.0,
        pmaxNmot: 412,
        vmp: 41.5,
        imp: 13.3,
        tempCoefVoc: -0.27,
        tempCoefIsc: 0.05,
        tempCoefPmp: -0.35,
        noct: 45,
        area: 2.58,
        efficiency: 21.3,
        nominalVoltage: '24V / 600V',
        notes: 'Módulo de referencia oficial declarado para el Caso Estándar',
        datasheetSource: 'Reto 02 - Tabla 7.2 Módulo de referencia del caso',
        datasheetDate: '2026-10-04',
        url: ''
    }
];

const MODULES_DB = {
    modules: JSON.parse(JSON.stringify(DEFAULT_MODULES)),

    getStandardModule() {
        return this.modules.find(m => m.id === 'panel-estandar') || DEFAULT_MODULES.find(m => m.id === 'panel-estandar') || DEFAULT_MODULES[3];
    },

    async init() {
        const DB_VERSION = 'v2_nmot_autosolar';
        if (localStorage.getItem('pv_modules_db_version') !== DB_VERSION) {
            localStorage.removeItem('pv_custom_modules');
            localStorage.setItem('pv_modules_db_version', DB_VERSION);
        }

        const saved = localStorage.getItem('pv_custom_modules');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    this.modules = parsed.map((m, idx) => ({
                        ...m,
                        name: m.name ? m.name.replace(/^(Módulo \d+).*/, '$1') : `Módulo ${idx + 1}`
                    }));
                    return;
                }
            } catch (e) {
                console.warn('Error reading saved custom modules, using defaults', e);
            }
        }

        try {
            const resp = await fetch('data/modules.json');
            if (resp.ok) {
                const data = await resp.json();
                if (Array.isArray(data) && data.length > 0) {
                    this.modules = data.map((m, idx) => ({
                        ...m,
                        name: m.name ? m.name.replace(/^(Módulo \d+).*/i, '$1') : `Módulo ${idx + 1}`
                    }));
                    return;
                }
            }
        } catch (e) {
            console.info('Usando catálogo de módulos pre-embebido');
        }
        this.modules = JSON.parse(JSON.stringify(DEFAULT_MODULES));
    },

    getAll() {
        return this.modules;
    },

    getById(id) {
        return this.modules.find(m => m.id === id) || this.modules[0];
    },

    getModule(id) {
        return this.getById(id);
    },

    updateModule(id, updatedFields) {
        const idx = this.modules.findIndex(m => m.id === id);
        if (idx !== -1) {
            if (updatedFields.name) {
                updatedFields.name = updatedFields.name.replace(/^(Módulo \d+).*/i, '$1');
            }
            this.modules[idx] = { ...this.modules[idx], ...updatedFields };
            localStorage.setItem('pv_custom_modules', JSON.stringify(this.modules));
            return this.modules[idx];
        }
        return null;
    },

    getDefaultModule(id) {
        return DEFAULT_MODULES.find(m => m.id === id);
    },

    resetModule(id) {
        const def = this.getDefaultModule(id);
        if (def) {
            return this.updateModule(id, JSON.parse(JSON.stringify(def)));
        }
        return null;
    },

    resetDefaults() {
        this.modules = JSON.parse(JSON.stringify(DEFAULT_MODULES));
        localStorage.removeItem('pv_custom_modules');
        return this.modules;
    },

    addModule(newMod) {
        if (!newMod.id) newMod.id = 'mod-' + Date.now();
        this.modules.push(newMod);
    }
};

window.MODULES_DB = MODULES_DB;

