/* ═══════════════════════════════════════════════
   pvwatts_service.js — NREL PVWatts v8 API Client (Level 2)
   Includes error handling, automatic local fallback and session cache
   ═══════════════════════════════════════════════ */

const PVWATTS_SERVICE = {
    // Default API Key provided by user
    defaultApiKey: 'k4qaUJIK13UGUQ4yIdoA7YebJ7j43LvWcmqC259R',
    baseUrl: 'https://developer.nrel.gov/api/pvwatts/v8.json',

    getApiKey() {
        return localStorage.getItem('pvwatts-api-key') || this.defaultApiKey;
    },

    setApiKey(key) {
        if (key && key.trim()) {
            localStorage.setItem('pvwatts-api-key', key.trim());
        } else {
            localStorage.removeItem('pvwatts-api-key');
        }
        this.clearCache();
    },

    /** Clears session cache for PVWatts queries */
    clearCache() {
        try {
            const keysToRemove = [];
            for (let i = 0; i < sessionStorage.length; i++) {
                const k = sessionStorage.key(i);
                if (k && k.startsWith('pvwatts_')) {
                    keysToRemove.push(k);
                }
            }
            keysToRemove.forEach(k => sessionStorage.removeItem(k));
        } catch (e) {
            console.warn('Error limpiando caché de PVWatts:', e);
        }
    },

    /** Generate cache key for sessionStorage */
    getCacheKey(params) {
        const round = (n) => Math.round(Number(n) * 100) / 100;
        return `pvwatts_${round(params.lat)}_${round(params.lon)}_${round(params.tilt)}_${round(params.azimuth)}_${params.arrayType}_${round(params.losses)}`;
    },

    /**
     * Query NREL PVWatts v8
     * @param {Object} params - { lat, lon, tilt, azimuth, arrayType, losses, forceRefresh }
     * @returns {Promise<Object>} Normalized solar resource result
     */
    async fetchSolarResource(params) {
        const lat = parseFloat(params.lat);
        const lon = parseFloat(params.lon);
        const tilt = parseFloat(params.tilt) || 12;
        const azimuth = parseFloat(params.azimuth) || 180;
        const arrayType = parseInt(params.arrayType) === 1 ? 1 : 0; // 1 = Roof, 0 = Open Rack
        const losses = parseFloat(params.losses) >= 0 ? parseFloat(params.losses) : 14;
        const systemCapacity = 1; // 1 kW reference capacity
        const moduleType = 0; // 0 = Standard Polycrystalline

        const queryParams = { lat, lon, tilt, azimuth, arrayType, losses };
        const cacheKey = this.getCacheKey(queryParams);

        // 1. Check Session Cache (unless forceRefresh is requested)
        if (!params.forceRefresh) {
            try {
                const cached = sessionStorage.getItem(cacheKey);
                if (cached) {
                    const parsed = JSON.parse(cached);
                    parsed.isCached = true;
                    return parsed;
                }
            } catch (e) {
                console.warn('Error leyendo caché:', e);
            }
        }

        // 2. Attempt remote query to PVWatts v8
        const apiKey = this.getApiKey();
        const url = `${this.baseUrl}?api_key=${encodeURIComponent(apiKey)}&lat=${lat}&lon=${lon}&system_capacity=${systemCapacity}&module_type=${moduleType}&losses=${losses}&array_type=${arrayType}&tilt=${tilt}&azimuth=${azimuth}`;

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 9000); // 9s timeout

            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const msg = (errorData.errors && errorData.errors.join(', ')) || `Error HTTP ${response.status}`;
                throw new Error(msg);
            }

            const data = await response.json();
            if (!data.outputs || !data.outputs.solrad_annual) {
                throw new Error('Respuesta de API sin datos de irradiancia');
            }

            const monthlyHsp = data.outputs.solrad_monthly.map(v => Math.round(v * 100) / 100);
            const annualHsp = Math.round(data.outputs.solrad_annual * 100) / 100;

            // Find critical month (minimum monthly HSP) and maximum month
            let minHsp = Infinity;
            let criticalIndex = 0;
            let maxHsp = -Infinity;
            let maxIndex = 0;
            monthlyHsp.forEach((hsp, idx) => {
                if (hsp < minHsp) {
                    minHsp = hsp;
                    criticalIndex = idx;
                }
                if (hsp > maxHsp) {
                    maxHsp = hsp;
                    maxIndex = idx;
                }
            });

            const result = {
                source: 'API PVWatts v8 (NREL en vivo)',
                isFallback: false,
                isCached: false,
                queryDate: new Date().toISOString().split('T')[0],
                lat,
                lon,
                tilt,
                azimuth,
                arrayType,
                losses,
                annualHsp,
                criticalMonthHsp: minHsp,
                criticalMonthIndex: criticalIndex,
                criticalMonthName: (typeof SOLAR_DB !== 'undefined' && SOLAR_DB.monthNames) ? SOLAR_DB.monthNames[criticalIndex] : 'Mes Crítico',
                maxMonthHsp: maxHsp,
                maxMonthIndex: maxIndex,
                maxMonthName: (typeof SOLAR_DB !== 'undefined' && SOLAR_DB.monthNames) ? SOLAR_DB.monthNames[maxIndex] : 'Mes Máximo',
                monthlyHsp,
                acMonthly: data.outputs.ac_monthly || [],
                acAnnual: data.outputs.ac_annual || 0,
                poaMonthly: data.outputs.poa_monthly || []
            };

            // Save to Session Cache
            try {
                sessionStorage.setItem(cacheKey, JSON.stringify(result));
            } catch (e) {
                console.warn('No se pudo guardar en sessionStorage:', e);
            }

            return result;

        } catch (err) {
            console.warn('Fallo en consulta PVWatts API, activando contingencia local / continental:', err.message);

            // 3. Fallback to Continental Database if available, otherwise local SOLAR_DB
            if (typeof CONTINENTS_DB !== 'undefined') {
                const contId = CONTINENTS_DB.getSelectedContinent();
                return CONTINENTS_DB.toSolarResource(contId, {
                    isFallback: true,
                    fallbackReason: 'Falla en consulta API PVWatts: ' + err.message,
                    lat,
                    lon,
                    tilt,
                    azimuth
                });
            }

            const localLoc = (typeof SOLAR_DB !== 'undefined') ? SOLAR_DB.findNearest(lat, lon) : null;
            if (!localLoc) throw err;

            const mHsp = [...localLoc.monthlyHsp];
            let minH = Infinity, critIdx = 0, maxH = -Infinity, maxIdx = 0;
            mHsp.forEach((v, i) => {
                if (v < minH) { minH = v; critIdx = i; }
                if (v > maxH) { maxH = v; maxIdx = i; }
            });

            return {
                source: `Base de Datos Local (Contingencia: ${localLoc.name})`,
                isFallback: true,
                isCached: false,
                fallbackReason: err.message,
                queryDate: new Date().toISOString().split('T')[0],
                lat: localLoc.lat,
                lon: localLoc.lon,
                tilt: localLoc.tilt,
                azimuth: localLoc.azimuth,
                arrayType,
                losses,
                annualHsp: localLoc.annualHsp,
                criticalMonthHsp: minH,
                criticalMonthIndex: critIdx,
                criticalMonthName: SOLAR_DB.monthNames[critIdx],
                maxMonthHsp: maxH,
                maxMonthIndex: maxIdx,
                maxMonthName: SOLAR_DB.monthNames[maxIdx],
                monthlyHsp: mHsp,
                notes: localLoc.notes,
                originalCitation: localLoc.source
            };
        }
    }
};

window.PVWATTS_SERVICE = PVWATTS_SERVICE;
