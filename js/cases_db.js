/* ═══════════════════════════════════════════════
   cases_db.js — Example Cases Database & Manager (Reto 01 & Reto 02)
   Provides curated test cases with verified demand profiles and certified fixed solar resources.
   ═══════════════════════════════════════════════ */

const CASES_DB = {
    cases: {
        'caso-grupo-a': {
            id: 'caso-grupo-a',
            name: 'Escenario Grupo A: Vivienda Residencial en San Andrés (Región Insular)',
            shortName: 'Grupo A (San Andrés)',
            description: 'Vivienda Residencial On-Grid - San Andrés (12.58° N, 81.70° O)',
            isPreset: true,
            isPlaceholder: false,
            lockedModule: false,
            selectedModuleId: 'panel-550w',

            // Reto 01: Información del Proyecto
            project: {
                name: 'Vivienda Residencial San Andrés - Grupo A',
                id: 'PV-SANANDRES-01',
                members: 'Grupo A · Energía Solar Fotovoltaica 2026-II',
                date: '2026-10-27',
                installationType: 'residential', // Restricción: Tensión máx. 600 V
                systemType: 'on-grid' // On-grid, sin almacenamiento
            },

            // Reto 01: Configuración Día / Noche y Tarifaria
            config: {
                dayStart: 6,
                dayEnd: 18,
                daysPerMonth: 30,
                monthsPerYear: 12,
                unitCost: 1200 // CU = 1 200 $/kWh, 365 días/año
            },

            // Reto 01: 8 Cargas Oficiales del Grupo A (TdR Reto 04)
            loads: [
                {
                    id: 'ga-1',
                    description: 'Aire acondicionado inverter 12 000 BTU/h',
                    quantity: 1,
                    power: 900,
                    timeSlots: [{ start: 14, end: 17 }, { start: 22, end: 4 }],
                    hours: [14, 15, 16, 22, 23, 0, 1, 2, 3],
                    hoursPerDay: 9,
                    timeDisplay: '14:00–17:00 y 22:00–04:00 (cruza medianoche)',
                    daysPerMonth: 30,
                    monthsPerYear: 12
                },
                {
                    id: 'ga-2',
                    description: 'Bomba de cisterna 0,5 HP',
                    quantity: 1,
                    power: 600,
                    timeSlots: [{ start: 6, end: 7 }, { start: 17, end: 18 }],
                    hours: [6, 17],
                    hoursPerDay: 2,
                    timeDisplay: '06:00–07:00 y 17:00–18:00',
                    daysPerMonth: 30,
                    monthsPerYear: 12
                },
                {
                    id: 'ga-3',
                    description: 'Nevera',
                    quantity: 1,
                    power: 150,
                    timeSlots: [{ start: 8, end: 12 }, { start: 18, end: 22 }],
                    hours: [8, 9, 10, 11, 18, 19, 20, 21],
                    hoursPerDay: 8,
                    timeDisplay: '08:00–12:00 y 18:00–22:00',
                    daysPerMonth: 30,
                    monthsPerYear: 12
                },
                {
                    id: 'ga-4',
                    description: 'Iluminación LED',
                    quantity: 8,
                    power: 10,
                    timeSlots: [{ start: 18, end: 23 }],
                    hours: [18, 19, 20, 21, 22],
                    hoursPerDay: 5,
                    timeDisplay: '18:00–23:00',
                    daysPerMonth: 30,
                    monthsPerYear: 12
                },
                {
                    id: 'ga-5',
                    description: 'Ventiladores',
                    quantity: 3,
                    power: 45,
                    timeSlots: [{ start: 18, end: 23 }],
                    hours: [18, 19, 20, 21, 22],
                    hoursPerDay: 5,
                    timeDisplay: '18:00–23:00',
                    daysPerMonth: 30,
                    monthsPerYear: 12
                },
                {
                    id: 'ga-6',
                    description: 'Televisor',
                    quantity: 1,
                    power: 100,
                    timeSlots: [{ start: 19, end: 23 }],
                    hours: [19, 20, 21, 22],
                    hoursPerDay: 4,
                    timeDisplay: '19:00–23:00',
                    daysPerMonth: 30,
                    monthsPerYear: 12
                },
                {
                    id: 'ga-7',
                    description: 'Computador portátil',
                    quantity: 1,
                    power: 65,
                    timeSlots: [{ start: 8, end: 12 }, { start: 15, end: 17 }],
                    hours: [8, 9, 10, 11, 15, 16],
                    hoursPerDay: 6,
                    timeDisplay: '08:00–12:00 y 15:00–17:00',
                    daysPerMonth: 30,
                    monthsPerYear: 12
                },
                {
                    id: 'ga-8',
                    description: 'Lavadora',
                    quantity: 1,
                    power: 500,
                    timeSlots: [{ start: 9, end: 10 }],
                    hours: [9],
                    hoursPerDay: 1,
                    timeDisplay: '09:00–10:00',
                    daysPerMonth: 30,
                    monthsPerYear: 12
                }
            ],

            // Reto 02: Dimensionamiento San Andrés (12.58° N, 81.70° O)
            sizing: {
                lat: 12.58,
                lon: -81.70,
                tilt: 13,
                azimuth: 0,
                arrayType: 0,
                losses: 0,
                tmin: 22.0,
                tambOp: 31.0,
                vmaxSystem: 600,
                solarProvider: 'pvgis',
                availableArea: 30,
                pr: 0.75,
                selectedModuleId: 'panel-550w',
                lockedModule: false,
                solarResource: {
                    source: 'PVGIS-SARAH2 / Local Certificado (San Andrés, Insular)',
                    isFixedCase: true,
                    isFallback: false,
                    isCached: true,
                    lat: 12.58,
                    lon: -81.70,
                    tilt: 13,
                    azimuth: 0,
                    annualHsp: 5.32,
                    criticalMonthHsp: 4.75,
                    criticalMonthIndex: 10, // Noviembre
                    criticalMonthName: 'Noviembre',
                    maxMonthHsp: 6.15,
                    maxMonthIndex: 2, // Marzo
                    maxMonthName: 'Marzo',
                    monthlyHsp: [5.25, 5.70, 6.15, 5.95, 5.40, 5.10, 5.30, 5.35, 5.15, 4.80, 4.75, 4.90],
                    notes: 'Irradiación oficial Grupo A: 5.32 kWh/m²·día anual, 4.75 kWh/m²·día mes crítico (Noviembre). Segunda fuente NASA POWER: 5.48 kWh/m²·día (|Δ| = 3.01% <= ±15%).'
                }
            },

            // Reto 03: Conversión On-Grid (Sin almacenamiento)
            conversion: {
                branch: 'grid',
                vbus: 48,
                invEff: 95,
                autonomyDays: 2.0,
                designDod: 50,
                tempFactor: 1.0,
                selectedBatteryId: 'BAT-AGM-200',
                selectedControllerId: 'CTRL-A',
                selectedInverterId: 'INV-1'
            }
        },

        'caso-estandar': {
            id: 'caso-estandar',
            name: 'Caso Estándar: Estación de Monitoreo Ambiental de la Alta Guajira',
            shortName: 'Caso Estándar',
            description: 'Estación de Monitoreo - Nazareth, Alta Guajira (12.18° N, 71.28° O)',
            isPreset: true,
            isPlaceholder: false,
            lockedModule: true,
            selectedModuleId: 'panel-estandar',

            // Reto 01: Información del Proyecto
            project: {
                name: 'Estación de Monitoreo Ambiental de la Alta Guajira',
                id: 'EMA-GUAJIRA-01',
                members: 'Caso Estándar de Referencia (Reto 01 & Reto 02)',
                date: '2026-08-30',
                installationType: 'residential', // Restricción: Tensión máx. 600 V
                systemType: 'off-grid' // Aislado
            },

            // Reto 01: Configuración Día / Noche y Tarifaria
            config: {
                dayStart: 6,
                dayEnd: 18,
                daysPerMonth: 30,
                monthsPerYear: 12,
                unitCost: 1200 // Resulta en Costo diario: $9,096 COP, Costo mensual: $272,800 COP, Costo anual: $3,274,560 COP
            },

            // Reto 01: 8 Cargas del Caso de Prueba (Apéndice B.1)
            loads: [
                {
                    id: 'std-1',
                    description: 'Sensor meteorológico',
                    quantity: 1,
                    power: 15,
                    timeSlots: [{ start: 0, end: 0 }],
                    hours: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
                    daysPerMonth: 30,
                    monthsPerYear: 12
                },
                {
                    id: 'std-2',
                    description: 'Datalogger',
                    quantity: 1,
                    power: 25,
                    timeSlots: [{ start: 0, end: 0 }],
                    hours: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
                    daysPerMonth: 30,
                    monthsPerYear: 12
                },
                {
                    id: 'std-3',
                    description: 'Computador portátil',
                    quantity: 1,
                    power: 350,
                    timeSlots: [{ start: 8, end: 12 }, { start: 14, end: 17 }],
                    hours: [8, 9, 10, 11, 14, 15, 16],
                    daysPerMonth: 30,
                    monthsPerYear: 12
                },
                {
                    id: 'std-4',
                    description: 'Radio VHF',
                    quantity: 1,
                    power: 120,
                    timeSlots: [{ start: 7, end: 9 }, { start: 16, end: 18 }],
                    hours: [7, 8, 16, 17],
                    daysPerMonth: 30,
                    monthsPerYear: 12
                },
                {
                    id: 'std-5',
                    description: 'Iluminación LED exterior',
                    quantity: 2,
                    power: 60,
                    timeSlots: [{ start: 18, end: 6 }],
                    hours: [18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5],
                    daysPerMonth: 30,
                    monthsPerYear: 12
                },
                {
                    id: 'std-6',
                    description: 'Ventilador de gabinete',
                    quantity: 1,
                    power: 45,
                    timeSlots: [{ start: 10, end: 16 }],
                    hours: [10, 11, 12, 13, 14, 15],
                    daysPerMonth: 30,
                    monthsPerYear: 12
                },
                {
                    id: 'std-7',
                    description: 'Cargador de baterías portátiles',
                    quantity: 1,
                    power: 80,
                    timeSlots: [{ start: 22, end: 4 }],
                    hours: [22, 23, 0, 1, 2, 3],
                    daysPerMonth: 30,
                    monthsPerYear: 12
                },
                {
                    id: 'std-8',
                    description: 'Bomba de agua',
                    quantity: 1,
                    power: 750,
                    timeSlots: [{ start: 6, end: 7 }, { start: 17, end: 18 }],
                    hours: [6, 17],
                    daysPerMonth: 30,
                    monthsPerYear: 12
                }
            ],

            // Reto 02: Parámetros del Caso Estándar Oficial
            sizing: {
                lat: 12.18,
                lon: -71.28,
                tilt: 12,
                azimuth: 0,
                arrayType: 0,
                losses: 0,
                tmin: 20,
                tambOp: 32,
                vmaxSystem: 600,
                solarProvider: 'pvgis',
                availableArea: 20,
                pr: 0.70,
                selectedModuleId: 'panel-estandar',
                lockedModule: true,
                solarResource: {
                    source: 'Caso Estándar Declarado (Nazareth, Alta Guajira)',
                    isFixedCase: true,
                    isFallback: false,
                    isCached: true,
                    lat: 12.18,
                    lon: -71.28,
                    tilt: 12,
                    azimuth: 0,
                    annualHsp: 5.80,
                    criticalMonthHsp: 5.20,
                    criticalMonthIndex: 10, // Noviembre
                    criticalMonthName: 'Noviembre',
                    maxMonthHsp: 6.30,
                    maxMonthIndex: 2, // Marzo
                    maxMonthName: 'Marzo',
                    monthlyHsp: [5.80, 6.10, 6.30, 6.00, 5.70, 5.60, 5.80, 5.90, 6.00, 5.40, 5.20, 5.80],
                    notes: 'Irradiación declarada oficial del caso de prueba: 5.8 kWh/m²·día anual, 5.2 kWh/m²·día mes crítico.'
                }
            }
        },

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
            name: 'Caso 2: Local Comercial - Villavicencio, Meta',
            shortName: 'Caso 2',
            description: 'Local Comercial - Villavicencio (4.127197°, -73.636011°)',
            isPreset: true,
            isPlaceholder: false,

            // Reto 01: Información del Proyecto
            project: {
                name: 'Local Comercial - Villavicencio, Meta',
                id: 'C-2',
                members: 'Carlos Forero, Sebastián Martínez, Esteban Romero, Mario Celedón',
                date: '2026-10-04',
                installationType: 'residential',
                systemType: 'hybrid-on-grid'
            },

            // Reto 01: Configuración Día / Noche y Tarifaria
            config: {
                dayStart: 6,
                dayEnd: 18, // Inicio de la noche: 18:00
                daysPerMonth: 30,
                monthsPerYear: 12,
                unitCost: 1000 // 1000 COP/kWh
            },

            // Reto 01: 15 Cargas del Caso 2
            loads: [
                {
                    id: 'c2-1',
                    description: 'Neveras exhibidoras de bebidas',
                    quantity: 2,
                    power: 350,
                    timeSlots: [{ start: 0, end: 0 }],
                    hours: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
                    hoursPerDay: 10.0,
                    timeDisplay: '00:00–24:00',
                    daysPerMonth: 30,
                    monthsPerYear: 12
                },
                {
                    id: 'c2-2',
                    description: 'Congelador de helados',
                    quantity: 1,
                    power: 250,
                    timeSlots: [{ start: 0, end: 0 }],
                    hours: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
                    hoursPerDay: 10.0,
                    timeDisplay: '00:00–24:00',
                    daysPerMonth: 30,
                    monthsPerYear: 12
                },
                {
                    id: 'c2-3',
                    description: 'Congelador de alimentos',
                    quantity: 1,
                    power: 300,
                    timeSlots: [{ start: 0, end: 0 }],
                    hours: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
                    hoursPerDay: 12.0,
                    timeDisplay: '00:00–24:00',
                    daysPerMonth: 30,
                    monthsPerYear: 12
                },
                {
                    id: 'c2-4',
                    description: 'Vitrina refrigerada de lácteos',
                    quantity: 1,
                    power: 400,
                    timeSlots: [{ start: 0, end: 0 }],
                    hours: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
                    hoursPerDay: 12.0,
                    timeDisplay: '00:00–24:00',
                    daysPerMonth: 30,
                    monthsPerYear: 12
                },
                {
                    id: 'c2-5',
                    description: 'Luces LED de local',
                    quantity: 10,
                    power: 18,
                    timeSlots: [{ start: 7, end: 21 }],
                    hours: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
                    hoursPerDay: 14.0,
                    timeDisplay: '07:00–21:00',
                    daysPerMonth: 30,
                    monthsPerYear: 12
                },
                {
                    id: 'c2-6',
                    description: 'Aviso luminoso LED',
                    quantity: 1,
                    power: 60,
                    timeSlots: [{ start: 18, end: 22 }],
                    hours: [18, 19, 20, 21],
                    hoursPerDay: 4.0,
                    timeDisplay: '18:00–22:00',
                    daysPerMonth: 30,
                    monthsPerYear: 12
                },
                {
                    id: 'c2-7',
                    description: 'Ventiladores',
                    quantity: 3,
                    power: 75,
                    timeSlots: [{ start: 10, end: 20 }],
                    hours: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
                    hoursPerDay: 10.0,
                    timeDisplay: '10:00–20:00',
                    daysPerMonth: 30,
                    monthsPerYear: 12
                },
                {
                    id: 'c2-8',
                    description: 'Terminal de venta',
                    quantity: 1,
                    power: 100,
                    timeSlots: [{ start: 7, end: 21 }],
                    hours: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
                    hoursPerDay: 14.0,
                    timeDisplay: '07:00–21:00',
                    daysPerMonth: 30,
                    monthsPerYear: 12
                },
                {
                    id: 'c2-9',
                    description: 'Router y datáfono',
                    quantity: 1,
                    power: 25,
                    timeSlots: [{ start: 0, end: 0 }],
                    hours: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
                    hoursPerDay: 24.0,
                    timeDisplay: '00:00–24:00',
                    daysPerMonth: 30,
                    monthsPerYear: 12
                },
                {
                    id: 'c2-10',
                    description: 'Cámaras y grabador',
                    quantity: 1,
                    power: 50,
                    timeSlots: [{ start: 0, end: 0 }],
                    hours: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
                    hoursPerDay: 24.0,
                    timeDisplay: '00:00–24:00',
                    daysPerMonth: 30,
                    monthsPerYear: 12
                },
                {
                    id: 'c2-11',
                    description: 'Báscula electrónica',
                    quantity: 1,
                    power: 15,
                    timeSlots: [{ start: 7, end: 21 }],
                    hours: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
                    hoursPerDay: 14.0,
                    timeDisplay: '07:00–21:00',
                    daysPerMonth: 30,
                    monthsPerYear: 12
                },
                {
                    id: 'c2-12',
                    description: 'Microondas',
                    quantity: 1,
                    power: 1200,
                    timeSlots: [{ start: 12, end: 13 }],
                    hours: [12],
                    hoursPerDay: 0.5,
                    timeDisplay: '12:00–12:30',
                    daysPerMonth: 30,
                    monthsPerYear: 12
                },
                {
                    id: 'c2-13',
                    description: 'Cafetera',
                    quantity: 1,
                    power: 800,
                    timeSlots: [{ start: 7, end: 8 }],
                    hours: [7],
                    hoursPerDay: 1.0,
                    timeDisplay: '07:00–08:00',
                    daysPerMonth: 30,
                    monthsPerYear: 12
                },
                {
                    id: 'c2-14',
                    description: 'Selladora de bolsas',
                    quantity: 1,
                    power: 300,
                    timeSlots: [{ start: 14, end: 15 }],
                    hours: [14],
                    hoursPerDay: 0.5,
                    timeDisplay: '14:00–14:30',
                    daysPerMonth: 26,
                    monthsPerYear: 12
                },
                {
                    id: 'c2-15',
                    description: 'Cargadores de celulares',
                    quantity: 3,
                    power: 10,
                    timeSlots: [{ start: 18, end: 20 }],
                    hours: [18, 19],
                    hoursPerDay: 2.0,
                    timeDisplay: '18:00–20:00',
                    daysPerMonth: 30,
                    monthsPerYear: 12
                }
            ],

            // Reto 02: Dimensionamiento con Parámetros Fijos Certificados (PVGIS Villavicencio)
            sizing: {
                lat: 4.127197,
                lon: -73.636011,
                tilt: 4,
                azimuth: 180,
                arrayType: 0,
                losses: 0,
                tmin: 11.9,
                tambOp: 19.1,
                vmaxSystem: 600,
                solarProvider: 'pvgis',
                availableArea: 100,
                pr: 0.80,
                solarResource: {
                    source: 'PVGIS (Villavicencio - Certificado Fijo)',
                    isFixedCase: true,
                    isFallback: false,
                    isCached: true,
                    lat: 4.127197,
                    lon: -73.636011,
                    tilt: 4,
                    azimuth: 180,
                    annualHsp: 2.52,
                    criticalMonthHsp: 2.33,
                    criticalMonthIndex: 11, // Diciembre
                    criticalMonthName: 'Diciembre',
                    maxMonthHsp: 2.65,
                    maxMonthIndex: 2, // Marzo
                    maxMonthName: 'Marzo',
                    monthlyHsp: [2.34, 2.59, 2.65, 2.65, 2.61, 2.42, 2.43, 2.52, 2.49, 2.63, 2.55, 2.33],
                    notes: 'Recurso solar promedio PVGIS para Villavicencio (4.127197°, -73.636011°). Datos fijos de caso de estudio.'
                }
            }
        },

        'caso-3': {
            id: 'caso-3',
            name: 'Caso 3: Casa familiar de siete personas - Bogotá D. C.',
            shortName: 'Caso 3',
            description: 'Casa familiar de siete personas - Bogotá D. C. (4.669660°, -74.119860°)',
            isPreset: true,
            isPlaceholder: false,

            // Reto 01: Información del Proyecto
            project: {
                name: 'Casa familiar de siete personas',
                id: 'C-3',
                members: 'Carlos Forero, Sebastián Martínez, Esteban Romero, Mario Celedón',
                date: '2026-10-04',
                installationType: 'residential',
                systemType: 'hybrid-on-grid'
            },

            // Reto 01: Configuración Día / Noche y Tarifaria
            config: {
                dayStart: 6,
                dayEnd: 16, // Inicio de la noche: 16:00
                daysPerMonth: 30,
                monthsPerYear: 12,
                unitCost: 850 // 850 COP/kWh
            },

            // Reto 01: 17 Cargas del Caso 3
            loads: [
                {
                    id: 'c3-1',
                    description: 'Refrigerador familiar',
                    quantity: 1,
                    power: 180,
                    timeSlots: [{ start: 0, end: 0 }],
                    hours: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
                    hoursPerDay: 8.0,
                    timeDisplay: '00:00–24:00',
                    daysPerMonth: 30,
                    monthsPerYear: 12
                },
                {
                    id: 'c3-2',
                    description: 'Congelador pequeño',
                    quantity: 1,
                    power: 120,
                    timeSlots: [{ start: 0, end: 0 }],
                    hours: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
                    hoursPerDay: 6.0,
                    timeDisplay: '00:00–24:00',
                    daysPerMonth: 30,
                    monthsPerYear: 12
                },
                {
                    id: 'c3-3',
                    description: 'Luces LED interiores',
                    quantity: 14,
                    power: 9,
                    timeSlots: [{ start: 5, end: 6 }, { start: 18, end: 22 }],
                    hours: [5, 18, 19, 20, 21],
                    hoursPerDay: 5.0,
                    timeDisplay: '05:00–06:00, 18:00–22:00',
                    daysPerMonth: 30,
                    monthsPerYear: 12
                },
                {
                    id: 'c3-4',
                    description: 'Luces exteriores',
                    quantity: 3,
                    power: 12,
                    timeSlots: [{ start: 0, end: 5 }, { start: 18, end: 0 }],
                    hours: [0, 1, 2, 3, 4, 18, 19, 20, 21, 22, 23],
                    hoursPerDay: 12.0,
                    timeDisplay: '00:00–05:00, 18:00–24:00',
                    daysPerMonth: 30,
                    monthsPerYear: 12
                },
                {
                    id: 'c3-5',
                    description: 'Televisores LED',
                    quantity: 2,
                    power: 100,
                    timeSlots: [{ start: 18, end: 22 }],
                    hours: [18, 19, 20, 21],
                    hoursPerDay: 4.0,
                    timeDisplay: '18:00–22:00',
                    daysPerMonth: 30,
                    monthsPerYear: 12
                },
                {
                    id: 'c3-6',
                    description: 'Computadores portátiles',
                    quantity: 3,
                    power: 65,
                    timeSlots: [{ start: 18, end: 22 }],
                    hours: [18, 19, 20, 21],
                    hoursPerDay: 4.0,
                    timeDisplay: '18:00–22:00',
                    daysPerMonth: 30,
                    monthsPerYear: 12
                },
                {
                    id: 'c3-7',
                    description: 'Router Wi-Fi',
                    quantity: 1,
                    power: 15,
                    timeSlots: [{ start: 0, end: 0 }],
                    hours: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
                    hoursPerDay: 24.0,
                    timeDisplay: '00:00–24:00',
                    daysPerMonth: 30,
                    monthsPerYear: 12
                },
                {
                    id: 'c3-8',
                    description: 'Lavadora',
                    quantity: 1,
                    power: 500,
                    timeSlots: [{ start: 9, end: 10 }],
                    hours: [9],
                    hoursPerDay: 1.0,
                    timeDisplay: '09:00–10:00',
                    daysPerMonth: 16,
                    monthsPerYear: 12
                },
                {
                    id: 'c3-9',
                    description: 'Plancha',
                    quantity: 1,
                    power: 1200,
                    timeSlots: [{ start: 10, end: 11 }],
                    hours: [10],
                    hoursPerDay: 0.5,
                    timeDisplay: '10:00–10:30',
                    daysPerMonth: 12,
                    monthsPerYear: 12
                },
                {
                    id: 'c3-10',
                    description: 'Microondas',
                    quantity: 1,
                    power: 1200,
                    timeSlots: [{ start: 6, end: 7 }],
                    hours: [6],
                    hoursPerDay: 0.5,
                    timeDisplay: '06:00–06:30',
                    daysPerMonth: 30,
                    monthsPerYear: 12
                },
                {
                    id: 'c3-11',
                    description: 'Freidora de aire',
                    quantity: 1,
                    power: 1500,
                    timeSlots: [{ start: 19, end: 20 }],
                    hours: [19],
                    hoursPerDay: 0.5,
                    timeDisplay: '19:00–19:30',
                    daysPerMonth: 20,
                    monthsPerYear: 12
                },
                {
                    id: 'c3-12',
                    description: 'Licuadora',
                    quantity: 1,
                    power: 400,
                    timeSlots: [{ start: 6, end: 7 }],
                    hours: [6],
                    hoursPerDay: 0.5,
                    timeDisplay: '06:30–07:00',
                    daysPerMonth: 30,
                    monthsPerYear: 12
                },
                {
                    id: 'c3-13',
                    description: 'Cafetera',
                    quantity: 1,
                    power: 800,
                    timeSlots: [{ start: 5, end: 6 }],
                    hours: [5],
                    hoursPerDay: 0.5,
                    timeDisplay: '05:30–06:00',
                    daysPerMonth: 30,
                    monthsPerYear: 12
                },
                {
                    id: 'c3-14',
                    description: 'Cargadores de celulares',
                    quantity: 7,
                    power: 10,
                    timeSlots: [{ start: 20, end: 22 }],
                    hours: [20, 21],
                    hoursPerDay: 2.0,
                    timeDisplay: '20:00–22:00',
                    daysPerMonth: 30,
                    monthsPerYear: 12
                },
                {
                    id: 'c3-15',
                    description: 'Bomba de agua',
                    quantity: 1,
                    power: 370,
                    timeSlots: [{ start: 6, end: 7 }],
                    hours: [6],
                    hoursPerDay: 0.5,
                    timeDisplay: '06:30–07:00',
                    daysPerMonth: 30,
                    monthsPerYear: 12
                },
                {
                    id: 'c3-16',
                    description: 'Consola de videojuegos',
                    quantity: 1,
                    power: 120,
                    timeSlots: [{ start: 19, end: 21 }],
                    hours: [19, 20],
                    hoursPerDay: 2.0,
                    timeDisplay: '19:00–21:00',
                    daysPerMonth: 20,
                    monthsPerYear: 12
                },
                {
                    id: 'c3-17',
                    description: 'Aspiradora',
                    quantity: 1,
                    power: 900,
                    timeSlots: [{ start: 11, end: 12 }],
                    hours: [11],
                    hoursPerDay: 0.5,
                    timeDisplay: '11:00–11:30',
                    daysPerMonth: 8,
                    monthsPerYear: 12
                }
            ],

            // Reto 02: Dimensionamiento con Parámetros Fijos Certificados (PVGIS Bogotá)
            sizing: {
                lat: 4.669660,
                lon: -74.119860,
                tilt: 6,
                azimuth: -25,
                arrayType: 0,
                losses: 0,
                tmin: 9.6,
                tambOp: 18.9,
                vmaxSystem: 600,
                solarProvider: 'pvgis',
                availableArea: 80,
                pr: 0.80,
                solarResource: {
                    source: 'PVGIS (Bogotá D. C. - Certificado Fijo)',
                    isFixedCase: true,
                    isFallback: false,
                    isCached: true,
                    lat: 4.669660,
                    lon: -74.119860,
                    tilt: 6,
                    azimuth: -25,
                    annualHsp: 4.54,
                    criticalMonthHsp: 3.99,
                    criticalMonthIndex: 3, // Abril
                    criticalMonthName: 'Abril',
                    maxMonthHsp: 5.31,
                    maxMonthIndex: 0, // Enero
                    maxMonthName: 'Enero',
                    monthlyHsp: [5.31, 5.20, 4.44, 3.99, 4.10, 4.41, 4.47, 4.44, 4.41, 4.42, 4.38, 4.91],
                    notes: 'Recurso solar promedio PVGIS para Bogotá D. C. (4.669660°, -74.119860°). Datos fijos de caso de estudio.'
                }
            }
        },

        'caso-4': {
            id: 'caso-4',
            name: 'Caso 4: Colegio de jornada diurna - Barranquilla',
            shortName: 'Caso 4',
            description: 'Colegio de jornada diurna - Barranquilla, Atlántico (10.932840°, -74.778010°)',
            isPreset: true,
            isPlaceholder: false,

            // Reto 01: Información del Proyecto
            project: {
                name: 'Colegio de jornada diurna',
                id: 'C-4',
                members: 'Carlos Forero, Sebastián Martínez, Esteban Romero, Mario Celedón',
                date: '2026-10-04',
                installationType: 'residential',
                systemType: 'on-grid'
            },

            // Reto 01: Configuración Día / Noche y Tarifaria
            config: {
                dayStart: 6,
                dayEnd: 16, // Inicio de la noche: 16:00
                daysPerMonth: 22,
                monthsPerYear: 10,
                unitCost: 950 // 950 COP/kWh
            },

            // Reto 01: 15 Cargas del Caso 4
            loads: [
                {
                    id: 'c4-1',
                    description: 'Luces LED de aulas',
                    quantity: 48,
                    power: 18,
                    timeSlots: [{ start: 7, end: 15 }],
                    hours: [7, 8, 9, 10, 11, 12, 13, 14],
                    hoursPerDay: 8.0,
                    timeDisplay: '07:00–15:00',
                    daysPerMonth: 22,
                    monthsPerYear: 10
                },
                {
                    id: 'c4-2',
                    description: 'Luces LED de oficinas',
                    quantity: 12,
                    power: 18,
                    timeSlots: [{ start: 7, end: 15 }],
                    hours: [7, 8, 9, 10, 11, 12, 13, 14],
                    hoursPerDay: 8.0,
                    timeDisplay: '07:00–15:00',
                    daysPerMonth: 22,
                    monthsPerYear: 10
                },
                {
                    id: 'c4-3',
                    description: 'Ventiladores de aulas',
                    quantity: 24,
                    power: 70,
                    timeSlots: [{ start: 8, end: 15 }],
                    hours: [8, 9, 10, 11, 12, 13, 14],
                    hoursPerDay: 7.0,
                    timeDisplay: '08:00–15:00',
                    daysPerMonth: 22,
                    monthsPerYear: 10
                },
                {
                    id: 'c4-4',
                    description: 'Aire acondicionado de informática',
                    quantity: 2,
                    power: 1500,
                    timeSlots: [{ start: 8, end: 14 }],
                    hours: [8, 9, 10, 11, 12, 13],
                    hoursPerDay: 6.0,
                    timeDisplay: '08:00–14:00',
                    daysPerMonth: 22,
                    monthsPerYear: 10
                },
                {
                    id: 'c4-5',
                    description: 'Computadores de informática',
                    quantity: 24,
                    power: 180,
                    timeSlots: [{ start: 8, end: 12 }],
                    hours: [8, 9, 10, 11],
                    hoursPerDay: 4.0,
                    timeDisplay: '08:00–12:00',
                    daysPerMonth: 22,
                    monthsPerYear: 10
                },
                {
                    id: 'c4-6',
                    description: 'Computadores administrativos',
                    quantity: 5,
                    power: 150,
                    timeSlots: [{ start: 7, end: 15 }],
                    hours: [7, 8, 9, 10, 11, 12, 13, 14],
                    hoursPerDay: 8.0,
                    timeDisplay: '07:00–15:00',
                    daysPerMonth: 22,
                    monthsPerYear: 10
                },
                {
                    id: 'c4-7',
                    description: 'Videoproyectores',
                    quantity: 4,
                    power: 250,
                    timeSlots: [{ start: 9, end: 12 }],
                    hours: [9, 10, 11],
                    hoursPerDay: 3.0,
                    timeDisplay: '09:00–12:00',
                    daysPerMonth: 22,
                    monthsPerYear: 10
                },
                {
                    id: 'c4-8',
                    description: 'Impresora multifunción',
                    quantity: 1,
                    power: 500,
                    timeSlots: [{ start: 10, end: 11 }],
                    hours: [10],
                    hoursPerDay: 0.5,
                    timeDisplay: '10:00–10:30',
                    daysPerMonth: 22,
                    monthsPerYear: 10
                },
                {
                    id: 'c4-9',
                    description: 'Router y red',
                    quantity: 2,
                    power: 15,
                    timeSlots: [{ start: 6, end: 16 }],
                    hours: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
                    hoursPerDay: 10.0,
                    timeDisplay: '06:00–16:00',
                    daysPerMonth: 22,
                    monthsPerYear: 10
                },
                {
                    id: 'c4-10',
                    description: 'Equipo de sonido',
                    quantity: 1,
                    power: 150,
                    timeSlots: [{ start: 7, end: 8 }],
                    hours: [7],
                    hoursPerDay: 1.0,
                    timeDisplay: '07:00–08:00',
                    daysPerMonth: 22,
                    monthsPerYear: 10
                },
                {
                    id: 'c4-11',
                    description: 'Bomba de agua',
                    quantity: 1,
                    power: 750,
                    timeSlots: [{ start: 6, end: 7 }, { start: 13, end: 14 }],
                    hours: [6, 13],
                    hoursPerDay: 1.0,
                    timeDisplay: '06:00–06:30, 13:00–13:30',
                    daysPerMonth: 22,
                    monthsPerYear: 10
                },
                {
                    id: 'c4-12',
                    description: 'Refrigerador de cafetería',
                    quantity: 1,
                    power: 180,
                    timeSlots: [{ start: 7, end: 15 }],
                    hours: [7, 8, 9, 10, 11, 12, 13, 14],
                    hoursPerDay: 3.0,
                    timeDisplay: '07:00–15:00',
                    daysPerMonth: 22,
                    monthsPerYear: 10
                },
                {
                    id: 'c4-13',
                    description: 'Dispensador de agua fría',
                    quantity: 2,
                    power: 100,
                    timeSlots: [{ start: 7, end: 15 }],
                    hours: [7, 8, 9, 10, 11, 12, 13, 14],
                    hoursPerDay: 2.0,
                    timeDisplay: '07:00–15:00',
                    daysPerMonth: 22,
                    monthsPerYear: 10
                },
                {
                    id: 'c4-14',
                    description: 'Luces exteriores',
                    quantity: 6,
                    power: 20,
                    timeSlots: [{ start: 6, end: 7 }, { start: 18, end: 19 }],
                    hours: [6, 18],
                    hoursPerDay: 2.0,
                    timeDisplay: '06:00–07:00, 18:00–19:00',
                    daysPerMonth: 22,
                    monthsPerYear: 10
                },
                {
                    id: 'c4-15',
                    description: 'Cargadores de portátiles',
                    quantity: 8,
                    power: 65,
                    timeSlots: [{ start: 10, end: 12 }],
                    hours: [10, 11],
                    hoursPerDay: 2.0,
                    timeDisplay: '10:00–12:00',
                    daysPerMonth: 22,
                    monthsPerYear: 10
                }
            ],

            // Reto 02: Dimensionamiento con Parámetros Fijos Certificados (PVGIS Barranquilla)
            sizing: {
                lat: 10.932840,
                lon: -74.778010,
                tilt: 14,
                azimuth: -12,
                arrayType: 0,
                losses: 0,
                tmin: 23.0,
                tambOp: 28.2,
                vmaxSystem: 600,
                solarProvider: 'pvgis',
                availableArea: 250,
                pr: 0.80,
                solarResource: {
                    source: 'PVGIS (Barranquilla - Certificado Fijo)',
                    isFixedCase: true,
                    isFallback: false,
                    isCached: true,
                    lat: 10.932840,
                    lon: -74.778010,
                    tilt: 14,
                    azimuth: -12,
                    annualHsp: 5.72,
                    criticalMonthHsp: 4.87,
                    criticalMonthIndex: 9, // Octubre
                    criticalMonthName: 'Octubre',
                    maxMonthHsp: 7.07,
                    maxMonthIndex: 1, // Febrero
                    maxMonthName: 'Febrero',
                    monthlyHsp: [6.83, 7.07, 6.58, 5.78, 5.14, 5.12, 5.42, 5.25, 5.18, 4.87, 5.20, 6.21],
                    notes: 'Recurso solar promedio PVGIS para Barranquilla (10.932840°, -74.778010°). Datos fijos de caso de estudio.'
                }
            }
        },

        'caso-5': {
            id: 'caso-5',
            name: 'Caso 5: Finca lechera con bombeo - Pasto, Nariño',
            shortName: 'Caso 5',
            description: 'Finca lechera con bombeo - Pasto, Nariño (1.158028°, -77.276472°)',
            isPreset: true,
            isPlaceholder: false,

            // Reto 01: Información del Proyecto
            project: {
                name: 'Finca lechera con bombeo',
                id: 'C-5',
                members: 'Carlos Forero, Sebastián Martínez, Esteban Romero, Mario Celedón',
                date: '2026-10-04',
                installationType: 'residential',
                systemType: 'off-grid'
            },

            // Reto 01: Configuración Día / Noche y Tarifaria
            config: {
                dayStart: 6,
                dayEnd: 16, // Inicio de la noche: 16:00
                daysPerMonth: 30,
                monthsPerYear: 12,
                unitCost: 800 // 800 COP/kWh
            },

            // Reto 01: 15 Cargas del Caso 5
            loads: [
                {
                    id: 'c5-1',
                    description: 'Bomba de vacío de ordeño',
                    quantity: 1,
                    power: 1100,
                    timeSlots: [{ start: 4, end: 5.5 }, { start: 16, end: 17.5 }],
                    hours: [4, 16],
                    hoursPerDay: 3.0,
                    timeDisplay: '04:00–05:30, 16:00–17:30',
                    daysPerMonth: 30,
                    monthsPerYear: 12
                },
                {
                    id: 'c5-2',
                    description: 'Compresor de tanque de leche',
                    quantity: 1,
                    power: 900,
                    timeSlots: [{ start: 0, end: 0 }],
                    hours: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
                    hoursPerDay: 8.0,
                    timeDisplay: '00:00–24:00',
                    daysPerMonth: 30,
                    monthsPerYear: 12
                },
                {
                    id: 'c5-3',
                    description: 'Agitador del tanque de leche',
                    quantity: 1,
                    power: 100,
                    timeSlots: [{ start: 5.5, end: 7.5 }, { start: 17.5, end: 19.5 }],
                    hours: [5, 6, 7, 17, 18, 19],
                    hoursPerDay: 4.0,
                    timeDisplay: '05:30–07:30, 17:30–19:30',
                    daysPerMonth: 30,
                    monthsPerYear: 12
                },
                {
                    id: 'c5-4',
                    description: 'Bomba de pozo',
                    quantity: 1,
                    power: 1500,
                    timeSlots: [{ start: 10, end: 12 }],
                    hours: [10, 11],
                    hoursPerDay: 2.0,
                    timeDisplay: '10:00–12:00',
                    daysPerMonth: 30,
                    monthsPerYear: 12
                },
                {
                    id: 'c5-5',
                    description: 'Bomba de riego',
                    quantity: 1,
                    power: 1100,
                    timeSlots: [{ start: 12, end: 14 }],
                    hours: [12, 13],
                    hoursPerDay: 2.0,
                    timeDisplay: '12:00–14:00',
                    daysPerMonth: 20,
                    monthsPerYear: 8
                },
                {
                    id: 'c5-6',
                    description: 'Luces LED de sala de ordeño',
                    quantity: 8,
                    power: 18,
                    timeSlots: [{ start: 4, end: 6 }, { start: 18, end: 19 }],
                    hours: [4, 5, 18],
                    hoursPerDay: 3.0,
                    timeDisplay: '04:00–06:00, 18:00–19:00',
                    daysPerMonth: 30,
                    monthsPerYear: 12
                },
                {
                    id: 'c5-7',
                    description: 'Luces exteriores',
                    quantity: 4,
                    power: 20,
                    timeSlots: [{ start: 0, end: 6 }, { start: 18, end: 0 }],
                    hours: [0, 1, 2, 3, 4, 5, 18, 19, 20, 21, 22, 23],
                    hoursPerDay: 12.0,
                    timeDisplay: '00:00–06:00, 18:00–24:00',
                    daysPerMonth: 30,
                    monthsPerYear: 12
                },
                {
                    id: 'c5-8',
                    description: 'Cerca eléctrica',
                    quantity: 1,
                    power: 10,
                    timeSlots: [{ start: 0, end: 0 }],
                    hours: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
                    hoursPerDay: 24.0,
                    timeDisplay: '00:00–24:00',
                    daysPerMonth: 30,
                    monthsPerYear: 12
                },
                {
                    id: 'c5-9',
                    description: 'Router de comunicaciones',
                    quantity: 1,
                    power: 15,
                    timeSlots: [{ start: 0, end: 0 }],
                    hours: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
                    hoursPerDay: 24.0,
                    timeDisplay: '00:00–24:00',
                    daysPerMonth: 30,
                    monthsPerYear: 12
                },
                {
                    id: 'c5-10',
                    description: 'Cámaras y grabador',
                    quantity: 1,
                    power: 30,
                    timeSlots: [{ start: 0, end: 0 }],
                    hours: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
                    hoursPerDay: 24.0,
                    timeDisplay: '00:00–24:00',
                    daysPerMonth: 30,
                    monthsPerYear: 12
                },
                {
                    id: 'c5-11',
                    description: 'Hidrolavadora',
                    quantity: 1,
                    power: 1600,
                    timeSlots: [{ start: 8, end: 9 }],
                    hours: [8],
                    hoursPerDay: 0.5,
                    timeDisplay: '08:00–08:30',
                    daysPerMonth: 30,
                    monthsPerYear: 12
                },
                {
                    id: 'c5-12',
                    description: 'Picadora de forraje',
                    quantity: 1,
                    power: 2200,
                    timeSlots: [{ start: 9, end: 10 }],
                    hours: [9],
                    hoursPerDay: 1.0,
                    timeDisplay: '09:00–10:00',
                    daysPerMonth: 26,
                    monthsPerYear: 12
                },
                {
                    id: 'c5-13',
                    description: 'Herramientas eléctricas',
                    quantity: 1,
                    power: 600,
                    timeSlots: [{ start: 14, end: 15 }],
                    hours: [14],
                    hoursPerDay: 0.5,
                    timeDisplay: '14:00–14:30',
                    daysPerMonth: 8,
                    monthsPerYear: 12
                },
                {
                    id: 'c5-14',
                    description: 'Cargadores de celulares',
                    quantity: 3,
                    power: 10,
                    timeSlots: [{ start: 18, end: 20 }],
                    hours: [18, 19],
                    hoursPerDay: 2.0,
                    timeDisplay: '18:00–20:00',
                    daysPerMonth: 30,
                    monthsPerYear: 12
                },
                {
                    id: 'c5-15',
                    description: 'Computador portátil',
                    quantity: 1,
                    power: 65,
                    timeSlots: [{ start: 19, end: 21 }],
                    hours: [19, 20],
                    hoursPerDay: 2.0,
                    timeDisplay: '19:00–21:00',
                    daysPerMonth: 26,
                    monthsPerYear: 12
                }
            ],

            // Reto 02: Dimensionamiento con Parámetros Fijos Certificados (PVGIS Pasto)
            sizing: {
                lat: 1.158028,
                lon: -77.276472,
                tilt: 0,
                azimuth: 0,
                arrayType: 0,
                losses: 0,
                tmin: 6.2,
                tambOp: 13.3,
                vmaxSystem: 600,
                solarProvider: 'pvgis',
                availableArea: 150,
                pr: 0.80,
                solarResource: {
                    source: 'PVGIS (Pasto - Certificado Fijo)',
                    isFixedCase: true,
                    isFallback: false,
                    isCached: true,
                    lat: 1.158028,
                    lon: -77.276472,
                    tilt: 0,
                    azimuth: 0,
                    annualHsp: 4.12,
                    criticalMonthHsp: 3.95,
                    criticalMonthIndex: 2, // Marzo
                    criticalMonthName: 'Marzo',
                    maxMonthHsp: 4.45,
                    maxMonthIndex: 9, // Octubre
                    maxMonthName: 'Octubre',
                    monthlyHsp: [4.13, 4.00, 3.95, 4.10, 4.16, 4.00, 4.06, 4.04, 4.05, 4.45, 4.44, 4.08],
                    notes: 'Recurso solar promedio PVGIS para Pasto, Nariño (1.158028°, -77.276472°). Datos fijos de caso de estudio.'
                }
            }
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
        if (id === 'bogota') id = 'caso-4';
        if (id === 'pasto') id = 'caso-5';
        return this.cases[id] || null;
    },

    getCase(id) {
        return this.getById(id);
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
    if (caseId === 'bogota') caseId = 'caso-4';
    if (caseId === 'pasto') caseId = 'caso-5';

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
        const isActive = (c === caseId) || 
            (caseId === 'caso-estandar' && (c === 'estandar' || c === 'caso-estandar')) ||
            (caseId === 'caso-1' && c === 'santa-marta') || 
            (caseId === 'caso-2' && c === 'barranquilla') || 
            (caseId === 'caso-3' && c === 'medellin') || 
            (caseId === 'caso-4' && c === 'bogota') || 
            (caseId === 'caso-5' && c === 'pasto');
        btn.classList.toggle('active', isActive);
    });

    const s = APP.state.sizing;

    // 2. Manejo de Modo Coordenadas Libres
    if (caseId === 'custom') {
        s.isFixedCase = false;
        s.activeCaseId = 'custom';
        s.lockedModule = false;
        if (s.selectedModuleId === 'panel-estandar') {
            s.selectedModuleId = 'panel-150w';
        }

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

    // 3. Caso Predeterminado
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
        s.lockedModule = !!caseData.sizing.lockedModule;

        if (caseData.sizing.selectedModuleId) {
            s.selectedModuleId = caseData.sizing.selectedModuleId;
        } else if (s.selectedModuleId === 'panel-estandar') {
            s.selectedModuleId = 'panel-150w';
        }

        if (caseData.sizing.availableArea) {
            s.availableArea = caseData.sizing.availableArea;
        }
        if (caseData.sizing.pr) {
            s.pr = caseData.sizing.pr;
        }
        if (caseData.sizing.solarProvider && typeof setSolarProvider === 'function') {
            setSolarProvider(caseData.sizing.solarProvider);
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
            badge.textContent = caseData.id === 'caso-grupo-a'
                ? `🌴 Grupo A · San Andrés Oficial`
                : (caseData.id === 'caso-estandar'
                    ? `⭐ Caso Estándar · Datos Oficiales`
                    : `🔒 ${caseData.shortName} · PVGIS Fijo`);
        }

        // Mostrar banner explicativo
        updateCaseBanner(caseData);

        // E. Cargar Datos del Reto 03: Conversión y Almacenamiento
        if (caseData.conversion && window.APP && APP.state.conversion) {
            APP.state.conversion.branch = caseData.conversion.branch || 'grid';
            if (caseData.conversion.vbus) APP.state.conversion.vbus = caseData.conversion.vbus;
            if (caseData.conversion.selectedBatteryId) APP.state.conversion.selectedBatteryId = caseData.conversion.selectedBatteryId;
            if (caseData.conversion.selectedControllerId) APP.state.conversion.selectedControllerId = caseData.conversion.selectedControllerId;
            if (caseData.conversion.selectedInverterId) APP.state.conversion.selectedInverterId = caseData.conversion.selectedInverterId;
            if (typeof window.CONVERSION_UI !== 'undefined' && typeof window.CONVERSION_UI.render === 'function') {
                try { window.CONVERSION_UI.render(); } catch(e){}
            }
        }

        // Ejecutar dimensionamiento de inmediato con datos certificados
        if (typeof updateSizing === 'function') {
            updateSizing();
        }

        if (!options.silent && typeof showToast === 'function') {
            showToast(`${caseData.shortName} cargado: Demanda (Reto 01), Solar (Reto 02) y Conversión (Reto 03).`, 'success');
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

    if (caseData.id === 'caso-grupo-a') {
        if (titleEl) titleEl.textContent = `🌴 ${caseData.name}`;
        if (descEl) {
            descEl.innerHTML = `Ubicación (<strong>12.58° N, 81.70° O - San Andrés (Insular)</strong>), Inclinación óptima (<strong>13° al Sur</strong>), Temperaturas (Tmin: <strong>22°C</strong>, Tamb: <strong>31°C</strong>), HSP Anual: <strong>5.32 kWh/m²·día</strong> (Mes Crítico Nov: <strong>4.75</strong>). Área disponible: <strong>30 m²</strong>, Tarifa: <strong>$1.200/kWh</strong>, Sistema: <strong>On-Grid Residencial (Sin almacenamiento)</strong>.`;
        }
    } else if (caseData.id === 'caso-estandar') {
        if (titleEl) titleEl.textContent = `⭐ ${caseData.name}`;
        if (descEl) {
            descEl.innerHTML = `Ubicación (<strong>12.18° N, 71.28° O - Nazareth, Alta Guajira</strong>), Inclinación (<strong>12° al sur</strong>), Temperaturas (Tmin: <strong>20°C</strong>, Tamb: <strong>32°C</strong>), HSP Mes Crítico: <strong>5.2 kWh/m²·día</strong>, HSP Anual: <strong>5.8 kWh/m²·día</strong>. Módulo oficial exclusivo: <strong>550 Wp (72 celdas, 2.58 m²)</strong>. Restricción de diseño: <strong>600 V máx.</strong>`;
        }
    } else {
        if (titleEl) titleEl.textContent = `🔒 ${caseData.name}`;
        if (descEl) {
            descEl.innerHTML = `Coordenadas (<strong>${caseData.sizing.lat}°, ${caseData.sizing.lon}°</strong>), Inclinación (<strong>${caseData.sizing.tilt}°</strong>), Temperaturas (Tmin: <strong>${caseData.sizing.tmin}°C</strong>, Tamb: <strong>${caseData.sizing.tambOp}°C</strong>) e Irradiancia fija de PVGIS. <strong>Área Disponible y PR son variables para dimensionamiento.</strong>`;
        }
    }

    banner.style.display = 'flex';
}

window.CASES_DB = CASES_DB;
window.loadCase = loadCase;
window.setFieldsLockState = setFieldsLockState;
window.updateCaseBanner = updateCaseBanner;
