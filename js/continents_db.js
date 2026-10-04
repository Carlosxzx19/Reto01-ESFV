/* ═══════════════════════════════════════════════
   continents_db.js — Manual Continental Solar Database
   Provides offline/fallback solar data (GHI horizontal irradiance and temperatures)
   for 6 continents when APIs fail or when API queries are disabled.
   ═══════════════════════════════════════════════ */

const CONTINENTS_DB = {
    data: {
        "America_del_Sur": {
            id: "America_del_Sur",
            name: "América del Sur",
            hsp_mensual: [4.2, 4.4, 4.7, 4.9, 4.6, 4.4, 4.5, 4.8, 5.0, 4.7, 4.3, 4.1],
            temp_ambiente_promedio: 25.0,
            temp_minima_extrema: 12.0
        },
        "America_del_Norte": {
            id: "America_del_Norte",
            name: "América del Norte",
            hsp_mensual: [3.0, 3.6, 4.8, 5.6, 6.2, 6.5, 6.2, 5.5, 4.5, 3.7, 3.1, 2.8],
            temp_ambiente_promedio: 15.0,
            temp_minima_extrema: -15.0
        },
        "Europa": {
            id: "Europa",
            name: "Europa",
            hsp_mensual: [1.8, 2.6, 3.9, 5.1, 6.0, 6.3, 6.0, 5.0, 3.8, 2.6, 1.8, 1.5],
            temp_ambiente_promedio: 12.0,
            temp_minima_extrema: -10.0
        },
        "Africa": {
            id: "Africa",
            name: "África",
            hsp_mensual: [5.2, 5.6, 6.0, 6.4, 6.6, 6.5, 6.4, 6.5, 6.3, 5.8, 5.4, 5.0],
            temp_ambiente_promedio: 26.0,
            temp_minima_extrema: 10.0
        },
        "Asia": {
            id: "Asia",
            name: "Asia",
            hsp_mensual: [3.2, 3.9, 4.8, 5.5, 5.8, 5.6, 5.4, 5.5, 5.0, 4.2, 3.5, 3.0],
            temp_ambiente_promedio: 20.0,
            temp_minima_extrema: -8.0
        },
        "Oceanía": {
            id: "Oceanía",
            name: "Oceanía",
            hsp_mensual: [5.8, 5.5, 5.0, 4.4, 3.9, 3.7, 3.9, 4.4, 5.0, 5.5, 5.8, 6.0],
            temp_ambiente_promedio: 23.0,
            temp_minima_extrema: 5.0
        }
    },

    get(id) {
        return this.data[id] || this.data["America_del_Sur"];
    },

    getAll() {
        return Object.values(this.data);
    },

    /**
     * Get preferred mode: 'api' (use online APIs) or 'manual' (use continental database)
     */
    getMode() {
        return localStorage.getItem('pv_data_source_mode') || 'api';
    },

    setMode(mode) {
        const valid = mode === 'manual' ? 'manual' : 'api';
        localStorage.setItem('pv_data_source_mode', valid);
        return valid;
    },

    /**
     * Get currently selected continent ID
     */
    getSelectedContinent() {
        return localStorage.getItem('pv_selected_continent') || 'America_del_Sur';
    },

    setSelectedContinent(id) {
        if (this.data[id]) {
            localStorage.setItem('pv_selected_continent', id);
            return id;
        }
        return 'America_del_Sur';
    },

    /**
     * Convert continent record into normalized solarResource object
     */
    toSolarResource(continentId, options = {}) {
        const c = this.get(continentId);
        const monthlyHsp = [...c.hsp_mensual];

        let minH = Infinity, critIdx = 0, maxH = -Infinity, maxIdx = 0;
        monthlyHsp.forEach((v, i) => {
            if (v < minH) { minH = v; critIdx = i; }
            if (v > maxH) { maxH = v; maxIdx = i; }
        });

        const annualHsp = Math.round((monthlyHsp.reduce((a, b) => a + b, 0) / 12) * 100) / 100;
        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

        return {
            source: options.isFallback
                ? `Base Continental: ${c.name} (Respaldo por falla de API · GHI Horizontal)`
                : `Base Continental: ${c.name} (Irradiancia Horizontal GHI)`,
            provider: 'manual_continent',
            continentId: c.id,
            continentName: c.name,
            isManualContinent: true,
            isFallback: !!options.isFallback,
            fallbackReason: options.fallbackReason || null,
            isCached: false,
            queryDate: new Date().toISOString().split('T')[0],
            lat: options.lat !== undefined ? options.lat : null,
            lon: options.lon !== undefined ? options.lon : null,
            tilt: options.tilt !== undefined ? options.tilt : 0,
            azimuth: options.azimuth !== undefined ? options.azimuth : 180,
            arrayType: 0,
            losses: 0,
            annualHsp,
            criticalMonthHsp: minH,
            criticalMonthIndex: critIdx,
            criticalMonthName: monthNames[critIdx],
            maxMonthHsp: maxH,
            maxMonthIndex: maxIdx,
            maxMonthName: monthNames[maxIdx],
            monthlyHsp,
            tempAmbientePromedio: c.temp_ambiente_promedio,
            tempMinimaExtrema: c.temp_minima_extrema,
            notice: 'Aviso: La irradiancia de esta base de datos local es horizontal (GHI), no hacia el plano inclinado (POA).'
        };
    }
};

window.CONTINENTS_DB = CONTINENTS_DB;
