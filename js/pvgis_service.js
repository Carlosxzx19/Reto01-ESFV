/* ═══════════════════════════════════════════════
   pvgis_service.js — European Commission PVGIS API Client
   Calculates optimal tilt, optimal azimuth and plane-of-array irradiance (H_POA).
   Public access: No API key required.
   ═══════════════════════════════════════════════ */

const PVGIS_SERVICE = {
    baseUrl: 'https://re.jrc.ec.europa.eu/api/PVcalc',

    /** Generate cache key for sessionStorage */
    getCacheKey(lat, lon) {
        const round = (n) => Math.round(Number(n) * 1000) / 1000;
        return `pvgis_${round(lat)}_${round(lon)}`;
    },

    /** Clears session cache for PVGIS queries */
    clearCache() {
        try {
            const keysToRemove = [];
            for (let i = 0; i < sessionStorage.length; i++) {
                const k = sessionStorage.key(i);
                if (k && k.startsWith('pvgis_')) {
                    keysToRemove.push(k);
                }
            }
            keysToRemove.forEach(k => sessionStorage.removeItem(k));
        } catch (e) {
            console.warn('Error limpiando caché de PVGIS:', e);
        }
    },

    /**
     * Query PVGIS API for optimal tilt, azimuth and monthly irradiance
     * @param {Object} params - { lat, lon, forceRefresh }
     * @returns {Promise<Object>} Normalized solar resource result
     */
    async fetchSolarResource(params) {
        const lat = parseFloat(params.lat);
        const lon = parseFloat(params.lon);
        const cacheKey = this.getCacheKey(lat, lon);

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
                console.warn('Error leyendo caché PVGIS:', e);
            }
        }

        // 2. Prepare endpoints: try local proxy first if on localhost, then direct PVGIS endpoint
        const isLocalHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const proxyUrl = `/api/pvgis?lat=${lat}&lon=${lon}`;
        const directUrl = `${this.baseUrl}?lat=${lat}&lon=${lon}&peakpower=1&optimalangles=1&loss=0&outputformat=json`;

        let data = null;
        let fetchSuccess = false;

        const endpointsToTry = isLocalHost ? [proxyUrl, directUrl] : [directUrl];

        for (const url of endpointsToTry) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 9000);
                const response = await fetch(url, { signal: controller.signal });
                clearTimeout(timeoutId);

                if (response.ok) {
                    const json = await response.json();
                    if (json.outputs && json.outputs.monthly && json.outputs.monthly.fixed) {
                        data = json;
                        fetchSuccess = true;
                        break;
                    }
                }
            } catch (err) {
                console.warn(`Intento con ${url} falló:`, err.message);
            }
        }

        if (fetchSuccess && data) {
            const mounting = data.inputs && data.inputs.mounting_system && data.inputs.mounting_system.fixed;
            const optimalTilt = mounting && mounting.slope ? mounting.slope.value : Math.abs(lat);
            const optimalAzimuth = mounting && mounting.azimuth ? mounting.azimuth.value : 0;

            const daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            const monthlyList = data.outputs.monthly.fixed;

            // Extract monthly HSP in kWh/m²/day
            const monthlyHsp = monthlyList.map((m, idx) => {
                let daily = m['H(i)_d'];
                if (daily === undefined || isNaN(daily)) {
                    const totalMonthly = m['H(i)_m'];
                    daily = totalMonthly ? totalMonthly / daysInMonths[idx] : 5.5;
                }
                return Math.round(daily * 100) / 100;
            });

            // Find critical and max months
            let minHsp = Infinity;
            let critIndex = 0;
            let maxHsp = -Infinity;
            let maxIndex = 0;

            monthlyHsp.forEach((v, i) => {
                if (v < minHsp) { minHsp = v; critIndex = i; }
                if (v > maxHsp) { maxHsp = v; maxIndex = i; }
            });

            const annualHsp = Math.round((monthlyHsp.reduce((a, b) => a + b, 0) / 12) * 100) / 100;

            const monthNames = (typeof SOLAR_DB !== 'undefined' && SOLAR_DB.monthNames)
                ? SOLAR_DB.monthNames
                : ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

            const result = {
                source: 'PVGIS (Comisión Europea · En Vivo)',
                provider: 'pvgis',
                isFallback: false,
                isCached: false,
                queryDate: new Date().toISOString().split('T')[0],
                lat,
                lon,
                tilt: optimalTilt,
                azimuth: optimalAzimuth,
                arrayType: 0,
                losses: 0,
                annualHsp,
                criticalMonthHsp: minHsp,
                criticalMonthIndex: critIndex,
                criticalMonthName: monthNames[critIndex],
                maxMonthHsp: maxHsp,
                maxMonthIndex: maxIndex,
                maxMonthName: monthNames[maxIndex],
                monthlyHsp,
                rawOutputs: data.outputs
            };

            // Save to Session Cache
            try {
                sessionStorage.setItem(cacheKey, JSON.stringify(result));
            } catch (e) {
                console.warn('No se pudo guardar en sessionStorage:', e);
            }

            return result;
        }

        // 3. Contingency with realistic PVGIS precomputed data
        console.warn('Activando contingencia local con perfil PVGIS para ubicación');
        const monthNames = (typeof SOLAR_DB !== 'undefined' && SOLAR_DB.monthNames)
            ? SOLAR_DB.monthNames
            : ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

        // Documented PVGIS optimal values for Colombian locations
        let pvgisProfile = {
            tilt: 13,
            azimuth: 9,
            monthlyHsp: [6.44, 6.91, 6.89, 6.61, 6.14, 6.18, 6.42, 6.58, 6.51, 5.97, 5.75, 6.08]
        };

        if (Math.abs(lat - 11.24) < 0.5) { // Santa Marta
            pvgisProfile = { tilt: 15, azimuth: -18, monthlyHsp: [6.80, 7.09, 6.85, 6.27, 5.64, 5.48, 5.59, 5.57, 5.64, 5.57, 5.80, 6.31] };
        } else if (Math.abs(lat - 10.96) < 0.5) { // Barranquilla
            pvgisProfile = { tilt: 14, azimuth: -10, monthlyHsp: [6.83, 7.06, 6.62, 5.89, 5.20, 5.19, 5.48, 5.31, 5.21, 4.96, 5.31, 6.24] };
        } else if (Math.abs(lat - 6.25) < 0.5) { // Medellín
            pvgisProfile = { tilt: 5, azimuth: -4, monthlyHsp: [5.20, 5.33, 5.07, 5.02, 5.03, 5.27, 5.52, 5.53, 5.46, 5.00, 4.86, 5.01] };
        } else if (Math.abs(lat - 4.71) < 0.5) { // Bogotá
            pvgisProfile = { tilt: 6, azimuth: -24, monthlyHsp: [5.37, 5.14, 4.48, 4.24, 4.26, 4.48, 4.62, 4.55, 4.50, 4.46, 4.41, 4.94] };
        }

        const mHsp = [...pvgisProfile.monthlyHsp];
        let minH = Infinity, critIdx = 0, maxH = -Infinity, maxIdx = 0;
        mHsp.forEach((v, i) => {
            if (v < minH) { minH = v; critIdx = i; }
            if (v > maxH) { maxH = v; maxIdx = i; }
        });

        const annHsp = Math.round((mHsp.reduce((a, b) => a + b, 0) / 12) * 100) / 100;

        return {
            source: 'PVGIS (Perfil Local Documentado · Contingencia)',
            provider: 'pvgis',
            isFallback: true,
            isCached: false,
            fallbackReason: 'Sin conexión directa a PVGIS',
            queryDate: new Date().toISOString().split('T')[0],
            lat,
            lon,
            tilt: pvgisProfile.tilt,
            azimuth: pvgisProfile.azimuth,
            arrayType: 0,
            losses: 0,
            annualHsp: annHsp,
            criticalMonthHsp: minH,
            criticalMonthIndex: critIdx,
            criticalMonthName: monthNames[critIdx],
            maxMonthHsp: maxH,
            maxMonthIndex: maxIdx,
            maxMonthName: monthNames[maxIdx],
            monthlyHsp: mHsp
        };
    }
};

window.PVGIS_SERVICE = PVGIS_SERVICE;
