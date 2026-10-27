# Plan de Implementación — Reto 03: Dimensionamiento del Regulador/Inversor MPPT y del Banco de Baterías

## Contexto y Alcance
Este documento establece el plan de arquitectura, ingeniería y desarrollo para integrar el **Reto 03** (con y sin almacenamiento) dentro de la aplicación web existente de Energía Solar Fotovoltaica (**Reto 01 y Reto 02**), dejándola completamente preparada para su despliegue en producción en **Vercel**.

El plan está estructurado estrictamente en 6 secciones numeradas con sub-ítems (`1.1`, `1.2`, etc.) para facilitar la revisión, anotación y aprobación punto por punto antes de proceder a la fase de programación.

---

## SECCIÓN 1: Diagnóstico del HTML Adjunto (Reto 03)

### 1.1. Elementos Reutilizables Directamente del HTML
* **1.1.1. Estructura de Datos de Dispositivos**: Las firmas y parámetros base de `R3_DEVICES0` para reguladores MPPT (`maxPVVoc`, `maxChargeA`, `minPVVmp`, `maxPVInputA`, `url`), inversores con MPPT (`pac`, `peakW`, `maxPVVoc`, `mpptMin`, `mpptMax`, `maxImpA`, `maxIscA`, `url`) y baterías (`voltage`, `ah`, `dod`, `roundTrip`, `maxChargeC`, `lifeYears`, `url`).
* **1.1.2. Fórmulas de Capacidad de Banco de Baterías**:
  $$E_{CC} = \frac{E_d}{\eta_{inv}}\text{ [Wh/día]}$$
  $$C_n\text{ [Wh]} = \frac{E_{CC} \cdot N}{DoD \cdot f_T}$$
  $$C_n\text{ [Ah]} = \frac{C_n\text{ [Wh]}}{V_{banco}}$$
* **1.1.3. Disposición Discreta Serie/Paralelo**: Lógica de enteros de unidades:
  $$N_s = \frac{V_{banco}}{V_{unidad}}$$
  $$N_p = \left\lceil \frac{C_n\text{ [Ah]}}{C_{unidad}} \right\rceil$$
  $$E_{instalada}\text{ [Wh]} = (N_s \cdot N_p) \cdot V_{unidad} \cdot C_{unidad}$$
* **1.1.4. Corriente de Salida del Regulador**: Cálculo de $I_{salida} = \frac{P_{pico}}{V_{nominal}}$ evaluado contra la capacidad de placa del regulador sin aplicar el factor $1.25$.
* **1.1.5. Corrección Térmica de Tensiones**: Aplicación de coeficientes de temperatura $\beta_{Voc}$ para tensión máxima en frío ($T_{min}$) y tensión de máxima potencia en caliente ($T_{celda}$).

---

### 1.2. Discrepancias y Errores Detectados en el HTML vs. Términos de Referencia Oficiales
* **1.2.1. Error Matemático en la Fórmula del Tiempo de Recuperación ($t_{rec}$)**:
  * *En el HTML del compañero*: Calculó `surplus = EprodAnn - (EdCC / roundTrip)` y posteriormente `tRecover = (EdCC * days) / surplus`. Esto equivale algebraicamente a:
    $$t_{rec} = \frac{N \cdot E_{CC} \cdot \eta_{bat}}{E_{prod} \cdot \eta_{bat} - E_{CC}}$$
    lo cual distorsiona el resultado al multiplicar el numerador por la eficiencia $\eta_{bat}$, reduciendo incorrectamente el tiempo de recuperación real.
  * *En los TdR Oficiales (Pág. 2)*: La fórmula canónica estipulada es:
    $$t_{rec} = \frac{N \cdot E_{CC}}{E_{prod} \cdot \eta_{bat} - E_{CC}}$$
    donde $E_{prod} = P_{pico,inst} \cdot HSP_{anual} \cdot PR$. Si el denominador $(E_{prod} \cdot \eta_{bat} - E_{CC}) \le 0$, se debe declarar formalmente que el banco no se recupera con ese generador.
* **1.2.2. Alteración Injustificada de Parámetros Estandarizados (`CTRL-B` e `INV-B`)**:
  * *En el HTML del compañero*: Se incluyó una nota señalando erróneamente que `CTRL-B` e `INV-B` eran "referencias adicionales no definidas en el TdR", modificando `INV-B` con $P_{ac} = 2500\text{ W}$, $I_{mp,max} = 15\text{ A}$ e $I_{sc,max} = 18\text{ A}$.
  * *En los TdR Oficiales (Pág. 3)*: `CTRL-B` e `INV-B` **son equipos estandarizados oficiales**. `INV-B` tiene exactamente $P_{ac} = 2000\text{ W}$, $V_{oc,max} = 600\text{ V}$, Ventana MPPT de $90 - 550\text{ V}$, $I_{mp,max} = 16\text{ A}$ e $I_{sc,max} = 20\text{ A}$.
* **1.2.3. Omisión de la Tasa C de Descarga (RF-35)**:
  * *En el HTML del compañero*: Solo se verificaba la tasa C de carga ($I_{carga} / Ah_{inst}$).
  * *En los TdR Oficiales*: Se exige explícitamente comprobar **ambas tasas: carga y descarga** frente a las fichas técnicas ($0.2\text{ C}$ para AGM y $0.5\text{ C}$ para LFP):
    $$C_{descarga} = \frac{P_{max} / (V_{banco} \cdot \eta_{inv})}{Ah_{instalados}}$$
* **1.2.4. Falta de la Métrica de Energía Nominal Anualizada (RF-35)**:
  * *En el HTML del compañero*: Se omitió la comparación de tecnologías por durabilidad en servicio.
  * *En los TdR Oficiales*: Se exige calcular y comparar la energía nominal por año de servicio:
    $$\text{Energía Anualizada} = \frac{E_{instalada}\text{ [kWh]}}{\text{Vida de Diseño [años]}}$$
* **1.2.5. Reconfiguración de Cadenas Manual vs. Asistida Automática (RF-31)**:
  * *En el HTML del compañero*: Únicamente disponía de un dropdown manual genérico para cambiar la configuración.
  * *En los TdR Oficiales*: Se exige que la tabla comparativa de equipos proponga **automáticamente** la reconfiguración óptima ($N_s' \times N_p'$) cuando un equipo no admita la configuración del Reto 02, indicando con precisión el motivo de falla y habilitando su aplicación con un clic.
* **1.2.6. Ausencia de Interactividad en el Balance de Cierre (RF-34)**:
  * *En el HTML del compañero*: Mostraba una tabla estática informativa.
  * *En los TdR Oficiales*: Se exige una acción interactiva que permita al usuario aceptar el ajuste de módulos requeridos ($\Delta N_{mod}$), recalculando el generador aguas arriba y reevaluando la conformidad de los equipos en cascada.
* **1.2.7. Tensión de Arranque del Regulador MPPT**:
  * *En los TdR Oficiales*: $V_{mp,caliente} \ge V_{bat} + 5\text{ V}$. En el HTML del compañero esta verificación estaba anclada rígidamente a 48 V, sin responder dinámicamente si el usuario configuraba 12 V, 24 V o batería LFP de 51.2 V.

---

### 1.3. Elementos a Descartar por Pertenecer al Reto 04
* **1.3.1. Pestaña y Vistas de Escenarios Regionales**: Excluir por completo `#tab-escenarios`, la carga de grupos A–F (`SCENARIOS`), y los contenedores `#r4-preview` y `#r4-load-status`.
* **1.3.2. Módulo de Verificación con Segunda Fuente Solar**: Descartar `verifySecondSource()`, `#r4-second-source`, `#r4-second-result` y sus llamadas a APIs secundarias cruzadas.
* **1.3.3. Suite de Pruebas Automatizadas (RF 01 a 48)**: Descartar `runFunctionalTests()`, `#r4-test-summary`, `#r4-test-table` y la exportación de JSON de pruebas (`r4-export-tests`).
* **1.3.4. Bloque de Etapa 4**: Remover cualquier botón de navegación hacia etapas de validación de entrega ajenas al Reto 03.

---

## SECCIÓN 2: Mapeo de Datos y Estado Global (Retos 01 y 02 -> Reto 03)

### 2.1. Matriz de Variables Heredadas sin Reingreso Manual
El Reto 03 leerá en tiempo real desde la memoria compartida de la aplicación:

| Variable Requerida Reto 03 | Origen en la Aplicación Actual | Propiedad / Función en Memoria | Unidades / Formato |
| :--- | :--- | :--- | :--- |
| **$E_d$ (Energía Diaria)** | Reto 01 (`calculations.js`) | `calcDailyEnergy()` | $\text{kWh/día}$ |
| **Perfil Horario $P(h)$** | Reto 01 (`calculations.js`) | `calcHourlyProfile()` | Array 24 valores en $\text{W}$ |
| **$P_{max}$ y Hora ($h_{pmax}$)** | Reto 01 (`calculations.js`) | `calcMaxDemand(profile)` e `indexOf` | $\text{W}$ y hora $0 \dots 23$ |
| **Tipo de Aplicación** | Reto 01 (`project.js`) | `APP.state.project.systemType` | `'off-grid'`, `'on-grid'`, `'hybrid'` |
| **Días Operación / Año** | Reto 01 (`calculations.js`) | `APP.state.config.daysPerMonth * monthsPerYear` | Días ($365$ o personalizado) |
| **Ventana Solar (06–18 h)** | Reto 01 / Reto 02 | Calculado de $P(h)$ entre 06:00 y 18:00 | $E_{dentro}$, $E_{fuera}$ [kWh/día] |
| **$P_{pico}$ Requerida** | Reto 02 (`sizing.js`) | `APP.state.sizing.selectedResult.ppk` | $\text{kWp}$ |
| **$P_{pico}$ Instalada** | Reto 02 (`sizing.js`) | `APP.state.sizing.selectedResult.pinst` | $\text{kWp}$ |
| **Parámetros del Módulo** | Reto 02 (`modules_db.js`) | `APP.state.sizing.selectedResult.module` | $V_{oc}, V_{mp}, I_{sc}, I_{mp}, \beta, \gamma, P_{mod}$ |
| **Configuración Arreglo** | Reto 02 (`sizing.js`) | `selectedResult.ns` y `selectedResult.np` | Cadenas $N_s$ (serie) y $N_p$ (paralelo) |
| **Temperaturas de Diseño** | Reto 02 (`sizing.js`) | `APP.state.sizing.tmin`, `tambOp`, `tcell` | $T_{min}$ (°C), $T_a$ (°C), $T_{celda}$ (°C) |
| **Recurso Solar** | Reto 02 (`sizing.js`) | `APP.state.sizing.solarResource.annual` / `critical` | $HSP_{anual}$ y $HSP_{critico}$ [kWh/m²·día] |
| **Desempeño Global ($PR$)** | Reto 02 (`sizing.js`) | `APP.state.sizing.pr` | Adimensional ($0.50 \dots 0.90$) |

---

### 2.2. Esquema del Nuevo Estado Global (`APP.state.conversion`)
Se integrará el módulo de estado en `js/app.js`:

```javascript
APP.state.conversion = {
    // RF-25: Rama de trabajo
    branch: 'storage', // 'storage' (off-grid / híbrido) | 'grid' (on-grid)
    
    // Parámetros de conversión y banco
    inverterEfficiency: 0.90, // Rango 0.70 a 1.00 (90% en caso estandarizado)
    busVoltage: 48,          // 12, 24, 48 V
    autonomyDays: 2.0,       // N días (> 0)
    dodDesign: 0.50,         // 0.10 a 0.95 (50% AGM, 80% LFP)
    tempFactor: 1.0,         // f_T (1.0 para Tmin >= 18°C)
    
    // Dispositivos seleccionados
    selectedBatteryId: 'AGM',      // 'AGM' | 'LFP' | 'BAT-1' | 'BAT-2' | 'BAT-3' | 'BAT-4'
    selectedControllerId: 'CTRL-A',// 'CTRL-A' | 'CTRL-B' | 'CTRL-C' | 'REG-1'
    selectedInverterId: 'INV-B',  // 'INV-A' | 'INV-B' | 'INV-C' | 'INV-1' | 'INV-2' | 'INV-3'
    
    // Parámetros de rama sin almacenamiento
    dcacMin: 1.0,
    dcacMax: 1.3,
    pumpStartFactor: 3.0,
    
    // Reconfiguración y balance interactivo
    customStringNs: null,          // Ns alternativo si el usuario acepta propuesta
    balanceAdjusted: false,        // Indica si se aplicó el balance de cierre
    additionalModules: 0           // Módulos añadidos por balance
};
```

---

### 2.3. Ciclo de Vida y Flujo Reactivo
1. **Propagación en Cascada**: Cualquier cambio en el Reto 01 (cargas, horarios) o Reto 02 (módulo, HSP, PR) invoca `recalculateAll()`, actualizando automáticamente el Reto 03.
2. **Conmutación Inmediata de Rama**: Cambiar entre "Con almacenamiento" y "Sin almacenamiento" actualiza instantáneamente la visibilidad de bloques y recalcula los veredictos.
3. **Ajuste por Balance de Cierre**: Al pulsar `[ Aceptar Ajuste de Módulos ]`, el sistema actualiza $N_{total}$, recalcula $P_{pico,inst}$, y reevalúa si los controladores o inversores cumplen, emitiendo advertencia si ningún equipo resulta viable tras el incremento.

---

## SECCIÓN 3: Desglose de Ingeniería y Fórmulas (RF-25 a RF-36)

### 3.1. RF-25: Selector de Rama Reactivo
* **Lógica**:
  ```javascript
  const isGrid = APP.state.project.systemType === 'on-grid';
  APP.state.conversion.branch = isGrid ? 'grid' : 'storage';
  ```
* **Interfaz**: Conmutador visual con pestañas tipo píldora. Al cambiar de rama, se recalculan todas las matrices de cumplimiento de forma instantánea.

### 3.2. RF-26: Herencia de Datos sin Reingreso Manual
* Banner superior con tarjetas de solo lectura que resumen los parámetros heredados de Reto 01 y Reto 02 con indicadores visuales de enlace activo.

### 3.3. RF-27: Catálogo Editable de Equipos y Baterías (Referencias TdR + Opciones Comerciales con Enlace)
* **Diferenciación Conceptual**:
  1. **Equipos de Referencia Académica (TdR Reto 03)**:
     * Modelos ideales para reproducir el Caso de Prueba Estandarizado de la Alta Guajira (`CTRL-A`, `CTRL-B`, `CTRL-C`; `INV-A`, `INV-B`, `INV-C`; baterías `AGM 12V/200Ah` y `LFP 51.2V/100Ah`).
     * **Sin hipervínculo externo**: No pertenecen a una marca comercial particular. En la interfaz se identifican con el badge distintivo `Referencia TdR (Ideal)` sin botón de enlace para evitar URLs ficticias o rotas.
  2. **Equipos Comerciales Reales (AutoSolar / Opciones de Clase)**:
     * **Con hipervínculo predefinido**: Cada referencia comercial cuenta con su propiedad `url` hacia la ficha técnica oficial de AutoSolar y el botón interactivo `[ 🔗 Ficha Técnica ]` (icono Lucide `external-link`) que abre el documento en una nueva pestaña.
  3. **Gestión Dinámica**:
     * En el modal de catálogo, cualquier usuario puede editar parámetros o ingresar URLs personalizadas para nuevos equipos.

#### 3.3.1. Catálogo de Baterías Comerciales (Opciones de Clase)
| Parámetro | BAT-1 (GEL 12V 100Ah) | BAT-2 (GEL 12V 250Ah) | BAT-3 (Litio 51.2V 100Ah) | BAT-4 (Litio 25.6V 200Ah) |
| :--- | :--- | :--- | :--- | :--- |
| **Modelo Comercial** | Batería GEL 12V 100Ah Tensite | Batería GEL 12V 250Ah Tensite | Batería Litio Felicity 5.12kWh 100Ah FLH48100UG1 | Batería Litio Felicity Solar 5kWh 24V 200A FLA24200 |
| **Tecnología** | GEL (Plomo-Carbono/GEL) | GEL (Plomo-Carbono/GEL) | Litio (LiFePO4) | Litio (LiFePO4) |
| **Voltaje Nominal ($V_{nom}$)** | $12\text{ V}$ | $12\text{ V}$ | $51.2\text{ V}$ | $25.6\text{ V}$ |
| **Capacidad Nominal ($C_n$)** | $100\text{ Ah}$ | $250\text{ Ah}$ | $100\text{ Ah}$ | $200\text{ Ah}$ |
| **Energía Unitaria** | $1.20\text{ kWh}$ | $3.00\text{ kWh}$ | $5.12\text{ kWh}$ | $5.12\text{ kWh}$ |
| **Profundidad Descarga ($DoD$)** | $50\%$ ($0.50$) | $50\%$ ($0.50$) | $95\%$ ($0.95$) | $95\%$ ($0.95$) |
| **Eficiencia Ida y Vuelta ($\eta_{bat}$)** | $0.80$ ($80\%$) | $0.80$ ($80\%$) | $0.90$ ($90\%$) | $0.90$ ($90\%$) |
| **Límite de Carga (Tasa C)** | $0.18\text{ C}$ ($18\text{ A}$) | $0.40\text{ C}$ ($100\text{ A}$) | $1.0\text{ C}$ ($100\text{ A}$) | $0.75\text{ C}$ ($150\text{ A}$) |
| **Vida de Diseño** | $1\text{ año}$ | $1\text{ año}$ | $7\text{ años}$ | $7\text{ años}$ |
| **Hipervínculo Oficial** | [Tensite GEL 100Ah](https://autosolar.co/baterias-gel-12v/bateria-gel-12v-100ah-tensite) | [Tensite GEL 250Ah](https://autosolar.co/baterias-gel-12v/bateria-gel-12v-250ah-tensite) | [Felicity Litio 51.2V 100Ah](https://autosolar.co/baterias-de-litio/bateria-de-litio-felicity-512kwh-100ah-flh48100ug1-alto-voltaje) | [Felicity Solar 24V 200A](https://autosolar.co/baterias-de-litio-24v/bateria-litio-felicity-solar-5kwh-24v-200a-fla24200) |

#### 3.3.2. Catálogo de Reguladores MPPT Comerciales (Opciones de Clase)
| Parámetro | REG-1 (SRNE ML4830N15) |
| :--- | :--- |
| **Modelo Comercial** | Controlador de Carga MPPT 30A ML4830N15 12/24/36/48V LCD SRNE |
| **Tensión de Entrada Máxima ($V_{oc,max}$)** | $145\text{ V}$ |
| **Corriente Máxima al Banco ($I_{salida,max}$)** | $20\text{ A}$ (o hasta $30\text{ A}$ nominal) |
| **Corriente Máxima Cortocircuito FV ($I_{sc,max}$)** | $30\text{ A}$ |
| **Tensiones de Banco Soportadas** | $12\text{ V} / 24\text{ V} / 36\text{ V} / 48\text{ V}$ (autodetección) |
| **Hipervínculo Oficial** | [SRNE MPPT 30A ML4830N15](https://autosolar.co/controladores-de-carga-mppt/controlador-carga-mppt-30a-ml4830n15-12243648v-lcd-srne) |

#### 3.3.3. Catálogo de Inversores Comerciales (Opciones de Clase)
| Parámetro | INV-1 (Growatt SPF 3000TL) | INV-2 (Felicity Solar 8kW) | INV-3 (Voltronic Axpert MKS Zero) |
| :--- | :--- | :--- | :--- |
| **Modelo Comercial** | Inversor Cargador Growatt SPF 3000TL LVM 24V | Inversor Híbrido Felicity Solar 8000W 48V IVGM8KLP2G1 | Inversor Cargador Híbrido 2000W 24V Voltronic Axpert MKS Zero LV |
| **Potencia Nominal ($P_{ac} / P_{nom}$)** | $3000\text{ W}$ ($3\text{ kW}$) | $8800\text{ W}$ ($8.8\text{ kW}$) | $2000\text{ W}$ ($2\text{ kW}$) |
| **Tensión Nominal del Bus DC** | $24\text{ V}$ | $48\text{ V}$ | $24\text{ V}$ |
| **Tensión Máxima FV ($V_{oc,max}$)** | $145\text{ V}$ | $500\text{ V}$ | $145\text{ V}$ |
| **Rango de Ventana MPPT** | $30\text{ V} \dots 115\text{ V}$ | $120\text{ V} \dots 425\text{ V}$ | $30\text{ V} \dots 115\text{ V}$ |
| **Corriente Máx. Operación ($I_{mp,max}$)** | $60\text{ A}$ | $26\text{ A}$ | $60\text{ A}$ |
| **Corriente Máx. Cortocircuito ($I_{sc,max}$)** | $80\text{ A}$ | $44\text{ A}$ | $80\text{ A}$ |
| **Hipervínculo Oficial** | [Growatt SPF 3000TL LVM 24V](http://autosolar.co/inversores-cargadores-24v/inversor-cargador-growatt-spf-3000tl-lvm-24v) | [Felicity Solar Híbrido 8000W 48V](https://autosolar.co/inversores-solares-hibridos/inversor-hibrido-felicity-solar-8000w-48v-ivgm8klp2g1) | [Voltronic Axpert MKS Zero 2000W 24V](https://autosolar.co/inversores-cargadores-24v/inversor-cargador-hibrido-2000w-24v-voltronic-axpert-mks-zero-lv) |

#### 3.3.4. Catálogo de Equipos de Referencia Académica del TdR (Sin Hipervínculo)
* **Reguladores MPPT de Referencia**:
  1. `CTRL-A`: $V_{oc,max} = 150\text{ V}$, $I_{salida,max} = 60\text{ A}$, $I_{sc,max} = 50\text{ A}$, $V_{mppt,min} = 50\text{ V}$.
  2. `CTRL-B`: $V_{oc,max} = 250\text{ V}$, $I_{salida,max} = 80\text{ A}$, $I_{sc,max} = 50\text{ A}$, $V_{mppt,min} = 60\text{ V}$.
  3. `CTRL-C`: $V_{oc,max} = 250\text{ V}$, $I_{salida,max} = 40\text{ A}$, $I_{sc,max} = 50\text{ A}$, $V_{mppt,min} = 50\text{ V}$.
* **Inversores con MPPT de Referencia**:
  1. `INV-A`: $P_{ac} = 1500\text{ W}$, $P_{pico} = 3000\text{ W}$, $V_{oc,max} = 500\text{ V}$, MPPT $80 \dots 450\text{ V}$, $I_{mp,max} = 12\text{ A}$, $I_{sc,max} = 15\text{ A}$.
  2. `INV-B`: $P_{ac} = 2000\text{ W}$, $P_{pico} = 5000\text{ W}$, $V_{oc,max} = 600\text{ V}$, MPPT $90 \dots 550\text{ V}$, $I_{mp,max} = 16\text{ A}$, $I_{sc,max} = 20\text{ A}$.
  3. `INV-C`: $P_{ac} = 3000\text{ W}$, $P_{pico} = 6000\text{ W}$, $V_{oc,max} = 600\text{ V}$, MPPT $90 \dots 550\text{ V}$, $I_{mp,max} = 16\text{ A}$, $I_{sc,max} = 20\text{ A}$.
* **Baterías de Referencia**:
  1. `AGM 12V/200Ah`: $12\text{ V}$, $200\text{ Ah}$, $DoD = 50\%$, $\eta_{bat} = 0.80$, límite carga $0.2\text{ C}$, vida $4\text{ años}$.
  2. `LFP 51.2V/100Ah`: $51.2\text{ V}$, $100\text{ Ah}$, $DoD = 80\%$, $\eta_{bat} = 0.92$, límite carga $0.5\text{ C}$, vida $10\text{ años}$.

* **Renderizado y Comportamiento de Enlaces en UI**:
  * En la tarjeta y tabla comparativa:
    * Si el equipo tiene `url` definida (opciones comerciales BAT-1 a 4, REG-1, INV-1 a 3 o personalizados): Muestra el botón interactivo `[ 🔗 Ficha Técnica ]` con icono Lucide `external-link` que abre el enlace en nueva pestaña (`target="_blank" rel="noopener noreferrer"`).
    * Si el equipo es de referencia TdR (sin `url`): Muestra el badge `Referencia TdR (Ideal)`, sin botón de enlace para evitar enlaces rotos.
  * En el modal de gestión de catálogo: Se incluye el campo `URL de Ficha Técnica / Referencia` (opcional para referencias, editable y persistente para modelos comerciales).

### 3.4. RF-28: Verificación de Tensiones del Arreglo
* **Fórmulas**:
  $$V_{oc,frio} = V_{oc,STC} \cdot [1 + |\beta_{Voc}| \cdot (25 - T_{min})]$$
  $$N_{s,max} = \left\lfloor \frac{V_{max,equipo}}{V_{oc,frio}} \right\rfloor$$
  $$V_{oc,gen,frio} = N_s \cdot V_{oc,frio}$$
  $$V_{mp,caliente} = N_s \cdot V_{mp,STC} \cdot [1 - |\beta_{Voc}| \cdot (T_{celda} - 25)]$$
  $$V_{mp,frio} = N_s \cdot V_{mp,STC} \cdot [1 + |\beta_{Voc}| \cdot (25 - T_{min})]$$
* **Criterios de Conformidad**:
  * $V_{oc,gen,frio} \le V_{max,equipo}$ (Alerta roja si se excede).
  * Regulador MPPT: $V_{mp,caliente} \ge \max(V_{mppt,min}, V_{banco} + 5\text{ V})$.
  * Inversor: $V_{mp,caliente} \ge V_{mppt,min}$ y $V_{mp,frio} \le V_{mppt,max}$.

### 3.5. RF-29: Verificación de Corrientes y Separación de Factores NTC 2050
* **Corriente hacia el Banco (Sin Factor 1.25)**:
  $$I_{salida} = \frac{P_{pico,gen}}{V_{nominal,banco}} \le I_{salida,max,regulador}$$
* **Corrientes de Entrada del Arreglo**:
  $$I_{sc,gen} = N_p \cdot I_{sc,STC} \le I_{sc,max,equipo}$$
  $$I_{mp,gen} = N_p \cdot I_{mp,STC} \le I_{mp,max,equipo}$$
* **Corriente de Diseño de Conductores y Protecciones (Visualización Aparte)**:
  $$I_{diseño,salida} = 1.25 \cdot I_{salida}$$
  $$I_{diseño,entrada} = 1.25 \cdot 1.25 \cdot I_{sc,gen} = 1.5625 \cdot I_{sc,gen}\quad\text{(NTC 2050 art. 690-8)}$$

### 3.6. RF-30: Relación DC/AC en Rama Sin Almacenamiento
* **Fórmula y Rango**:
  $$\text{Ratio}_{DC/AC} = \frac{P_{pico,instalada}\text{ [W]}}{P_{ac,inversor}\text{ [W]}}$$
  Rango configurable en UI (por defecto $1.0 \le \text{Ratio}_{DC/AC} \le 1.3$).
* **Alertas**:
  * $\text{Ratio} > 1.3$: Alerta ámbar de *Recorte de potencia esperado (Clipping)*.
  * $\text{Ratio} < 1.0$: Alerta informativa de *Inversor sobredimensionado*.

### 3.7. RF-31: Comparación de Catálogo y Reconfiguración de Cadenas
* Tabla con veredicto (**Cumple / Alerta / No cumple**) indicando el criterio exacto de falla, acompañada de la columna **Referencia** con el botón de hipervínculo predefinido `[ 🔗 Ficha ]` que enlaza directamente a la ficha del fabricante en una pestaña nueva.
* **Propuesta Automática**: Si un equipo falla por $V_{oc}$ en la configuración original $N_s \times N_p$, el sistema busca divisores enteros de $N_{total}$ que cumplan $N_s' \le N_{s,max}$ y $V_{mp,caliente}' \ge V_{arranque}$, mostrando el botón `[ Aplicar Reconfiguración Ns' x Np' ]`.

### 3.8. RF-32 y RF-33: Dimensionamiento del Banco de Baterías
* **Validación de Rangos**: Autonomía $N > 0$, $DoD \in (0, 100\%]$, $\eta_{inv}, \eta_{bat} \in (0, 1.0]$, $f_T \in (0, 1.0]$.
* **Cálculos**:
  $$E_{CC} = \frac{E_d}{\eta_{inv}},\quad C_n\text{ [Wh]} = \frac{E_{CC} \cdot N}{DoD \cdot f_T},\quad C_n\text{ [Ah]} = \frac{C_n\text{ [Wh]}}{V_{banco}}$$
  $$N_s = \frac{V_{banco}}{V_{unidad}},\quad N_p = \left\lceil \frac{C_n\text{ [Ah]}}{C_{unidad}} \right\rceil,\quad N_{total} = N_s \cdot N_p$$
  $$E_{instalada}\text{ [Wh]} = N_{total} \cdot V_{unidad} \cdot C_{unidad},\quad Ah_{instalados} = N_p \cdot C_{unidad}$$
  $$DoD_{fin} = \frac{E_{CC} \cdot N}{E_{instalada}} \times 100\%,\quad DoD_{diario} = \frac{E_{CC}}{E_{instalada}} \times 100\%$$
* Alerta si $DoD_{fin} > DoD_{diseño}$.

### 3.9. RF-34: Balance de Cierre Interactivo
* **Requerimientos**:
  $$E_{gen} = \frac{E_{CC}}{\eta_{bat}}\text{ [Wh/día]}$$
  $$P_{req,anual} = \frac{E_{gen}}{HSP_{anual} \cdot PR}\text{ [Wp]},\quad P_{req,crit} = \frac{E_{gen}}{HSP_{crit} \cdot PR}\text{ [Wp]}$$
* **Margen / Déficit**:
  $$\Delta N_{mod} = \left\lceil \frac{P_{req} - P_{pico,inst}}{P_{mod}} \right\rceil$$
* **Acción Interactiva**: Botón `[ Aplicar Ajuste de Módulos (+ΔN) ]` que incrementa el generador y reevalúa la conformidad de los equipos. Si ningún equipo cumple, genera alerta advirtiendo la incompatibilidad.

### 3.10. RF-35: Tasa C, Tiempo de Recuperación y Comparativa Tecnológica
* **Tasas C**:
  $$C_{carga} = \frac{I_{salida}}{Ah_{instalados}} \le C_{max,carga}\quad (0.2\text{ C para AGM}, 0.5\text{ C para LFP})$$
  $$C_{descarga} = \frac{P_{max} / (V_{banco} \cdot \eta_{inv})}{Ah_{instalados}} \le C_{max,descarga}$$
* **Tiempo de Recuperación**:
  $$t_{rec} = \frac{N \cdot E_{CC}}{E_{prod} \cdot \eta_{bat} - E_{CC}}\text{ [días]},\quad\text{con } E_{prod} = P_{pico,inst} \cdot HSP_{anual} \cdot PR$$
  *Si $(E_{prod} \cdot \eta_{bat} - E_{CC}) \le 0$, se alerta formalmente que el banco no se recupera.*
* **Comparación Tecnológica Anualizada**:
  $$\text{Energía Anualizada} = \frac{E_{instalada}\text{ [kWh]}}{\text{Vida de Diseño [años]}}$$

### 3.11. RF-36: Informe de Una Página, Caso Estandarizado y Persistencia
* Ampliación del informe ejecutivo en PDF incorporando la sección completa de Reto 03.
* Persistencia en archivo JSON incluyendo el estado de conversión.
* Preset `[ Cargar Caso de Prueba Estandarizado (Alta Guajira) ]` para autocompletar instantáneamente los datos de prueba.

### 3.12. Validación Numérica del Caso de Prueba Estandarizado (Alta Guajira)
* **Entradas**: $E_d = 7.580\text{ kWh/día}$, $P_{max} = 910\text{ W}$, 4 módulos 550 Wp ($2.20\text{ kWp}$), $\eta_{inv} = 0.90$, $N = 2\text{ días}$, $f_T = 1.0$, $V_{banco} = 48\text{ V}$, $HSP_{anual} = 5.8$, $HSP_{crit} = 5.2$, $PR = 0.70$.
* **Arreglo**: $V_{oc}(20^\circ\text{C}) = 50.17\text{ V}$. En 4S: $V_{oc,gen} = 200.7\text{ V}$. $T_{celda} = 63.2^\circ\text{C}$; $V_{mp,caliente}(4S) = 148.9\text{ V} \ge 53\text{ V}$ (Arranque cumplido).
* **Baterías AGM ($12\text{ V} / 200\text{ Ah}$, $DoD = 50\%$, $\eta_{bat} = 0.80$, $4\text{ años}$)**:
  * $E_{CC} = 8422.2\text{ Wh/día}$.
  * $C_n = 33688.9\text{ Wh} = 701.85\text{ Ah}$.
  * $N_s = 4$, $N_p = \lceil 701.85/200 \rceil = 4 \rightarrow \mathbf{16\text{ unidades}}$.
  * $Ah_{inst} = 800\text{ Ah}$, $E_{inst} = 38.4\text{ kWh}$, $DoD_{fin} = 43.87\% \le 50\%$.
  * $I_{salida} = 45.83\text{ A}$, Tasa C carga = $0.057\text{ C} \le 0.2\text{ C}$.
  * $E_{gen} = 10527.8\text{ Wh/día}$, $P_{req,anual} = 2.593\text{ kWp}$ ($+1\text{ módulo}$), $P_{req,crit} = 2.892\text{ kWp}$ ($+2\text{ módulos}$).
  * Denominador de $t_{rec}$: $8932 \times 0.80 - 8422.2 = -1276.6\text{ Wh} \le 0 \rightarrow$ **El banco no se recupera sin ajuste**.
* **Baterías LFP ($51.2\text{ V} / 100\text{ Ah}$, $DoD = 80\%$, $\eta_{bat} = 0.92$, $10\text{ años}$)**:
  * $C_n = 21055.6\text{ Wh} = 411.24\text{ Ah}$.
  * $N_s = 1$, $N_p = 5 \rightarrow \mathbf{5\text{ unidades}}$ ($25.6\text{ kWh}$).
* **Reguladores**:
  * `CTRL-A` ($150\text{ V} / 60\text{ A}$): Falla en 4S ($200.7\text{ V} > 150\text{ V}$). **Propuesta automática a 2S2P** ($V_{oc} = 100.3\text{ V} \le 150\text{ V}$, $I_{salida} = 45.8\text{ A} \le 60\text{ A}$, $I_{sc} = 28\text{ A} \le 50\text{ A}$) $\rightarrow$ **Cumple**.
  * `CTRL-B` ($250\text{ V} / 80\text{ A}$): **Cumple directo en 4S**.
  * `CTRL-C` ($250\text{ V} / 40\text{ A}$): **Falla** por corriente de salida ($45.83\text{ A} > 40\text{ A}$).
* **Inversores (Sin Almacenamiento)**:
  * `INV-A` ($1500\text{ W}$): $\text{Ratio} = 1.47 > 1.30 \rightarrow$ **Alerta: Clipping**.
  * `INV-B` ($2000\text{ W}$): $\text{Ratio} = 1.10 \in [1.0, 1.3] \rightarrow$ **Cumple**.
  * `INV-C` ($3000\text{ W}$): $\text{Ratio} = 0.73 < 1.00 \rightarrow$ **Alerta: Sobredimensionado**.

---

## SECCIÓN 4: Arquitectura de Componentes UI y Estética

### 4.1. Filosofía de Diseño
* **Tokens de Color**: Dark theme contemporáneo (`#070b14`, `#0f1724`), acentos ámbar solar (`#f59e0b`), bordes con contraste controlado y glassmorphism.
* **Iconografía**: **Cero emojis**. Uso exclusivo de SVGs inline inspirados en Lucide (`battery`, `cpu`, `zap`, `shield-check`, `alert-triangle`, `sliders`, `refresh-cw`).

### 4.2. Macro-Navegación Superior en Tres Etapas
La barra superior se expandirá a 3 etapas de navegación:
* `[ 1. Requerimiento (Demanda - Reto 01) ]`
* `[ 2. Generador FV (Módulos y Recurso - Reto 02) ]`
* `[ 3. Conversión y Baterías (Reto 03) ]`

### 4.3. Estructura de la Vista `#stage-conversion`
1. **Banner de Datos Heredados sin Reingreso**: Grid de tarjetas técnicas compactas.
2. **Selector de Rama Reactivo**: Segmented switch con estados "Con almacenamiento" y "Sin almacenamiento".
3. **Formulario de Parámetros de Diseño**: Tensiones, autonomías, DoD, eficiencias y rangos DC/AC.
4. **Tabla Comparativa de Equipos**: Filas con veredictos dinámicos, desglose de fallas, botón de sugerencia de reconfiguración y botón `[ 🔗 Ficha Técnica ]` con icono Lucide `external-link` estilizado que abre el hipervínculo predefinido del equipo en una nueva pestaña.
5. **Sección de Almacenamiento**:
   * Métricas y capacidad requerida vs instalada.
   * Visualizador SVG del banco de baterías (esquema serie-paralelo interactivo).
   * Tarjeta de balance de cierre con botón interactivo de ajuste.
   * Comparación de tecnologías por energía anualizada con enlace a las fichas de las baterías (AGM y LFP).
6. **Modal de Catálogo Editable**: Diálogo modal accesible desde la barra superior para editar o agregar reguladores, inversores y baterías, incluyendo el campo obligatorio de hipervínculo `URL de Ficha Técnica / Referencia`, con importación/exportación JSON.

---

## SECCIÓN 5: Plan de Archivos y Preparación para Vercel

### 5.1. Archivos Nuevos a Crear
* `js/conversion_db.js`: Catálogo de equipos y baterías con hipervínculos predefinidos a fichas técnicas oficiales y persistencia en `localStorage`.
* `js/conversion.js`: Motor matemático puro de Reto 03 (normativa, tensiones, corrientes, banco, balance, reconfiguraciones).
* `js/conversion_ui.js`: Renderizado de tarjetas, tablas, alertas, enlaces a fichas técnicas (`btn-module-ref`), visualizador SVG de baterías y eventos.
* `data/conversion_devices.json`: Catálogo de respaldo estático predeterminado con URLs verificadas.

### 5.2. Archivos Existentes a Modificar
* `index.html`: Inclusión de la 3.ª macro-etapa, panel `#stage-conversion`, modal de catálogo y carga de scripts.
* `js/app.js`: Inclusión de `APP.state.conversion`, extensión de `switchStage()` y actualización de `recalculateAll()`.
* `js/persistence.js`: Incorporación del estado de conversión en `saveProject()` / `loadProject()` y botón de preset de la Alta Guajira.
* `js/report.js`: Extensión del generador de informe PDF para incluir la sección ejecutiva de Reto 03 con fuentes y URLs citadas.
* `css/styles.css`: Estilos para tablas de veredicto, visualizador de baterías, layout reactivo y segmented switches.
* `vercel.json`: Verificación de encabezados y enrutamiento estático para despliegue limpio.

### 5.3. Garantía para Vercel
* Arquitectura 100% frontend estático (HTML/CSS/JS nativo) sin pasos de compilación propensos a fallar.
* Todas las referencias a assets con rutas relativas limpias.

---

## SECCIÓN 6: Fases de Ejecución Paso a Paso

* **Fase 1: Catálogo y Base de Datos (`conversion_db.js`)**:
  - Definir equipos estandarizados de referencia del TdR (`CTRL-A`, `CTRL-B`, `CTRL-C`, `INV-A`, `INV-B`, `INV-C`, `AGM`, `LFP`) como modelos ideales sin hipervínculo web externo.
  - Implementar el catálogo de equipos comerciales con sus hipervínculos oficiales predefinidos (`url`) a AutoSolar:
    * Baterías: `BAT-1` (Tensite GEL 100Ah), `BAT-2` (Tensite GEL 250Ah), `BAT-3` (Felicity Litio 51.2V 100Ah), `BAT-4` (Felicity Solar Litio 25.6V 200Ah).
    * Reguladores: `REG-1` (SRNE MPPT 30A ML4830N15).
    * Inversores: `INV-1` (Growatt SPF 3000TL LVM 24V), `INV-2` (Felicity Solar 8.8kW 48V), `INV-3` (Voltronic Axpert MKS Zero 2kW 24V).
  - Implementar métodos de importación, exportación y sincronización en `localStorage`.
* **Fase 2: Motor Matemático y Normativo (`conversion.js`)**:
  - Implementar cálculos térmicos de tensión y límites MPPT.
  - Implementar verificación de corrientes y separación de $I_{diseño}$ (1.25 NTC 2050 art. 690-8).
  - Implementar dimensionamiento de banco, tasas C y tiempo de recuperación $t_{rec}$ exacto.
  - Implementar balance de cierre interactivo y algoritmo de reconfiguración de cadenas.
* **Fase 3: Estructura HTML y Diseño CSS (`index.html`, `styles.css`)**:
  - Añadir la Etapa 3 a la macro-navegación.
  - Maquetar las tarjetas del panel `#stage-conversion` con tokens dark mode y Lucide SVGs (cero emojis).
* **Fase 4: Controlador UI y Reactividad (`conversion_ui.js`)**:
  - Conectar formularios y selectores de rama con recálculo en vivo.
  - Renderizar tablas de equipos con veredictos, botones de hipervínculo `[ 🔗 Ficha Técnica ]` hacia la URL predefinida y reconfiguración asistida de un clic.
  - Renderizar el visualizador vectorial de baterías y el balance interactivo.
* **Fase 5: Integración con Estado Global, Persistencia e Informe (`app.js`, `persistence.js`, `report.js`)**:
  - Unificar la herencia de datos desde Retos 01 y 02.
  - Actualizar `saveProject()` y `loadProject()` con el estado de conversión.
  - Habilitar el botón de preset del caso estandarizado de la Alta Guajira.
  - Integrar la sección de Reto 03 en el informe PDF imprimible.
* **Fase 6: Calibración y Verificación de Despliegue en Vercel**:
  - Comprobar exactitud al 100% con los valores de referencia de los TdR.
  - Validar navegación responsiva y build estático limpio en Vercel.
