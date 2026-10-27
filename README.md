# Aplicación web para la planeación de sistemas fotovoltaicos

Bienvenido al manual y guía interactiva de la **Aplicación Web para la Planeación de Sistemas Fotovoltaicos**. Esta herramienta ha sido diseñada con rigor ingenieril y pedagógico para cubrir de manera integral el flujo de diseño solar fotovoltaico: desde la caracterización horaria de la demanda energética hasta el dimensionamiento técnico del generador fotovoltaico, la evaluación del recurso solar y las validaciones normativas de seguridad eléctrica.

El objetivo de esta guía es permitir que cualquier usuario, sin importar si nunca antes ha interactuado con la interfaz, pueda operar la herramienta con total fluidez, interpretar sus resultados y tomar decisiones técnicas fundamentadas.

---

## Índice General

1. [Visión General de la Interfaz y Controles Globales](#1-visión-general-de-la-interfaz-y-controles-globales)
2. [Reto01 - Requerimiento (Caracterización de Demanda Eléctrica)](#reto01---requerimiento)
   - [2.1 ¿Qué hace esta sección?](#21-qué-hace-esta-sección)
   - [2.2 Paso a paso: Información del Proyecto](#22-paso-a-paso-información-del-proyecto)
   - [2.3 Configuración de Franjas Día / Noche](#23-configuración-de-franjas-día--noche)
   - [2.4 Cómo crear y gestionar el Cuadro de Cargas](#24-cómo-crear-y-gestionar-el-cuadro-de-cargas)
   - [2.5 Frecuencias de uso (Globales vs. Específicas)](#25-frecuencias-de-uso-globales-vs-específicas)
   - [2.6 Casos de Ejemplo Predefinidos](#26-casos-de-ejemplo-predefinidos)
   - [2.7 Resultados y Métricas de Demanda](#27-resultados-y-métricas-de-demanda)
   - [2.8 Informe, Exportación a Excel y Persistencia](#28-informe-exportación-a-excel-y-persistencia)
3. [Reto02 - Dimensionamiento Solar (Generador Fotovoltaico)](#reto02---dimensionamiento-solar)
   - [3.1 ¿Qué hace esta sección?](#31-qué-hace-esta-sección)
   - [3.2 Datos Heredados del Reto 01](#32-datos-heredados-del-reto-01)
   - [3.3 Coincidencia de Demanda en Ventana Solar](#33-coincidencia-de-demanda-en-ventana-solar)
   - [3.4 Ubicación Geográfica y Selección de Plataformas de Recurso Solar](#34-ubicación-geográfica-y-selección-de-plataformas-de-recurso-solar)
   - [3.5 Casos de Estudio con Parámetros Fijos vs. Coordenadas Libres](#35-casos-de-estudio-con-parámetros-fijos-vs-coordenadas-libres)
   - [3.6 Cálculos Térmicos y Tensiones de Seguridad (Voc y Vmp)](#36-cálculos-térmicos-y-tensiones-de-seguridad-voc-y-vmp)
   - [3.7 Selección y Edición de Parámetros del Módulo Fotovoltaico](#37-selección-y-edición-de-parámetros-del-módulo-fotovoltaico)
   - [3.8 Metodología de Cálculo del Dimensionamiento](#38-metodología-de-cálculo-del-dimensionamiento)
   - [3.9 Comparativa de Tecnologías y Proyecciones Gráficas](#39-comparativa-de-tecnologías-y-proyecciones-gráficas)
   - [3.10 Gestión del Proyecto e Informe Ejecutivo en Dimensionamiento](#310-gestión-del-proyecto-e-informe-ejecutivo-en-dimensionamiento)
4. [Ecuaciones y Metodología de Cálculo](#4-ecuaciones-y-metodología-de-cálculo)

---

## 1. Visión General de la Interfaz y Controles Globales

La interfaz está dividida en dos macro-etapas accesibles desde la barra superior de navegación:

- **Etapa 1: Requerimiento:** Caracterización horaria de demanda, cuadro de cargas, estimación de costos y perfil 24 h.
- **Etapa 2: Dimensionamiento:** Recurso solar (PVGIS/PVWatts/Continental), cálculo de módulos, tensiones de seguridad y generación.

### Controles de la Cabecera Superior:
- **Botón `ES` / `EN` (Idioma):** Permite alternar instantáneamente todo el entorno de trabajo entre **Español** e **Inglés**. Todas las etiquetas, tablas, gráficos e informes se traducen conservando la terminología técnica estándar del sector solar (*Peak Sun Hours, Tilt, Azimuth, Performance Ratio, etc.*). Su preferencia queda guardada en el navegador.
- **Botón `🌙 Modo Oscuro` / `☀️ Modo Claro`:** Alterna la paleta cromática entre alto contraste oscuro profesional y modo claro de alta luminosidad.
- **Botón `⚙️ Configuración`:** Abre una ventana modal con dos pestañas:
  1. *APIs y Servicios:* Permite ingresar las claves de API (PVWatts/NREL y NASA POWER) y seleccionar el modo de origen de datos solares (API en línea o Base de Datos Manual Continental).
  2. *Ecuaciones Generales y Metodología:* Detalla paso a paso las fórmulas matemáticas aplicadas en los cálculos solares y térmicos.

---

## Reto01 - Requerimiento

### 2.1 ¿Qué hace esta sección?
La sección de **Requerimiento** modela con exactitud el comportamiento de consumo energético del usuario final. Transforma una lista de artefactos eléctricos en:
1. Una curva horaria de demanda (perfil de 24 horas).
2. Los consumos de energía acumulada en escala diaria ($E_d$), mensual ($E_m$) y anual ($E_a$).
3. La potencia instalada total ($P_{inst}$) y la demanda máxima simultánea pico ($P_{max}$).
4. La clasificación horaria del consumo respecto al ciclo solar (diurno, nocturno o mixto).
5. La estimación económica del costo de la energía consumida con base en la tarifa local regulada (COP/kWh).

---

### 2.2 Paso a paso: Información del Proyecto
1. Diríjase a la pestaña **📋 Proyecto** en el menú de la Etapa 1.
2. Complete los campos del formulario:
   - **Nombre del Proyecto:** Identificador legible (ej. *Vivienda Unifamiliar García*, *Laboratorio Hangar A*).
   - **ID del Proyecto:** Código de referencia para reportes técnicos (ej. *SOLAR-2026-001*).
   - **Integrantes:** Nombres de los evaluadores o diseñadores a cargo.
   - **Fecha:** Fecha del estudio (por defecto toma el día actual).
   - **Tipo de Instalación:** Seleccione entre *Residencial (límite normativo de 600 V según NTC 2050)* o *Industrial (límite de 1000 V)*.
   - **Tipo de Aplicación:** Seleccione el esquema del sistema:
     - *Off-Grid (Aislado de la red)*: Requiere almacenamiento en baterías.
     - *On-Grid (Conectado a la red)*: Inyección y autoconsumo sin baterías obligatorias.
     - *Híbrido Off-Grid* o *Híbrido On-Grid*: Combinación de fuentes y red con respaldo.

---

### 2.3 Configuración de Franjas Día / Noche
Debajo del formulario de proyecto, encontrará el panel **Configuración Día / Noche**:
- **Inicio del Día:** Hora estándar a la que inicia la actividad y radiación diurna (predeterminado: `06:00 h`).
- **Inicio de la Noche:** Hora en la que concluye la radiación solar útil (predeterminado: `18:00 h`).
- **Visualizador 24 h:** Una barra horizontal interactiva muestra el bloque diurno en color ámbar solar y el bloque nocturno en azul oscuro. Esta configuración define automáticamente el criterio de clasificación de las cargas.

---

### 2.4 Cómo crear y gestionar el Cuadro de Cargas
Haga clic en la pestaña **⚡ Cuadro de Cargas**. Aquí registrará cada artefacto o equipo eléctrico:

#### Pasos para registrar una carga:
1. **Descripción:** Ingrese el nombre del equipo (ej. *Refrigerador No-Frost*, *Luminarias LED*, *Bomba de agua*).
2. **Cantidad:** Número de unidades idénticas que operan bajo el mismo patrón (debe ser $\ge 1$).
3. **Potencia Unitaria (W):** Potencia nominal por unidad en Vatios (ej. *15 W* para bombillos, *250 W* para refrigerador).
4. **Horario de Uso (Franjas Horarias):**
   - Seleccione la **Hora Inicio** y la **Hora Fin** en los selectores desplegables (resolución de 1 hora).
   - Haga clic en el botón **＋ Agregar Franja**.
   - *Cruces de medianoche:* La aplicación admite franjas nocturnas continuas que cruzan la medianoche (por ejemplo, desde las `22:00` hasta las `06:00`). La herramienta divide y calcula las horas correspondientes sin requerir que usted cree dos cargas distintas.
   - *Franjas discontinuas:* Si un artefacto se enciende en la mañana (`07:00 – 09:00`) y en la noche (`18:00 – 21:00`), simplemente agregue ambas franjas a la misma carga.
5. **Días/Mes y Meses/Año (Opcionales):** Déjelos en blanco si la carga sigue la frecuencia estándar del proyecto (ej. 30 días/mes y 12 meses/año). Si es un equipo estacional (ej. aire acondicionado usado solo ciertos meses), especifique los valores puntuales.
6. Haga clic en el botón **＋ Agregar Carga**.
7. En la tabla inferior verá la carga con su potencia total calculada, horas/día de uso, clasificación y acciones disponibles:
   - **✏️ Editar:** Carga los datos de nuevo en el formulario para modificarlos.
   - **🗑️ Eliminar:** Retira la carga y recalcula automáticamente todos los balances en tiempo real.

---

### 2.5 Frecuencias de uso (Globales vs. Específicas)
- En la parte superior del cuadro de cargas existe una tarjeta de **Frecuencia de Operación por Defecto**:
  - *Días de operación / mes (por defecto):* Suele fijarse en 30 días.
  - *Meses de operación / año (por defecto):* Suele fijarse en 12 meses.
- Si una carga individual tiene sus propios días o meses asignados, sus proyecciones de energía mensual y anual se calcularán con sus valores específicos, respetando las diferencias de operación de cada equipo.

---

### 2.6 Casos de Ejemplo Predefinidos
En la barra superior de casos encontrará accesos directos certificados:
- **⭐ Caso Estándar (Nazareth, Alta Guajira):** Estación de Monitoreo Ambiental de la Alta Guajira (12.18° N, 71.28° O). Caso de referencia oficial canónico (Reto 01 & Reto 02) con 8 cargas continuas y cíclicas (Sensor meteorológico, Datalogger, Computador portátil, Radio VHF, Iluminación LED exterior, Ventilador de gabinete, Cargador de baterías y Bomba de agua). Produce exactamente $E_d = 7,580\text{ kWh/día}$ ($5,180\text{ kWh/día}$ en ventana solar 06–18 h y $2,400\text{ kWh/día}$ fuera de ventana), potencia instalada total de $1505\text{ W}$, demanda máxima simultánea de $910\text{ W}$ a las 17:00 h, consumo mensual de $227.40\text{ kWh/mes}$, y costos de $\$9,096\text{ COP/día}$ ($\$272,800/\text{mes}$ con $CU = 1,200\text{ COP/kWh}$).
- **Caso 1 (Santa Marta):** Laboratorio de Electrónica Análoga y Digital - Hangar A (11.225°, -74.185°). Carga automáticamente la lista real de computadores, iluminación y equipos de laboratorio.
- **Caso 2 (Villavicencio):** Cargas típicas residenciales/comerciales en el piedemonte llanero (4.127°, -73.636°).
- **Caso 3 (Bogotá):** Perfil de consumo en clima frío de sabana (4.670°, -74.120°).
- **Caso 4 (Barranquilla):** Perfil caribeño con alta demanda diurna de ventilación y refrigeración (10.933°, -74.778°).
- **Caso 5 (Pasto):** Demanda en zona andina de montaña (1.158°, -77.276°).
- **Coordenadas Libres:** Limpia el bloqueo y permite configurar cualquier proyecto personalizado desde cero.

> **Nota:** Al hacer clic en cualquiera de estos casos, se actualizan simultáneamente las cargas, el perfil 24 h y todos los parámetros enlazados en el dimensionamiento solar.

---

### 2.7 Resultados y Métricas de Demanda
Al hacer clic en la pestaña **📊 Resultados**, observará:
- **Tarjetas KPI Principales:**
  - **Potencia Instalada ($P_{inst}$):** Suma aritmética simple de todas las potencias ($\sum N_i \times P_i$).
  - **Demanda Máxima Simultánea ($P_{max}$):** El pico de mayor consumo coincidente a lo largo de las 24 horas del día.
  - **Energía Diaria ($E_d$):** Consumo promedio acumulado en un día típico (kWh/día).
  - **Energía Mensual ($E_m$):** Proyección del consumo mensual (kWh/mes).
  - **Energía Anual ($E_a$):** Consumo anual acumulado (kWh/año).
- **Gráfico de Perfil 24 Horas:** Visualiza hora a hora la demanda de potencia. Puede alternar entre gráfico de **Área** continua o de **Barras** mediante el botón interactivo.
- **Estimación de Costos:** Permite ingresar el Costo Unitario de la energía ($CU$ en COP/kWh, por defecto 890 COP/kWh) y calcula de forma inmediata el costo diario, mensual y anual de la factura eléctrica.

---

### 2.8 Informe, Exportación a Excel y Persistencia
En la pestaña **📄 Informe**:
- **Guardar Proyecto (.json):** Descarga un archivo con toda la información (datos de proyecto, cuadro de cargas completo, configuraciones y cálculos de dimensionamiento).
- **Cargar Proyecto:** Permite subir un archivo `.json` previamente guardado para restaurar exactamente el estado del sistema.
- **Generar Informe PDF:** Abre una vista previa de alta calidad lista para imprimir o guardar como PDF, incluyendo encabezados institucionales, resumen ejecutivo, tabla de cargas y gráficos.
- **Descargar Excel (.xlsx) / Importar Excel:** Exporta o importa la tabla de cargas en formato de hoja de cálculo compatible con Microsoft Excel y Google Sheets.

---

## Reto02 - Dimensionamiento Solar

### 3.1 ¿Qué hace esta sección?
La sección de **Dimensionamiento** (accesible mediante el botón superior **Etapa 2: Dimensionamiento**) calcula y dimensiona el generador solar fotovoltaico necesario para suplir la demanda calculada en el Reto 01.

Integra datos meteorológicos satelitales en tiempo real, evalúa el comportamiento térmico de los paneles solares bajo condiciones extremas y reales, comprueba los límites de tensión eléctrica según la norma técnica colombiana **NTC 2050** y compara el desempeño de distintos modelos comerciales de paneles solares.

---

### 3.2 Datos Heredados del Reto 01
Al ingresar a la Etapa 2, lo primero que encontrará es la tarjeta **Datos Heredados de la Caracterización de Demanda**. 
- Esta tarjeta muestra una etiqueta verde **`✓ Sincronizado en Memoria`**.
- Los valores de **Energía Diaria ($E_d$)**, **Demanda Máxima ($P_{max}$)**, **Energía Mensual ($E_m$)** y **Energía Anual ($E_a$)** se transfieren automáticamente desde el Reto 01.
- No es necesario volver a digitar ni un solo dato de consumo. Si modifica una carga en el Reto 01, el dimensionamiento se actualiza de inmediato.

---

### 3.3 Coincidencia de Demanda en Ventana Solar
Dentro de la misma tarjeta de datos heredados, se analiza la **Ventana Solar (06:00 – 18:00 h)**:
- Una barra gráfica interactiva clasifica la energía consumida durante las horas de sol frente a la energía consumida en horas nocturnas.
- **Implicación ingenieril:**
  - Si el porcentaje *Dentro de Ventana Solar* es alto, el sistema opera con un alto nivel de autoconsumo directo diurno.
  - Si el porcentaje *Fuera de Ventana (Nocturno)* es elevado, el dimensionamiento de un sistema aislado requerirá un banco de baterías significativamente mayor para almacenar la energía requerida en la noche.

---

### 3.4 Ubicación Geográfica y Selección de Plataformas de Recurso Solar
En la tarjeta **Recurso Solar**, usted puede elegir qué motor de datos climatológicos utilizar mediante los tres botones del selector superior:

```
[ 🌐 PVGIS (Ángulos Óptimos) ]   [ ⚡ NREL PVWatts v8 ]   [ 🌍 Base Continental ]
```

A continuación se detallan las implicaciones técnicas y diferencias de cada plataforma:

| Plataforma / Motor | Origen de los Datos | Clave de API requerida | Tipo de Irradiancia | Características Clave |
|---|---|---|---|---|
| **PVGIS (Comisión Europea)** *(Recomendado)* | Satélites SARAH / ERA5 (JRC Comisión Europea) | **No** (Público y gratuito) | **$H_{POA}$ (Plano Inclinado)** | Calcula de forma analítica el **ángulo de inclinación (*Tilt*) y orientación (*Azimut*) óptimos** para maximizar la captación anual. Es el estándar de mayor resolución para Europa, África y América. |
| **NREL PVWatts v8** | National Renewable Energy Laboratory (EE. UU.) | **Opcional** (Clave propia en Configuración) | **$H_{POA}$ (Simulación horario/mensual)** | Motor de cálculo ampliamente utilizado en Norteamérica. Simula pérdidas por suciedad, cableado e inversor. |
| **Base de Datos Continental** | Registros climatológicos continentales consolidados | **No** (Funciona 100% Offline) | **$GHI$ (Superficie Horizontal)** | Modo de respaldo garantizado si las APIs remotas no responden o no hay conexión a internet. Los datos representan radiación en plano horizontal. |

#### Cómo ingresar o cambiar coordenadas:
1. Asegúrese de estar en modo **Coordenadas Libres** (en la barra superior de casos) para poder editar los campos.
2. Ingrese la **Latitud (°)** y **Longitud (°)** del sitio del proyecto.
3. Si usa **PVGIS**, haga clic en **🌐 Consultar PVGIS**:
   - La API calculará los 12 meses de radiación solar en Horas Solar Pico ($HSP$ en $\text{kWh/m}^2/\text{día}$).
   - Calculará el **Tilt óptimo** y el **Azimut óptimo** específicos para esa coordenada.
4. Si prefiere ajustar manualmente la inclinación o la orientación, modifique los campos **Inclinación de Módulos (Tilt °)** y **Azimut (°)**.
5. Los indicadores mostrarán:
   - **HSP Anual Promedio:** Media de radiación a lo largo de los 12 meses.
   - **HSP Mes Crítico:** El mes de peor radiación del año (mes de diseño para sistemas aislados).
   - **HSP Mes Máximo:** El mes de mayor radiación.

---

### 3.5 Casos de Estudio con Parámetros Fijos vs. Coordenadas Libres
- **⭐ Caso Estándar (Nazareth, Alta Guajira):**
  - **Módulo de Referencia Oficial Exclusivo:** En este caso se utiliza **únicamente el módulo declarado de 550 Wp** (72 celdas en serie, $2.58\text{ m}^2$, $V_{oc} = 49.5\text{ V}$, $I_{sc} = 14.0\text{ A}$, $V_{mp} = 41.5\text{ V}$, $I_{mp} = 13.3\text{ A}$, $\beta = -0.27\%/^\circ\text{C}$, $\alpha = +0.05\%/^\circ\text{C}$, $\gamma = -0.35\%/^\circ\text{C}$, $\text{NOCT} = 45^\circ\text{C}$, Eficiencia $21.3\%$). **No se da opción de elegir otros módulos ni modificar la ficha técnica**, garantizando que todos los estudiantes y grupos evalúen exactamente la misma base canónica.
  - Parámetros certificados: Latitud $12.18^\circ\text{ N}$, Longitud $-71.28^\circ\text{ O}$, Inclinación $12^\circ$ al sur, Azimut $0^\circ$, Irradiación anual declarada $5.8\text{ kWh/m}^2\cdot\text{día}$, Irradiación mes crítico $5.2\text{ kWh/m}^2\cdot\text{día}$, $PR = 0.70$, Tensión máxima $600\text{ V}$ (Residencial NTC 2050), $T_{min} = 20^\circ\text{C}$, $T_{amb,op} = 32^\circ\text{C}$ y Área disponible de $20\text{ m}^2$.
- **Casos 1, 2, 3, 4 y 5:**
  - Los campos de coordenadas (Latitud, Longitud), Inclinación, Azimut y Temperaturas quedan **bloqueados y protegidos** (aparece un banner informativo 🔒).
  - Esto garantiza que los casos didácticos conserven los valores certificados de referencia.
  - **Variables de diseño:** En estos casos, el usuario tiene completa libertad para ajustar el **Área Disponible en Techo ($m^2$)**, el **Performance Ratio ($PR$)** y seleccionar el panel solar a instalar entre las 3 referencias de catálogo disponibles.
- **🌐 Coordenadas Libres:**
  - Si desea realizar un estudio en cualquier otra parte del mundo, haga clic en el botón **🌐 Coordenadas Libres**, lo cual desbloqueará todos los controles de entrada y permitirá modificar coordenadas, orientación, temperaturas e inclinación libremente.

---

### 3.6 Cálculos Térmicos y Tensiones de Seguridad (Voc y Vmp)

Los paneles solares pierden tensión cuando aumenta la temperatura y aumentan su tensión en frío extremo. La aplicación realiza dos verificaciones térmicas críticas:

#### 1. ¿Dónde consultar las temperaturas y fórmulas?
- En la tarjeta de **Recurso Solar**, se consultan las temperaturas mediante la API satelital **NASA POWER**:
  - **$T_{min}$ Histórica:** Temperatura ambiente mínima más extrema registrada en la ubicación durante los últimos 20 años.
  - **$T_{amb}$ Operación:** Temperatura ambiente media diurna de operación en el sitio.
- Para ver el detalle metodológico de las ecuaciones, haga clic en el botón superior **⚙️ Configuración** y seleccione la pestaña **📐 Ecuaciones Generales y Metodología**.

#### 2. Cálculo de Tensión de Circuito Abierto a Temperatura Mínima ($V_{oc,min}$):
Es la máxima tensión que el generador solar puede entregar al inversor o controlador en la madrugada más fría registrada. Para evitar destruir el equipo, debe verificarse que:

$$V_{oc}(T_{min}) = N_s \times \left[ V_{oc,STC} + \alpha_{Voc} \times (T_{min} - 25^\circ\text{C}) \right] \le V_{max,sistema}$$

Donde:
- $N_s$: Número de módulos conectados en serie en cada cadena (*string*).
- $V_{oc,STC}$: Tensión de circuito abierto a condiciones estándar ($25^\circ\text{C}$).
- $\alpha_{Voc}$: Coeficiente de temperatura de la tensión (en $\text{V}/^\circ\text{C}$).
- $V_{max,sistema}$: Límite de seguridad según la norma **NTC 2050** ($600\text{ V}$ para instalaciones residenciales y $1000\text{ V}$ para industriales). La aplicación muestra un badge que confirma si la configuración cumple o excede este valor.

#### 3. Cálculo de Temperatura de Celda ($T_c$) y Tensión de Operación Real ($V_{mp,real}$):
En condiciones reales de operación al mediodía con radiación $G = 800\text{ W/m}^2$, la celda se calienta por encima de la temperatura ambiente:

$$T_c = T_{amb} + \left( \frac{\text{NOCT} - 20^\circ\text{C}}{800\text{ W/m}^2} \right) \times G$$

$$\Delta T = T_c - 25^\circ\text{C}$$

$$V_{mp,real} = N_s \times \left[ V_{mp,STC} + \gamma_{Vmp} \times \Delta T \right]$$

La aplicación muestra este valor en tiempo real para verificar que el inversor trabaje dentro de su ventana de seguimiento de máxima potencia (MPPT).

---

### 3.7 Selección y Edición de Parámetros del Módulo Fotovoltaico
En la tarjeta **3. Selección del Generador Fotovoltaico**:
- Puede seleccionar entre diversos paneles comerciales (por ejemplo: Monocristalinos de 150 W, 330 W, 450 W, 550 W bifaciales, etc.).
- Para editar la ficha técnica del módulo seleccionado, haga clic en el botón **✏️ Editar Módulo Actual**:
  - Se abrirá la ventana modal **Editor de Parámetros del Módulo Fotovoltaico**.
  - Puede modificar: $P_{max}$, $V_{oc}$, $V_{mp}$, $I_{sc}$, $I_{mp}$, NOCT ($^\circ\text{C}$), Coeficiente térmico de $V_{oc}$ ($\text{V}/^\circ\text{C}$ o $\% /^\circ\text{C}$), Área del módulo ($m^2$) y Número de celdas en serie.
  - Al guardar los cambios, todo el dimensionamiento se recalculará instantáneamente con las nuevas características eléctricas.

---

### 3.8 Metodología de Cálculo del Dimensionamiento
En la tarjeta **4. Resultados del Dimensionamiento — Generador FV**, la aplicación calcula:

1. **Potencia Pico Requerida ($P_{pico}$):**
   $$P_{pico}\text{ (kWp)} = \frac{E_d\text{ (kWh/día)}}{\text{HSP}\text{ (h/día)} \times \text{PR}}$$
   *(Donde $PR$ es el Performance Ratio o factor de desempeño del sistema, típicamente entre 0.75 y 0.80).*

2. **Criterio de Dimensionamiento:**
   - **Mes Crítico (Conservador / Recomendado):** Utiliza las HSP del mes con menor radiación del año. Garantiza que el sistema cubrirá la demanda incluso en la temporada más desfavorable (indispensable en sistemas aislados sin red).
   - **Promedio Anual (Equilibrado):** Utiliza el promedio de las 12 HSP del año. Ideal para sistemas conectados a red donde los excedentes de los meses soleados compensan los meses de baja radiación.

3. **Número de Módulos Requeridos por Energía ($N_{mod,energia}$):**
   $$N_{mod,energia} = \left\lceil \frac{P_{pico}\text{ (W)}}{P_{mod}\text{ (W)}} \right\rceil$$

4. **Número Máximo de Módulos por Área ($N_{mod,area}$):**
   $$N_{mod,area} = \left\lfloor \frac{\text{Área Disponible (m}^2\text{)}}{\text{Área de un Módulo (m}^2\text{)}} \right\rfloor$$

5. **Módulos Recomendados:**
   La aplicación compara ambos valores y emite una alerta inteligente:
   - Si $N_{mod,energia} \le N_{mod,area}$: El techo es suficiente. Se aprueba la instalación.
   - Si $N_{mod,energia} > N_{mod,area}$: El área es insuficiente. La aplicación advierte el déficit y calcula el porcentaje de cobertura que alcanzará con el área disponible.

---

### 3.9 Comparativa de Tecnologías y Proyecciones Gráficas
- **Tabla Comparativa de Módulos Alternativos (Tarjeta 5):** Presenta una matriz simultánea comparando tres módulos de distinta potencia y tecnología, indicando la cantidad de paneles requeridos para cada uno, la potencia pico resultante y el área total que ocuparía cada alternativa.
- **Gráfico de Proyección de Generación vs. Demanda (Tarjeta 6):**
  - **Vista Mensual:** Muestra mes a mes la energía solar generada frente a la demanda eléctrica consumida, identificando con claridad meses de superávit energético y meses críticos.
  - **Vista Anual:** Muestra el balance anual consolidado y el factor de cobertura global.

---

### 3.10 Gestión del Proyecto e Informe Ejecutivo en Dimensionamiento
Al final de la Etapa 2 se encuentra la **Tarjeta 7: Gestión del Proyecto e Informe Ejecutivo**:
- Permite hacer clic en **📄 Generar Informe PDF**, **💾 Guardar Proyecto (.json)**, **📂 Cargar Proyecto** o **📊 Exportar a Excel** directamente desde la pantalla de dimensionamiento, evitando que deba devolverse a la Etapa 1 para descargar o archivar su trabajo.

---

## 4. Ecuaciones y Metodología de Cálculo

| Concepto | Fórmula Matemática | Variables y Unidades |
|---|---|---|
| **Potencia Instalada Total** | $P_{inst} = \sum_{i=1}^n N_i \cdot P_i$ | $N_i$: cantidad de cargas, $P_i$: potencia unitaria (W) |
| **Demanda Máxima Simultánea** | $P_{max} = \max_{h \in [0, 23]} \left( \sum_{i=1}^n N_i \cdot P_i \cdot u_{i,h} \right)$ | $u_{i,h} \in \{0, 1\}$: indicador de uso en la hora $h$ |
| **Energía Diaria** | $E_d = \sum_{h=0}^{23} P(h) \cdot 1\text{ h}$ | $P(h)$: potencia consumida en la hora $h$ (Wh o kWh) |
| **Energía Mensual** | $E_m = \sum_{i=1}^n \left( N_i \cdot P_i \cdot h_{dia,i} \cdot d_{mes,i} \right)$ | $d_{mes,i}$: días de operación por mes |
| **Energía Anual** | $E_a = \sum_{i=1}^n \left( N_i \cdot P_i \cdot h_{dia,i} \cdot d_{mes,i} \cdot m_{ano,i} \right)$ | $m_{ano,i}$: meses de operación por año |
| **Potencia Pico Solar** | $P_{pico} = \frac{E_d}{\text{HSP} \cdot \text{PR}}$ | $E_d$ en kWh/día, $\text{HSP}$ en h/día, $\text{PR}$: Performance Ratio |
| **Tensión $V_{oc}$ en Frío Extremo** | $V_{oc}(T_{min}) = N_s \cdot [V_{oc,STC} + \alpha_{Voc} \cdot (T_{min} - 25^\circ\text{C})]$ | $\alpha_{Voc}$ en V/°C, $T_{min}$ en °C |
| **Temperatura de Celda** | $T_c = T_{amb} + \frac{\text{NOCT} - 20}{800} \cdot G$ | $G = 800\text{ W/m}^2$, $\text{NOCT}$ en °C |
| **Tensión $V_{mp}$ en Condiciones Reales** | $V_{mp}(T_c) = N_s \cdot [V_{mp,STC} + \gamma_{Vmp} \cdot (T_c - 25^\circ\text{C})]$ | $\gamma_{Vmp}$ en V/°C, $T_c$ en °C |

---

## 5. Arquitectura Técnica y Despliegue

La solución está construida bajo una arquitectura web moderna y desacoplada:
- **Frontend:** HTML5 semántico, CSS3 modular (con soporte nativo para temas claro/oscuro e internacionalización i18n) y JavaScript Vanilla sin dependencias pesadas.
- **Gráficos:** Motor vectorial Chart.js.
- **APIs Integradas:**
  - *PVGIS v5.2 (JRC Comisión Europea)* mediante proxy seguro Serverless en `/api/pvgis`.
  - *NASA POWER API* para climatología histórica satelital.
  - *NREL PVWatts v8* para simulación solar alternativa.
- **Despliegue en la Nube:** Preparado para despliegue sin servidor en **Vercel** (`vercel.json` y `api/pvgis.js`), garantizando HTTPS estricto y resolución de políticas de CORS sin restricciones de origen.

---

## 6. Reto 03: Conversión y Almacenamiento

La **Etapa 3** cubre el acondicionamiento de potencia eléctrica, la regulación de carga y el almacenamiento electroquímico bajo dos ramas operativas:

### 6.1 Rama con Almacenamiento (Off-Grid / Aislado / Híbrido)
- **Comparador Interactivo de Reguladores MPPT e Inversores Híbridos:** Evalúa la tensión máxima de entrada $V_{oc}(T_{min})$, el rango de arranque MPPT $[V_{mppt,min}, V_{mppt,max}]$ y la corriente máxima de carga hacia la batería. Los inversores híbridos (INV-1, INV-2 e INV-3) están integrados en el catálogo de almacenamiento.
- **Dimensionamiento de Baterías (GEL, AGM, Litio LFP):**
  - Capacidad nominal requerida en Ah y kWh útiles.
  - Configuración serie/paralelo ($N_s \times N_p$) adaptada a la tensión de bus (12V, 24V o 48V).
  - Profundidad de descarga real ($DoD_{fin}$) ante la demanda nocturna.
  - Verificación de tasas de carga ($C$-rate de recarga solar) y descarga ($C$-rate ante $P_{max}$).
  - Tiempo de recuperación ($T_{rec}$) del banco con el excedente solar diario.
  - Diagrama visual dinámico con conexiones serie/paralelo y rotulado de terminales.
- **Balance Energético de Cierre:** Cálculo del superávit o déficit del generador para recuperar el banco en $\le 3$ días, con sugerencia automática de módulos adicionales ($\Delta N$).

### 6.2 Rama sin Almacenamiento (On-Grid / Conectado a Red)
- **Comparador de Inversores de Conexión a Red:**
  - Verificación de ventana MPPT en frío y caliente.
  - Relación $DC/AC$ ($P_{dc,gen} / P_{ac,inv}$) con umbrales recomendados de $1,0$ a $1,35$ para prevenir sobrecargas o recortes excesivos (*clipping*).
  - Cumplimiento de corrientes de entrada según la NTC 2050 Sección 690-8.

---

## 7. Reto 04: Cierre del Sistema, Ficha Técnica y Escenario Grupo A

La **Etapa 4** consolida la entrega final de ingeniería según las especificaciones del periodo 2026-II:

### 7.1 Escenario Oficial del Grupo A (San Andrés Isla)
- **Ubicación:** $12,58^\circ\text{ N}, 81,70^\circ\text{ O}$ (Archipiélago de San Andrés, Providencia y Santa Catalina).
- **Régimen:** Conectado a Red (On-Grid) con tarifa regulada de **$1.200 COP/kWh** (SOPESA).
- **Área Disponible:** $30\text{ m}^2$ en cubierta.
- **8 Cargas Obligatorias:**
  - $P_{inst} = 2.530\text{ W}$
  - $E_d = 12.865\text{ Wh/día}$ ($5.390\text{ Wh}$ diurna en ventana solar 06–18 h y $7.475\text{ Wh}$ nocturna).
  - $P_{max} = 1.215\text{ W}$ a las 22:00–23:00 h (con desempate horario automático).
- **Carga Inductiva Crítica:** Bomba de agua de cisterna de 0,5 HP ($600\text{ W}$ nominales, arranque $\sim 1.800\text{ W}$).

### 7.2 Justificación Técnica del Transitorio de Arranque (Bomba 0,5 HP)
- **Modo On-Grid (Oficial):** La red pública de SOPESA actúa como bus de impedancia despreciable (fuente infinita), suministrando la corriente transitoria de arranque sin sobrecargar el generador solar ni disparar el inversor.
- **Modo Off-Grid (Respaldo):** El inversor seleccionado de 3.000 W nominales cuenta con capacidad de sobrecarga de 200% (6.000 W pico durante 5 segundos), absorbiendo holgadamente la potencia combinada simultánea ($615\text{ W} - 600\text{ W} + 1.800\text{ W} = 1.815\text{ W} \ll 6.000\text{ W}$).

### 7.3 Validación de Doble Fuente del Recurso Solar (RF-41)
- **Fuente 1 (PVGIS SARAH2 / Base Local):** $\text{HSP} = 5,32\text{ kWh/m}^2\cdot\text{d}$ (mes crítico noviembre: $4,75\text{ kWh/m}^2\cdot\text{d}$).
- **Fuente 2 (NASA POWER MERRA-2 / Atlas UPME):** $\text{HSP} = 5,48\text{ kWh/m}^2\cdot\text{d}$ (mes crítico: $4,92\text{ kWh/m}^2\cdot\text{d}$).
- **Diferencia Relativa:** $|\Delta\%| = 3,01\% \le \pm 15\%$, cumpliendo el criterio de aceptación del pliego de condiciones.
- **Contingencia Offline:** Base de datos local precargada para operación sin conexión a internet.

### 7.4 Persistencia, Exportación y Suite de Pruebas
- **Exportación Tabular CSV (RF-40):** Descarga de planilla con metadatos, cuadro de cargas, perfil horario de 24 h, indicadores globales y fichas de equipos con delimitador `;` y codificación UTF-8 BOM.
- **Informe Ejecutivo PDF de 2 Páginas:** Reporte completo con gráficos, cuadros comparativos, anexo técnico de componentes y notas metodológicas.
- **Suite de Pruebas Automáticas (RF-45):** Ejecución interactiva de 5 casos canónicos con verificación 5/5 PASS:
  1. Reto 01A (Solo Diurno: 100% solar).
  2. Reto 01B (Solo Nocturno: 100% noche).
  3. Reto 01C (Cruce de medianoche: 22:00–04:00 continuo).
  4. Caso Estandarizado (Alta Guajira: 7,58 kWh/d).
  5. Escenario Grupo A (San Andrés: 8 cargas, 2.530 W Pinst, 12.865 Wh/d, 1.215 W Pmax).
- **Manual de Usuario Integrado (RF-47):** Modal interactivo de 2 páginas con guía operativa y marco normativo.

---

## 8. Despliegue en Vercel y Política de Cero Secretos (RF-37, RF-42)

La plataforma está diseñada como una Single Page Application (SPA) estática optimizada para su despliegue inmediato en Vercel:
1. Conecte el repositorio a su cuenta de Vercel.
2. Framework Preset: `Other` (sitio estático HTML/JS/CSS).
3. Build Command: vacío (no requiere compilación).
4. Output Directory: `./` (raíz).
5. **Cero Secretos Expuestos (RF-42):** La aplicación no incluye API keys codificadas en el repositorio ni en el frontend. Si se utilizan APIs públicas (como NASA POWER o PVWatts), las peticiones se realizan de forma anónima o a través del proxy serverless en `/api/pvgis.js`.

