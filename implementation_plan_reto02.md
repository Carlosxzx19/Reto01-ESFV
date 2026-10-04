# Plan de Implementación — Reto 02: Dimensionamiento del Generador Fotovoltaico

## 1. Visión General y Alcance

El objetivo del **Reto 02** es expandir la aplicación web existente de caracterización de demanda energética (**Reto 01**) incorporando un módulo completo de **Dimensionamiento del Generador Fotovoltaico**.

El sistema responde a la pregunta de ingeniería: **¿Qué generador fotovoltaico (módulos, potencia, configuración eléctrica y área) hace falta para abastecer la demanda calculada en el Reto 01?**

### Principios de Diseño
1. **Integración Directa sin Reingreso (RF-13)**: El módulo hereda automáticamente los 6 datos clave del Reto 01 ($E_d$, $P(h)$, $P_{max}$, $h_{pmax}$, tipo de aplicación y días/año) desde la memoria de la aplicación.
2. **Arquitectura en 2 Etapas ("Macro-Navegación")**:
   - **Requerimiento**: Mantiene intacta la etapa del Reto 01 (Proyecto, Cuadro de Cargas, Resultados de Demanda, Informe).
   - **Dimensionamiento**: Nueva ventana/sección dedicada al cálculo y selección fotovoltaica (Reto 02).
3. **Cálculos Rigurosos según Normativa y Términos de Referencia**:
   - Corrección de $V_{oc}$ a temperatura mínima ($T_{min}$) bajo NTC 2050 art. 690-7.
   - Modelo térmico NOCT para calcular $T_{celda}$ y $V_{mp}$ en operación.
   - Corriente de diseño del generador ($I_{diseño} = 1.25 \times 1.25 \times I_{sc,gen} = 1.5625 \times I_{sc,gen}$) bajo NTC 2050 art. 690-8.
   - Comparación y propuesta simultánea de los **3 modelos de módulos** (150 Wp, 330 Wp y 550 Wp) cuantificando excedente/déficit y verificación de área disponible.

---

## 2. Estructura de la Interfaz de Usuario (UI/UX)

### 2.1. Macro-Navegación Superior (Encima de los botones actuales)
En la parte superior de la página, inmediatamente debajo del encabezado principal, se agregará un selector de etapas macro:
```
┌────────────────────────────────────────────────────────────────────────┐
│  [ 1. Requerimiento ]               [ 2. Dimensionamiento ]            │
│  (Demanda Energética - Reto 01)     (Generador Fotovoltaico - Reto 02) │
└────────────────────────────────────────────────────────────────────────┘
```
- **Al pulsar [1. Requerimiento]**: Muestra la barra de pestañas del Reto 01 (`📋 Proyecto`, `⚡ Cuadro de Cargas`, `📊 Resultados`, `📄 Informe`).
- **Al pulsar [2. Dimensionamiento]**: Cambia la vista al módulo del Reto 02, manteniendo en memoria compartida todos los datos calculados.

### 2.2. Distribución de la Ventana "Dimensionamiento"
La vista de Dimensionamiento se organizará en bloques visuales modulares:

1. **Banner de Datos Heredados (RF-13)**:
   - Tarjetas informativas de solo lectura:
     - $E_d$: Energía diaria demandada (ej. `7.58 kWh/día`).
     - $P_{max}$: Demanda máxima simultánea y hora (ej. `910 W a las 17:00`).
     - Tipo de instalación: `Off-grid / On-grid / Híbrido`.
     - Coincidencia solar (RF-17): Energía diurna consumida en ventana solar (`5.18 kWh/día` - 68.3%) vs fuera de ventana (`2.40 kWh/día` - 31.7%).

2. **Panel de Recurso Solar & Conexión API PVWatts (RF-14, RF-15)**:
   - **Entradas Geográficas y de Orientación**:
     - **Latitud**: Input numérico (ej. `12.18` para Nazareth).
     - **Longitud**: Input numérico (ej. `-71.28` para Nazareth).
     - **Inclinación (Tilt)**: Grados respecto a la horizontal (ej. `12°`).
     - **Azimut**: Grados respecto al Norte (ej. `180°` para orientación Sur).
   - **Parámetros Técnicos de la Instalación (PVWatts)**:
     - **Tipo de Montaje (Array Type)**: Selector entre:
       - `Techo (Roof Mounted)` $\rightarrow$ `array_type = 1`
       - `Suelo / Estructura Abierta (Open Rack)` $\rightarrow$ `array_type = 0`
     - **Pérdidas del Sistema (% Losses)**: Input numérico editable por el usuario (por defecto `14%` o ajustable libremente).
     - **Tipo de Módulo (Module Type)**: Fijo internamente en `0` (Policristalino / Estándar) según especificación.
     - **Capacidad de Referencia (System Capacity)**: Fijo internamente en `1 kW` para normalización directa de irradiancia.
     - **API Key**: Campo preconfigurado con la clave suministrada (`k4qaUJIK13UGUQ4yIdoA7YebJ7j43LvWcmqC259R`), editable para el usuario.
   - **Acciones y Resultados de Irradiancia**:
     - Botón `[ ☀️ Consultar Recurso Solar (PVWatts) ]`.
     - Badge de estado: 🟢 `API Conectada` / 🟡 `Modo Contingencia (BD Local)` / 🔵 `Datos en Caché`.
     - Visualización directa:
       - **Irradiancia Diaria Media Anual / HSP Anual**: `solrad_annual` en $\text{kWh/m}^2\cdot\text{día}$ ($h$).
       - **Irradiancia del Mes Crítico / HSP Crítico**: Mínimo de `solrad_monthly` en $\text{kWh/m}^2\cdot\text{día}$ ($h$).
       - Selector de **Criterio de Dimensionamiento**: `Promedio Anual` vs `Mes Crítico` (RF-16).
     - Preset de acceso rápido: Botón `[ Cargar Caso de Prueba (Nazareth) ]` con valores oficiales precargados.

3. **Parámetros del Cliente y Condiciones de Diseño**:
   - **Área Disponible ($m^2$)**: Entrada editable obligatoria del cliente (ej. `20 m²`).
   - **Performance Ratio (PR)**: Porcentaje global de desempeño asumido (`0.80` o ajustable a `0.70`).
   - **Temperatura Ambiente Mínima ($T_{min}$)**: Por defecto `18 °C` (o `20 °C` para el caso de prueba).
   - **Temperatura Ambiente de Operación ($T_a$)**: Por defecto `32 °C`.
   - **Tensión Máxima Admisible ($V_{max,sistema}$)**: Por defecto `600 V`.

4. **Resumen de Potencia Pico Requerida (RF-18)**:
   - Tarjeta principal: $P_{pico}\text{ (kWp)} = \frac{E_d}{HSP \times PR}$.
   - Desglose visible de la fórmula y variables aplicadas.

5. **Comparador de los 3 Modelos de Paneles Fotovoltaicos (RF-19, RF-20, RF-21, RF-22, RF-23)**:
   - Presentación simultánea de los 3 modelos:
     - **Panel 1 (Ideal 12V)**: 150 Wp
     - **Panel 2 (Ideal 24V)**: 330 Wp
     - **Panel 3 (Caso de Prueba 48V/On-Grid)**: 550 Wp
   - Métricas calculadas para cada panel:
     - Módulos requeridos ($N_{mod}$).
     - Potencia instalada final ($kWp$) y Excedente / Déficit ($Wp$ y $\%$).
     - Configuración en cadenas: $N_{serie}$ y $N_{paralelo}$.
     - Tensiones: $V_{oc,gen}(T_{min})$ (verificando $V_{oc,gen} \le V_{max}$) y $V_{mp,gen}(T_{celda})$.
     - Corrientes: $I_{sc,gen}$, $I_{diseño}$ ($1.5625 \times I_{sc,gen}$) e $I_{mp,gen}$.
     - Área ocupada total ($m^2$) y contraste con el Área disponible:
       - 🟢 **"Cabe en el área disponible"** ($Área_{gen} \le Área_{disponible}$).
       - 🔴 **"No cabe — Área insuficiente"** ($Área_{gen} > Área_{disponible}$).
     - Selector para marcar el panel recomendado/elegido por el usuario.

6. **Proyección de Generación Energética (Mensual o Anual)**:
   - Selector interactivo: **"Promedio Mensual"** (12 meses de generación estimada vs demanda) o **"Proyección Anual"**.
   - Gráfico comparativo dinámico con Chart.js.

7. **Ampliación del Informe Ejecutivo (RF-24)**:
   - Inclusión de la sección del Generador Fotovoltaico en el informe imprimible/PDF con fuentes y supuestos.

---

## 3. Integración Técnica con la API PVWatts v8 (NREL)

### 3.1. Endpoint y Parámetros de Consulta
- **URL Base**: `https://developer.nrel.gov/api/pvwatts/v8.json`
- **Parámetros HTTP GET**:
  ```
  https://developer.nrel.gov/api/pvwatts/v8.json?api_key=k4qaUJIK13UGUQ4yIdoA7YebJ7j43LvWcmqC259R&lat={lat}&lon={lon}&system_capacity=1&azimuth={azimuth}&tilt={tilt}&array_type={array_type}&module_type=0&losses={losses}
  ```
  - `api_key`: `k4qaUJIK13UGUQ4yIdoA7YebJ7j43LvWcmqC259R` (configurable en UI o almacenamiento local).
  - `lat`: Latitud ingresada por el usuario (ej. `12.18`).
  - `lon`: Longitud ingresada por el usuario (ej. `-71.28`).
  - `system_capacity`: `1` (1 kW de capacidad normalizada).
  - `module_type`: `0` (Estándar / Policristalino).
  - `losses`: Pérdidas seleccionadas por el usuario (ej. `14`).
  - `array_type`: `1` para Techo, `0` para Suelo.
  - `tilt`: Inclinación en grados (ej. `12`).
  - `azimuth`: Azimut en grados (ej. `180`).

### 3.2. Extracción de Resultados para el Dimensionamiento
De la respuesta JSON en `outputs`:
- `outputs.solrad_annual`: Irradiancia diaria media anual en el plano del generador en $\text{kWh/m}^2\cdot\text{día}$ $\equiv$ **HSP promedio anual ($h/día$)**.
- `outputs.solrad_monthly`: Array de 12 valores mensuales con la irradiancia diaria promedio en el plano inclinado ($\text{kWh/m}^2\cdot\text{día}$).
- **Mes Crítico**: Se calcula programáticamente como $\min(\text{solrad\_monthly})$ y se identifica el mes correspondiente (ej. mes con $5.2\text{ h/día}$).
- `outputs.ac_monthly` y `outputs.ac_annual`: Generación energética normalizada para alimentar las proyecciones y gráficos.

### 3.3. Manejo de Errores, Contingencia y Caché (Cumplimiento Rúbrica B3)
1. **Manejo de Errores**:
   - Bloque `try / catch` en la petición `fetch()`. Si la red no está disponible, la clave es rechazada o el código HTTP $\neq 200$, la aplicación captura el error sin interrumpir el funcionamiento.
2. **Contingencia Automática**:
   - Si la consulta remota falla, el sistema conmuta automáticamente a la **Base de Datos Local** (`solar_db.js`), seleccionando el caso más cercano o el caso de prueba estandarizado (Nazareth), indicándolo con una alerta visual: *"Modo contingencia activado: datos obtenidos de la base local"*.
3. **Caché en Sesión (`sessionStorage`)**:
   - Antes de realizar cualquier petición, se genera una clave hash con los parámetros de consulta (`lat_lon_tilt_azimuth_array_losses`). Si la consulta ya fue realizada en la sesión actual, se entrega el resultado desde memoria inmediatamente sin consumir el límite horario de la API (1,000 peticiones/hora).
4. **Trazabilidad**:
   - Se registra en el estado del proyecto la fuente de datos utilizada (`API PVWatts v8` o `Base Local`), la fecha y hora de la consulta, y los parámetros exactos.

---

## 4. Modelo Matemático y Fórmulas de Ingeniería

### 4.1. Potencia Pico Requerida ($P_{pico}$)
$$P_{pico}\text{ [kWp]} = \frac{E_d\text{ [kWh/día]}}{HSP\text{ [h]} \times PR}$$

- **Dimensionamiento por Promedio Anual**: Usa $HSP_{anual}$ obtenido de `solrad_annual`.
  - Caso de prueba: $P_{pico} = \frac{7.580}{5.8 \times 0.70} = 1.867\text{ kWp} \approx 1.87\text{ kWp}$
- **Dimensionamiento por Mes Crítico**: Usa $HSP_{crítico}$ obtenido del mínimo de `solrad_monthly`.
  - Caso de prueba: $P_{pico} = \frac{7.580}{5.2 \times 0.70} = 2.082\text{ kWp} \approx 2.08\text{ kWp}$
- **Con Parámetros Asumidos Provisionales ($HSP=5.5\text{ h}$, $PR=0.80$)**:
  - $P_{pico} = \frac{7.580}{5.5 \times 0.80} = 1.723\text{ kWp} \approx 1.72\text{ kWp}$

### 4.2. Número de Módulos y Potencia Instalada
$$N_{mod} = \left\lceil \frac{P_{pico}\text{ [Wp]}}{P_{mod}\text{ [Wp]}} \right\rceil$$
$$P_{instalada}\text{ [kWp]} = \frac{N_{mod} \times P_{mod}}{1000}$$
$$\text{Excedente/Déficit [Wp]} = (N_{mod} \times P_{mod}) - P_{pico}\text{ [Wp]}$$
$$\text{Excedente/Déficit [\%]} = \frac{P_{instalada} - P_{pico}}{P_{pico}} \times 100\%$$

### 4.3. Configuración de Cadenas (Strings) y Tensión Máxima
1. **Tensión de Circuito Abierto del Módulo a Temperatura Mínima ($T_{min}$)**:
   $$V_{oc,mod}(T_{min}) = V_{oc,STC} \cdot \left[1 + \frac{\beta_{Voc}}{100} \cdot (T_{min} - 25^\circ\text{C})\right]$$
2. **Límite de Módulos en Serie ($N_{s,max}$)**:
   $$N_{s,max} = \left\lfloor \frac{V_{max,sistema}}{V_{oc,mod}(T_{min})} \right\rfloor$$
3. **Distribución en Serie/Paralelo**:
   - $N_{serie} \le N_{s,max}$
   - $N_{mod} = N_{serie} \times N_{paralelo}$ (organizado en cadenas simétricas viables).

### 4.4. Temperatura de Celda y Tensión $V_{mp}$ en Operación
1. **Temperatura de Celda en Operación ($T_{celda}$)**:
   $$T_{celda} = T_a + \frac{NOCT - 20^\circ\text{C}}{800\text{ W/m}^2} \times G \quad (G = 1000\text{ W/m}^2)$$
   Para $T_a = 32^\circ\text{C}$, $NOCT = 45^\circ\text{C}$:
   $$T_{celda} = 32 + \frac{45 - 20}{800} \times 1000 = 63.25^\circ\text{C} \approx 63.2^\circ\text{C}$$
2. **Tensión $V_{mp}$ del Generador a Temperatura de Operación**:
   $$V_{mp,mod}(T_{celda}) = V_{mp,STC} \cdot \left[1 + \frac{\beta_{Voc}}{100} \cdot (T_{celda} - 25^\circ\text{C})\right]$$
   $$V_{mp,gen} = N_{serie} \times V_{mp,mod}(T_{celda})$$

### 4.5. Corrientes del Generador y Criterio NTC 2050 art. 690-8
1. **Corriente de Cortocircuito del Generador**:
   $$I_{sc,gen} = N_{paralelo} \times I_{sc,STC}$$
2. **Corriente de Diseño (Sobredimensionamiento de seguridad)**:
   $$I_{diseño} = 1.25 \times 1.25 \times I_{sc,gen} = 1.5625 \times I_{sc,gen}$$
3. **Corriente de Máxima Potencia**:
   $$I_{mp,gen} = N_{paralelo} \times I_{mp,STC}$$

### 4.6. Área del Generador y Verificación de Espacio
$$Área_{gen}\text{ [m}^2\text{]} = N_{mod} \times Área_{mod}$$
$$\text{Cumplimiento} = \begin{cases} \text{Aprobado (Cabe)}, & Área_{gen} \le Área_{disponible} \\ \text{Rechazado (No cabe)}, & Área_{gen} > Área_{disponible} \end{cases}$$

---

## 5. Base de Datos de Paneles: Las 3 Referencias Iniciales

El catálogo se estructura de manera editable e independiente en `js/modules_db.js` / `data/modules.json`:

| Parámetro | Panel 1 (Ideal 12V) | Panel 2 (Ideal 24V) | Panel 3 (Caso Prueba 48V/On-Grid) |
|---|:---:|:---:|:---:|
| **Potencia Pico ($P_{max}$)** | 150 Wp | 330 Wp | 550 Wp |
| **Celdas en serie** | 36 | 72 | 72 |
| **$V_{oc}$ (STC)** | 22.5 V | 45.5 V | 49.5 V |
| **$I_{sc}$ (STC)** | 8.8 A | 9.3 A | 14.0 A |
| **$V_{mp}$ (STC)** | 18.2 V | 37.8 V | 41.5 V |
| **$I_{mp}$ (STC)** | 8.2 A | 8.7 A | 13.3 A |
| **Coef. Temp. $V_{oc}$ ($\beta$)** | -0.32 %/°C | -0.30 %/°C | -0.27 %/°C |
| **Coef. Temp. $I_{sc}$ ($\alpha$)** | +0.05 %/°C | +0.06 %/°C | +0.05 %/°C |
| **Coef. Temp. $P_{mp}$ ($\gamma$)** | -0.40 %/°C | -0.38 %/°C | -0.35 %/°C |
| **NOCT** | 45 °C | 45 °C | 45 °C |
| **Área unitaria** | 1.0 m² | 1.95 m² | 2.58 m² |
| **Eficiencia** | 15.0 % | 16.9 % | 21.3 % |

---

## 6. Estructura de Archivos a Crear y Modificar

```
Reto01-ESFV/
├── index.html                  ← Macro-navegación ("Requerimiento" / "Dimensionamiento") y vistas del Reto 02
├── css/
│   └── styles.css              ← Estilos de macro-tabs, inputs de PVWatts, tarjetas de paneles y semáforos de área
├── data/
│   ├── modules.json            ← Catálogo editable de módulos fotovoltaicos
│   └── solar_locations.json    ← Base de datos local de irradiación (5 ciudades documentadas para contingencia)
├── js/
│   ├── app.js                  ← Estado global unificado (Reto 01 + Reto 02)
│   ├── pvwatts_service.js      ← Servicio de integración con API PVWatts v8, caché y contingencia
│   ├── solar_db.js             ← Base de datos solar local de contingencia
│   ├── sizing.js               ← Motor de cálculo fotovoltaico (térmico, strings, corrientes, área)
│   ├── modules_db.js           ← Catálogo y comparador de paneles
│   ├── sizing_ui.js            ← Interfaz interactiva de dimensionamiento, tabla comparativa y alertas
│   └── report.js               ← Informe PDF integrado de 1 página con sección de demanda y generador FV
```

---

## 7. Verificación del Caso de Prueba Estandarizado (Nazareth, Alta Guajira)

El sistema validará automáticamente contra los valores de referencia del PDF:
- **Demanda heredada**: $E_d = 7.580\text{ kWh/día}$, $P_{max} = 910\text{ W}$, Ventana solar: $5.180\text{ kWh}$ dentro, $2.400\text{ kWh}$ fuera.
- **PVWatts / Caso de prueba**: $HSP_{anual} = 5.8\text{ h}$, $HSP_{crítico} = 5.2\text{ h}$.
- **Con Panel 3 (550 Wp)**, $PR = 0.70$, $T_{min} = 20^\circ\text{C}$, $V_{max} = 600\text{ V}$:
  - $P_{pico} = 1.87\text{ kWp}$ (Promedio anual) y $2.08\text{ kWp}$ (Mes crítico).
  - Módulos necesarios: 4 unidades ($2.20\text{ kWp}$, $+17.8\%$ sobre anual, $+5.6\%$ sobre mes crítico).
  - $V_{oc}(20^\circ\text{C}) = 50.17\text{ V}$. Límite serie = 11 módulos. Configuración: 1 cadena de 4 módulos ($V_{oc,gen} = 200.7\text{ V}$).
  - $T_{celda} = 63.2^\circ\text{C}$, $V_{mp,gen} = 148.9\text{ V}$.
  - $I_{sc,gen} = 14.0\text{ A}$, $I_{diseño} = 21.9\text{ A}$ ($1.5625 \times I_{sc}$).
  - Área del generador = $10.32\text{ m}^2$ (cabe en los $20\text{ m}^2$ disponibles).
  - Energía diaria estimada = $8.93\text{ kWh/día}$.
