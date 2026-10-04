/* ═══════════════════════════════════════════════
   nasa_power_service.js — NASA POWER Climatology & Daily API Client
   Automates minimum and average ambient temperatures with customizable date ranges.
   Limits: Min 20 years ago (2006-08-30), Max Aug 30, 2026.
   Endpoints:
   - Daily: /api/temporal/daily/point
   - Climatology (fallback): /api/temporal/climatology/point
   ═══════════════════════════════════════════════ */

const NASA_POWER_SERVICE = {
    dailyUrl: 'https://power.larc.nasa.gov/api/temporal/daily/point',
    climatologyUrl: 'https://power.larc.nasa.gov/api/temporal/climatology/point',

    // Default constraints requested by user
    minAllowedDate: '2006-08-30',
    maxAllowedDate: '2026-08-30',

    getApiKey() {
        return localStorage.getItem('nasa-api-key') || '';
    },

    setApiKey(key) {
        if (key && key.trim()) {
            localStorage.setItem('nasa-api-key', key.trim());
        } else {
            localStorage.removeItem('nasa-api-key');
        }
    },

    getDateRange() {
        const start = localStorage.getItem('nasa-start-date') || this.minAllowedDate;
        const end = localStorage.getItem('nasa-end-date') || this.maxAllowedDate;
        return { startDate: start, endDate: end };
    },

    setDateRange(startDate, endDate) {
        if (startDate && startDate >= this.minAllowedDate && startDate <= this.maxAllowedDate) {
            localStorage.setItem('nasa-start-date', startDate);
        }
        if (endDate && endDate >= this.minAllowedDate && endDate <= this.maxAllowedDate) {
            localStorage.setItem('nasa-end-date', endDate);
        }
        this.clearCache();
    },

    clearCache() {
        try {
            const keysToRemove = [];
            for (let i = 0; i < sessionStorage.length; i++) {
                const k = sessionStorage.key(i);
                if (k && k.startsWith('nasa_')) {
                    keysToRemove.push(k);
                }
            }
            keysToRemove.forEach(k => sessionStorage.removeItem(k));
        } catch (e) {
            console.warn('Error limpiando caché de NASA POWER:', e);
        }
    },

    /** Generate cache key for session */
    getCacheKey(lat, lon, startStr, endStr) {
        const round = (n) => Math.round(Number(n) * 100) / 100;
        return `nasa_temp_${round(lat)}_${round(lon)}_${startStr}_${endStr}`;
    },

    /**
     * Fetch temperatures for given lat/lon respecting configured date range
     * @param {number} lat - Latitude
     * @param {number} lon - Longitude
     * @param {Object} [options] - Optional custom { startDate, endDate }
     * @returns {Promise<Object>} { tmin, tambOp, source, startDate, endDate, daysCount, isFallback, isCached }
     */
    async fetchTemperatures(lat, lon, options = {}) {
        lat = parseFloat(lat);
        lon = parseFloat(lon);

        const currentRange = this.getDateRange();
        const startDate = options.startDate || currentRange.startDate;
        const endDate = options.endDate || currentRange.endDate;

        const startStr = startDate.replace(/-/g, '');
        const endStr = endDate.replace(/-/g, '');
        const cacheKey = this.getCacheKey(lat, lon, startStr, endStr);

        // 1. Check session cache
        try {
            const cached = sessionStorage.getItem(cacheKey);
            if (cached) {
                const parsed = JSON.parse(cached);
                parsed.isCached = true;
                return parsed;
            }
        } catch (e) {
            console.warn('Error leyendo caché NASA POWER:', e);
        }

        const apiKey = this.getApiKey();

        // 2. Query NASA POWER Daily API for the selected date range
        let dailyUrl = `${this.dailyUrl}?parameters=T2M_MIN,T2M&community=RE&longitude=${lon}&latitude=${lat}&start=${startStr}&end=${endStr}&format=JSON`;
        if (apiKey) {
            dailyUrl += `&api_key=${encodeURIComponent(apiKey)}`;
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 12000);

            const response = await fetch(dailyUrl, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`Error HTTP ${response.status}`);
            }

            const data = await response.json();
            const param = data.properties && data.properties.parameter;
            if (!param || !param.T2M_MIN || !param.T2M) {
                throw new Error('Respuesta de NASA POWER sin parámetros de temperatura');
            }

            // Filter valid values (NASA uses -999 for missing values)
            const tmins = Object.values(param.T2M_MIN).filter(v => typeof v === 'number' && v > -90);
            const t2ms = Object.values(param.T2M).filter(v => typeof v === 'number' && v > -90);

            if (tmins.length === 0 || t2ms.length === 0) {
                throw new Error('No se encontraron registros válidos de temperatura en el rango');
            }

            // Lowest temperature of the location in this evaluated period
            const lowestTmin = Math.min(...tmins);

            // Average operating ambient temperature over this period
            const tambOp = t2ms.reduce((a, b) => a + b, 0) / t2ms.length;

            const yearsEvaluated = Math.round((tmins.length / 365.25) * 10) / 10;

            const result = {
                source: `NASA POWER (${startDate} al ${endDate} · ${tmins.length} días / ~${yearsEvaluated} años)`,
                isFallback: false,
                isCached: false,
                lat,
                lon,
                startDate,
                endDate,
                daysCount: tmins.length,
                yearsEvaluated,
                tmin: Math.round(lowestTmin * 10) / 10,
                tambOp: Math.round(tambOp * 10) / 10,
                queryDate: new Date().toISOString().split('T')[0]
            };

            // Save in session cache
            try {
                sessionStorage.setItem(cacheKey, JSON.stringify(result));
            } catch (e) {
                console.warn('No se pudo guardar en sessionStorage:', e);
            }

            return result;

        } catch (dailyErr) {
            console.warn('Fallo consulta NASA POWER Daily, intentando climatología o contingencia local:', dailyErr.message);

            // 3. Fallback to Climatology endpoint if daily range fails
            try {
                let climUrl = `${this.climatologyUrl}?parameters=T2M_MIN,T2M&community=RE&longitude=${lon}&latitude=${lat}&format=JSON`;
                if (apiKey) climUrl += `&api_key=${encodeURIComponent(apiKey)}`;

                const climResp = await fetch(climUrl);
                if (climResp.ok) {
                    const cData = await climResp.json();
                    const cParam = cData.properties && cData.properties.parameter;
                    if (cParam && cParam.T2M_MIN && cParam.T2M) {
                        const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
                        let lowestTmin = Infinity;
                        months.forEach(m => {
                            const val = cParam.T2M_MIN[m];
                            if (typeof val === 'number' && val < lowestTmin && val > -90) {
                                lowestTmin = val;
                            }
                        });
                        const tambOp = (typeof cParam.T2M.ANN === 'number' && cParam.T2M.ANN > -90) ? cParam.T2M.ANN : 28;

                        return {
                            source: 'NASA POWER Climatology (Promedio histórico 20 años)',
                            isFallback: false,
                            isCached: false,
                            lat,
                            lon,
                            startDate,
                            endDate,
                            tmin: Math.round(lowestTmin * 10) / 10,
                            tambOp: Math.round(tambOp * 10) / 10,
                            queryDate: new Date().toISOString().split('T')[0]
                        };
                    }
                }
            } catch (climErr) {
                console.warn('Fallo también climatología NASA:', climErr.message);
            }

            // 4. Fallback to documented local temperatures
            const localLoc = (typeof SOLAR_DB !== 'undefined' && SOLAR_DB.findNearest)
                ? SOLAR_DB.findNearest(lat, lon)
                : { tmin: 20.0, tambOp: 32.0, name: 'Nazareth' };

            return {
                source: `Base de Datos Local (Contingencia: ${localLoc.name})`,
                isFallback: true,
                isCached: false,
                lat,
                lon,
                startDate,
                endDate,
                tmin: localLoc.tmin || 20.0,
                tambOp: localLoc.tambOp || 32.0,
                fallbackReason: dailyErr.message,
                queryDate: new Date().toISOString().split('T')[0]
            };
        }
    }
};

window.NASA_POWER_SERVICE = NASA_POWER_SERVICE;
