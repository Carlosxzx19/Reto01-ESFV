/* ═══════════════════════════════════════════════
   solar_db.js — Local Solar Resource Database (Level 1)
   Documented cases for offline contingency and reproducibility
   ═══════════════════════════════════════════════ */

const SOLAR_DB = {
    locations: [
        {
            id: 'san-andres',
            name: 'Escenario Grupo A: San Andrés (Insular)',
            shortName: 'Grupo A (San Andrés)',
            department: 'Archipiélago de San Andrés, Providencia y Santa Catalina',
            lat: 12.58,
            lon: -81.70,
            tilt: 13,
            azimuth: 0,
            annualHsp: 5.32,
            criticalMonthHsp: 4.75,
            criticalMonthIndex: 10, // Noviembre (0-indexed)
            criticalMonthName: 'Noviembre',
            maxMonthHsp: 6.15,
            maxMonthIndex: 2, // Marzo
            maxMonthName: 'Marzo',
            monthlyHsp: [5.25, 5.70, 6.15, 5.95, 5.40, 5.10, 5.30, 5.35, 5.15, 4.80, 4.75, 4.90],
            tmin: 22.0,
            tambOp: 31.0,
            source: 'PVGIS-SARAH2 / IDEAM Insular (Contingencia Local Certificada)',
            consultationDate: '2026-10-27',
            notes: 'Vivienda Residencial San Andrés (12.58° N, 81.70° O). Segunda fuente NASA POWER: 5.48 kWh/m²·día (|Δ| = 3.01% <= ±15%).'
        },
        {
            id: 'nazareth-guajira',
            name: '(Referencia)',
            shortName: '(Referencia)',
            department: 'La Guajira',
            lat: 12.18,
            lon: -71.28,
            tilt: 12,
            azimuth: 180,
            annualHsp: 5.8,
            criticalMonthHsp: 5.2,
            criticalMonthIndex: 9, // Octubre (0-indexed)
            criticalMonthName: 'Octubre',
            maxMonthHsp: 6.6,
            maxMonthIndex: 2, // Marzo
            maxMonthName: 'Marzo',
            monthlyHsp: [6.10, 6.50, 6.60, 6.20, 5.60, 5.50, 5.70, 5.60, 5.30, 5.20, 5.40, 5.90],
            tmin: 20.0,
            tambOp: 32.0,
            source: 'IDEAM / Atlas de Radiación Solar & Caso Prueba Reto 02',
            consultationDate: '2026-09-20',
            notes: 'Estación de monitoreo ambiental Nazareth — Alta Guajira.'
        },
        {
            id: 'santa-marta',
            name: 'Caso 1',
            shortName: 'Caso 1',
            department: 'Magdalena',
            lat: 11.24,
            lon: -74.20,
            tilt: 11,
            azimuth: 180,
            annualHsp: 5.4,
            criticalMonthHsp: 4.8,
            criticalMonthIndex: 9,
            criticalMonthName: 'Octubre',
            monthlyHsp: [5.7, 5.9, 5.8, 5.5, 5.2, 5.3, 5.6, 5.4, 4.9, 4.8, 5.0, 5.5],
            tmin: 22.5,
            tambOp: 29.0,
            source: 'IDEAM / NREL NSRDB Colombia',
            consultationDate: '2026-09-20',
            notes: 'Zona costera caribeña con alto recurso durante el primer trimestre.'
        },
        {
            id: 'caso-2',
            name: 'Caso 2',
            shortName: 'Caso 2',
            department: 'Meta',
            lat: 4.127197,
            lon: -73.636011,
            tilt: 4,
            azimuth: 180,
            annualHsp: 2.52,
            criticalMonthHsp: 2.33,
            criticalMonthIndex: 11,
            criticalMonthName: 'Diciembre',
            monthlyHsp: [2.34, 2.59, 2.65, 2.65, 2.61, 2.42, 2.43, 2.52, 2.49, 2.63, 2.55, 2.33],
            tmin: 11.9,
            tambOp: 19.1,
            source: 'PVGIS (Villavicencio)',
            consultationDate: '2026-10-04',
            notes: 'Local Comercial - Villavicencio, Meta.'
        },
        {
            id: 'caso-3',
            name: 'Caso 3',
            shortName: 'Caso 3',
            department: 'Cundinamarca',
            lat: 4.669660,
            lon: -74.119860,
            tilt: 6,
            azimuth: -25,
            annualHsp: 4.54,
            criticalMonthHsp: 3.99,
            criticalMonthIndex: 3,
            criticalMonthName: 'Abril',
            monthlyHsp: [5.31, 5.20, 4.44, 3.99, 4.10, 4.41, 4.47, 4.44, 4.41, 4.42, 4.38, 4.91],
            tmin: 9.6,
            tambOp: 18.9,
            source: 'PVGIS (Bogotá D. C.)',
            consultationDate: '2026-10-04',
            notes: 'Casa familiar de siete personas - Bogotá D. C.'
        },
        {
            id: 'bogota',
            name: 'Caso 4',
            shortName: 'Caso 4',
            department: 'Cundinamarca',
            lat: 4.71,
            lon: -74.07,
            tilt: 10,
            azimuth: 180,
            annualHsp: 4.2,
            criticalMonthHsp: 3.7,
            criticalMonthIndex: 3,
            criticalMonthName: 'Abril',
            monthlyHsp: [4.5, 4.4, 4.0, 3.7, 3.8, 4.1, 4.4, 4.5, 4.3, 3.9, 4.0, 4.3],
            tmin: 6.0,
            tambOp: 14.5,
            source: 'IDEAM / Estación El Dorado',
            consultationDate: '2026-09-20',
            notes: 'Sabana de Bogotá a 2600 msnm. Menor temperatura ambiental.'
        }
    ],

    monthNames: [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ],

    /** Try loading external JSON, fallback to embedded array */
    async init() {
        try {
            const resp = await fetch('data/solar_locations.json');
            if (resp.ok) {
                const data = await resp.json();
                if (Array.isArray(data) && data.length > 0) {
                    this.locations = data;
                }
            }
        } catch (e) {
            console.info('Usando base local de radiación pre-embebida (modo sin servidor web)');
        }
    },

    getAll() {
        return this.locations;
    },

    getById(id) {
        return this.locations.find(loc => loc.id === id || (id === 'caso-estandar' && loc.id === 'nazareth-guajira')) || this.locations[0];
    },

    getStandardTestCase() {
        return this.locations[0];
    },

    /** Find closest location by Euclidean distance */
    findNearest(lat, lon) {
        let nearest = this.locations[0];
        let minDist = Infinity;
        for (const loc of this.locations) {
            const d = Math.hypot(loc.lat - lat, loc.lon - lon);
            if (d < minDist) {
                minDist = d;
                nearest = loc;
            }
        }
        return nearest;
    }
};

window.SOLAR_DB = SOLAR_DB;
