/**
 * api/pvgis.js — Vercel Serverless Function Proxy for European Commission PVGIS API
 * 
 * Soluciona el problema de CORS y políticas de seguridad en Vercel:
 * 1. Ejecuta la petición desde el backend de Vercel (servidor Node.js), evitando restricciones de CORS del navegador.
 * 2. Emite la cabecera User-Agent requerida por los servidores de PVGIS de la Comisión Europea.
 * 3. Añade cabeceras CORS permisivas (Access-Control-Allow-Origin: *) para el frontend.
 * 4. Aplica caché en el Edge (s-maxage=86400) para acelerar consultas repetidas y evitar sobrecargar la API.
 */

async function handler(req, res) {
    // Cabeceras CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.statusCode = 200;
        res.end();
        return;
    }

    // Extraer lat y lon
    let lat = req.query && req.query.lat;
    let lon = req.query && req.query.lon;

    if (!lat || !lon) {
        try {
            const host = req.headers ? (req.headers.host || 'localhost') : 'localhost';
            const urlObj = new URL(req.url, `https://${host}`);
            lat = lat || urlObj.searchParams.get('lat');
            lon = lon || urlObj.searchParams.get('lon');
        } catch (e) {
            // Ignorar error de parsing
        }
    }

    if (!lat || !lon) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Parámetros "lat" y "lon" son obligatorios.' }));
        return;
    }

    const pvgisUrl = `https://re.jrc.ec.europa.eu/api/v5_2/PVcalc?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&peakpower=1&optimalangles=1&loss=0&outputformat=json`;

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 12000);

        const response = await fetch(pvgisUrl, {
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json'
            }
        });
        clearTimeout(timeout);

        if (!response.ok) {
            res.statusCode = response.status;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                error: `Error de respuesta en la API de PVGIS (${response.status})`,
                statusText: response.statusText
            }));
            return;
        }

        const data = await response.json();

        // Caché en la CDN Edge de Vercel por 24 horas (los datos solares promedio no cambian día a día)
        res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=43200');
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 200;
        res.end(JSON.stringify(data));
    } catch (err) {
        console.error('Error al conectar con PVGIS desde Vercel Serverless:', err);
        res.statusCode = 502;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
            error: 'No se pudo establecer conexión con los servidores de PVGIS (JRC Comisión Europea).',
            details: err.message
        }));
    }
}

module.exports = handler;
module.exports.default = handler;
