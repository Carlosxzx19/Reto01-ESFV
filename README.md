# Aplicación Web para la Planeación de Sistemas Fotovoltaicos

Bienvenido al manual y guía de usuario de la **Aplicación Web para la Planeación de Sistemas Fotovoltaicos**. Esta plataforma ha sido desarrollada bajo rigurosos criterios de ingeniería solar y normativa electrotécnica (conforme al pliego de especificaciones técnicas y a la norma **NTC 2050**), cubriendo el flujo metodológico completo para el diseño de proyectos solares fotovoltaicos:

1. **Reto 01 (Etapa 1 - Requerimiento):** Caracterización horaria de la demanda, cuadro de cargas, franjas día/noche, proyecciones energéticas y estimación tarifaria.
2. **Reto 02 (Etapa 2 - Dimensionamiento):** Evaluación del recurso solar satelital (PVGIS, PVWatts, Base Continental), comportamiento térmico ($V_{oc}$ y $V_{mp}$), dimensionamiento del generador FV, límites normativos y visualizador interactivo 24 h.
3. **Reto 03 (Etapa 3 - Conversión y Baterías):** Acondicionamiento de potencia (ramas Off-Grid y On-Grid), verificación eléctrica según NTC 2050 Sección 690-8, comparador de reguladores MPPT e inversores, dimensionamiento y esquema visual de baterías, balance de cierre energético y tiempos de recarga en el mejor/peor mes.
4. **Reto 04 (Etapa 4 - Componentes e Informe):** Consolidación de especificaciones de ingeniería, caso oficial del Grupo A (San Andrés Isla), justificación de transitorios inductivos, validación de doble fuente climática ($|\Delta\%| \le \pm 15\%$), exportación tabular CSV, informe técnico en PDF, manual interactivo integrado y suite de pruebas automáticas con verificación PASS.

Este documento funciona como una **guía interactiva paso a paso**. Leyéndolo de principio a fin, cualquier evaluador o estudiante podrá comprender el funcionamiento de la herramienta, saber con precisión dónde hacer clic para cada acción e interpretar los resultados con criterio ingenieril.

---

## Índice General

1. [Visión General de la Interfaz y Navegación](#1-visión-general-de-la-interfaz-y-navegación)
2. [Reto 01: Caracterización de Demanda Eléctrica (Etapa 1)](#2-reto-01-caracterización-de-demanda-eléctrica-etapa-1)
   - [2.1 ¿Qué hace esta sección?](#21-qué-hace-esta-sección)
   - [2.2 Paso a paso: Información del Proyecto](#22-paso-a-paso-información-del-proyecto)
   - [2.3 Configuración de Franjas Día / Noche](#23-configuración-de-franjas-día--noche)
   - [2.4 Gestión del Cuadro de Cargas y Horarios](#24-gestión-del-cuadro-de-cargas-y-horarios)
   - [2.5 Frecuencias de Operación (Globales vs. Específicas)](#25-frecuencias-de-operación-globales-vs-específicas)
   - [2.6 Casos de Ejemplo Didácticos y Caso Estándar](#26-casos-de-ejemplo-didácticos-y-caso-estándar)
   - [2.7 Resultados y Métricas de Demanda](#27-resultados-y-métricas-de-demanda)
   - [2.8 Informe, Exportación a Excel y Persistencia JSON](#28-informe-exportación-a-excel-y-persistencia-json)
3. [Reto 02: Dimensionamiento del Generador Fotovoltaico (Etapa 2)](#3-reto-02-dimensionamiento-del-generador-fotovoltaico-etapa-2)
   - [3.1 ¿Qué hace esta sección?](#31-qué-hace-esta-sección)
   - [3.2 Datos Heredados del Reto 01](#32-datos-heredados-del-reto-01)
   - [3.3 Coincidencia de Demanda en Ventana Solar](#33-coincidencia-de-demanda-en-ventana-solar)
   - [3.4 Selección de Motores Solares (PVGIS / PVWatts / Continental)](#34-selección-de-motores-solares-pvgis--pvwatts--continental)
   - [3.5 Casos de Estudio Certificados vs. Coordenadas Libres](#35-casos-de-estudio-certificados-vs-coordenadas-libres)
   - [3.6 Correcciones Térmicas y Tensiones de Seguridad (Voc y Vmp)](#36-correcciones-térmicas-y-tensiones-de-seguridad-voc-y-vmp)
   - [3.7 Selección y Edición de Módulos FV](#37-selección-y-edición-de-módulos-fv)
   - [3.8 Metodología de Cálculo del Arreglo Solar](#38-metodología-de-cálculo-del-arreglo-solar)
   - [3.9 Visualizador Interactivo 24 h del Generador](#39-visualizador-interactivo-24-h-del-generador)
   - [3.10 Proyecciones de Generación y Reporte Ejecutivo](#310-proyecciones-de-generación-y-reporte-ejecutivo)
4. [Reto 03: Conversión de Potencia y Almacenamiento (Etapa 3)](#4-reto-03-conversión-de-potencia-y-almacenamiento-etapa-3)
   - [4.1 ¿Qué hace esta sección y cómo ingresar?](#41-qué-hace-esta-sección-y-cómo-ingresar)
   - [4.2 Banner de Datos Heredados y Sincronización Continua (RF-26)](#42-banner-de-datos-heredados-y-sincronización-continua-rf-26)
   - [4.3 Selector de Rama Operativa: Con Almacenamiento vs. Red](#43-selector-de-rama-operativa-con-almacenamiento-vs-red)
   - [4.4 Verificación Eléctrica del Arreglo y Corrientes NTC 2050 (Art. 690-8)](#44-verificación-eléctrica-del-arreglo-y-corrientes-ntc-2050-art-690-8)
   - [4.5 Reconfiguración Interactiva del Arreglo Solar (Strings Ns × Np)](#45-reconfiguración-interactiva-del-arreglo-solar-strings-ns--np)
   - [4.6 Comparador de Reguladores MPPT e Inversores Híbridos](#46-comparador-de-reguladores-mppt-e-inversores-híbridos)
   - [4.7 Comparador de Inversores Conectados a Red (On-Grid)](#47-comparador-de-inversores-conectados-a-red-on-grid)
   - [4.8 Gestión del Catálogo de Equipos e Importación/Exportación JSON](#48-gestión-del-catálogo-de-equipos-e-importaciónexportación-json)
   - [4.9 Dimensionamiento Técnico del Banco de Baterías (GEL / AGM / LFP)](#49-dimensionamiento-técnico-del-banco-de-baterías-gel--agm--lfp)
   - [4.10 Balance de Cierre Energético y Tiempos de Recarga](#410-balance-de-cierre-energético-y-tiempos-de-recarga)
5. [Reto 04: Cierre del Sistema, Ficha Técnica y Escenario Grupo A (Etapa 4)](#5-reto-04-cierre-del-sistema-ficha-técnica-y-escenario-grupo-a-etapa-4)
   - [5.1 ¿Qué hace esta sección y cómo ingresar?](#51-qué-hace-esta-sección-y-cómo-ingresar)
   - [5.2 Escenario Oficial del Grupo A (San Andrés Isla)](#52-escenario-oficial-del-grupo-a-san-andrés-isla)
   - [5.3 Justificación Técnica de Transitorios de Arranque (Bomba 0,5 HP)](#53-justificación-técnica-de-transitorios-de-arranque-bomba-05-hp)
   - [5.4 Validación Cruzada de Doble Fuente del Recurso Solar (RF-41)](#54-validación-cruzada-de-doble-fuente-del-recurso-solar-rf-41)
   - [5.5 Fichas Técnicas Consolidadas y Balance Global](#55-fichas-técnicas-consolidadas-y-balance-global)
   - [5.6 Informe Técnico Ejecutivo en PDF](#56-informe-técnico-ejecutivo-en-pdf)
   - [5.7 Exportación Tabular Normalizada en CSV (RF-40)](#57-exportación-tabular-normalizada-en-csv-rf-40)
   - [5.8 Suite Interactiva de Pruebas Automáticas (RF-45)](#58-suite-interactiva-de-pruebas-automáticas-rf-45)
   - [5.9 Manual de Usuario y Normativa Integrado (RF-47)](#59-manual-de-usuario-y-normativa-integrado-rf-47)
6. [Compendio Maestro de Ecuaciones y Metodología](#6-compendio-maestro-de-ecuaciones-y-metodología)
7. [Arquitectura Técnica, Persistencia y Despliegue en Vercel](#7-arquitectura-técnica-persistencia-y-despliegue-en-vercel)

---

## 1. Visión General de la Interfaz y Navegación

La aplicación organiza el flujo de diseño en **cuatro macro-etapas secuenciales** dispuestas en la barra superior:

```
[ ⚡ Etapa 1: Requerimiento ]  [ ☀️ Etapa 2: Dimensionamiento ]  [ 🔋 Etapa 3: Conversión y Baterías ]  [ 📑 Etapa 4: Componentes e Informe ]
```

### Controles Globales de la Cabecera:
- **Selector de Idioma (`ES` / `EN`):** Ubicado en la esquina superior derecha. Traduce al instante toda la aplicación entre español e inglés preservando la nomenclatura técnica (*Peak Sun Hours, Tilt, Azimuth, Performance Ratio, Depth of Discharge, etc.*). La selección se guarda en `localStorage`.
- **Selector de Tema (`🌙 Modo Oscuro` / `☀️ Modo Claro`):** Cambia la apariencia cromática entre tema oscuro para trabajo nocturno y tema claro para impresión y proyectores.
- **Botón `⚙️ Configuración`:** Abre una ventana modal con:
  - *APIs y Servicios:* Inserción de credenciales para PVWatts y NASA POWER, o alternancia al modo offline de Base Continental.
  - *Ecuaciones y Metodología:* Consulta rápida de las fórmulas matemáticas implementadas.
- **Barra de Casos Rápidos:** Permite cargar con un solo clic los casos didácticos predefinidos (Caso Estándar, Grupo A y Casos 1 a 5) o activar el modo de *Coordenadas Libres*.

---

## 2. Reto 01: Caracterización de Demanda Eléctrica (Etapa 1)

### 2.1 ¿Qué hace esta sección?
Modela con precisión horaria el consumo energético de la instalación. Transforma el listado de artefactos eléctricos en:
1. Curva horaria de potencia de 24 horas ($P(h)$).
2. Consumo acumulado diario ($E_d$), mensual ($E_m$) y anual ($E_a$).
3. Potencia instalada total ($P_{inst}$) y demanda máxima simultánea pico ($P_{max}$) con identificación de la hora de ocurrencia y desempate automático.
4. Coincidencia solar diurna vs. nocturna según la ventana solar configurada.
5. Proyección económica del costo de la energía consumida con tarifa local regulada ($CU$ en COP/kWh).

---

### 2.2 Paso a paso: Información del Proyecto
1. Haga clic en la pestaña **📋 Proyecto** en el submenú de la Etapa 1.
2. Ingrese los datos generales:
   - **Nombre del Proyecto:** Nombre descriptivo de la instalación.
   - **ID del Proyecto:** Código alfanumérico para reportes técnicos.
   - **Integrantes:** Nombres de los evaluadores o diseñadores a cargo.
   - **Fecha:** Fecha del estudio.
   - **Tipo de Instalación:** *Residencial* (tensión máxima de 600 V según NTC 2050) o *Industrial* (hasta 1000 V).
   - **Tipo de Aplicación:**
     - *Off-Grid (Aislado)*: Sistema autónomo que requiere banco de baterías.
     - *On-Grid (Conectado a Red)*: Sistema acoplado a la red para autoconsumo e inyección sin almacenamiento obligatorio.
     - *Híbrido Off-Grid* / *Híbrido On-Grid*: Combinación de red/generador auxiliar y almacenamiento.

---

### 2.3 Configuración de Franjas Día / Noche
Debajo del formulario de proyecto se encuentra el panel **Configuración Día / Noche**:
- **Inicio del Día:** Hora de inicio del sol útil (predeterminado: `06:00 h`).
- **Inicio de la Noche:** Hora en que culmina la ventana solar (predeterminado: `18:00 h`).
- **Barra 24 h interactiva:** Muestra en ámbar el bloque diurno y en azul oscuro el bloque nocturno. Este umbral clasifica automáticamente las cargas como diurnas, nocturnas o mixtas.

---

### 2.4 Gestión del Cuadro de Cargas y Horarios
Haga clic en la pestaña **⚡ Cuadro de Cargas**:
1. **Descripción:** Nombre del equipo (ej. *Refrigerador*, *Luminarias LED*, *Bomba de agua*).
2. **Cantidad:** Número de unidades idénticas ($\ge 1$).
3. **Potencia Unitaria (W):** Potencia nominal por unidad.
4. **Horarios de Uso (Franjas):**
   - Seleccione la **Hora Inicio** y la **Hora Fin** y presione **＋ Agregar Franja**.
   - *Cruces de medianoche:* Admite franjas continuas que cruzan la medianoche (ej. `22:00 – 06:00`) sin necesidad de dividir el artefacto en dos registros.
   - *Franjas discontinuas:* Si opera en dos momentos del día (ej. `08:00 – 12:00` y `14:00 – 18:00`), agregue ambas franjas a la misma carga.
5. **Días/Mes y Meses/Año (Opcionales):** Déjelos vacíos para adoptar los valores globales del proyecto o indique frecuencias específicas para cargas estacionales.
6. Haga clic en **＋ Agregar Carga**. La tabla inferior calculará potencia total, consumo diario y clasificación horaria, permitiendo editar (✏️) o eliminar (🗑️) cada registro.

---

### 2.5 Frecuencias de Operación (Globales vs. Específicas)
- En la tarjeta **Frecuencia de Operación por Defecto** se configuran los días por mes (predeterminado: 30) y meses por año (predeterminado: 12) que aplicarán a todas las cargas que no tengan frecuencia propia.
- Las cargas con valores propios calculan sus totales mensuales y anuales de forma ponderada e independiente.

---

### 2.6 Casos de Ejemplo Didácticos y Caso Estándar
En la barra de casos didácticos puede cargar perfiles reales con un solo clic:
- **⭐ Caso Estándar (Nazareth, Alta Guajira):** 8 cargas representativas de una estación ambiental ($E_d = 7,580\text{ kWh/día}$, $P_{inst} = 1.505\text{ W}$, $P_{max} = 910\text{ W}$ a las 17:00 h).
- **🌴 Grupo A (San Andrés Isla):** 8 cargas obligatorias para la vivienda insular ($E_d = 12,865\text{ kWh/día}$, $P_{inst} = 2.530\text{ W}$, $P_{max} = 1.215\text{ W}$ a las 22:00 h con desempate automático y bomba inductiva de 0,5 HP).
- **Casos 1 a 5:** Hangar A en Santa Marta, Local Comercial en Villavicencio, Clima frío en Bogotá, Costa en Barranquilla y Región Andina en Pasto.
- **Coordenadas Libres:** Restablece los bloqueos para modelar proyectos personalizados.

---

### 2.7 Resultados y Métricas de Demanda
En la pestaña **📊 Resultados** encontrará:
- **KPIs Principales:** Potencia Instalada ($P_{inst}$), Demanda Máxima Simultánea ($P_{max}$), Energía Diaria ($E_d$), Mensual ($E_m$) y Anual ($E_a$).
- **Gráfico de Perfil 24 Horas:** Visualización horaria continua con selector interactivo entre gráfico de **Área** y **Barras**.
- **Estimación Económica de la Factura:** Ingrese la tarifa local ($CU$ en COP/kWh) para calcular el costo diario, mensual y anual asociado a la demanda.

---

### 2.8 Informe, Exportación a Excel y Persistencia JSON
En la pestaña **📄 Informe**:
- **Guardar Proyecto (.json):** Descarga el archivo de respaldo con el estado íntegro del proyecto (cargas, configuración, datos solares y conversión).
- **Cargar Proyecto:** Restaura un archivo `.json` previamente generado.
- **Descargar / Importar Excel (.xlsx):** Exporta o carga el cuadro de cargas completo en formato compatible con Microsoft Excel.
- **Generar Informe PDF:** Imprime o guarda un resumen ejecutivo de alta calidad.

---

## 3. Reto 02: Dimensionamiento del Generador Fotovoltaico (Etapa 2)

### 3.1 ¿Qué hace esta sección?
Calcula la capacidad del generador solar requerida para abastecer la demanda del Reto 01, considerando:
- Radiación solar satelital georreferenciada (HSP).
- Efectos térmicos reales y extremos sobre las tensiones del panel ($V_{oc}$ y $V_{mp}$).
- Verificación de límites de tensión eléctrica según la norma **NTC 2050**.
- Comparación técnico-económica de tecnologías de módulos comerciales.
- Visualización interactiva 24 h del comportamiento simultáneo entre demanda y generación solar.

---

### 3.2 Datos Heredados del Reto 01
Al ingresar a la Etapa 2, la tarjeta superior **Datos Heredados de la Caracterización de Demanda** transfiere en tiempo real los valores calculados en el Reto 01 ($E_d$, $P_{max}$, $E_m$, $E_a$). La etiqueta verde **`✓ Sincronizado en Memoria`** confirma la reactividad instantánea.

---

### 3.3 Coincidencia de Demanda en Ventana Solar
La barra porcentual de coincidencia solar desglosa la energía consumida durante las horas de sol frente a la consumida en la noche:
- **Mayoría en ventana solar:** Maximiza el autoconsumo directo diurno.
- **Mayoría fuera de ventana:** Exige un banco de baterías o una conexión a red de mayor capacidad para abastecer el régimen nocturno.

---

### 3.4 Selección de Motores Solares (PVGIS / PVWatts / Continental)
La plataforma permite alternar entre tres fuentes de irradiación:

| Motor Solar | Origen | Clave Requerida | Tipo de Irradiancia | Aplicación Principal |
|---|---|---|---|---|
| **PVGIS (Comisión Europea)** *(Predeterminado)* | Satélites SARAH2 / ERA5 | **No** (Público y abierto) | **$H_{POA}$ (Plano Inclinado)** | Calcula de forma analítica la **inclinación (*Tilt*) y orientación (*Azimut*) óptimos** para maximizar la captación anual. |
| **NREL PVWatts v8** | National Renewable Energy Lab (EE. UU.) | **Opcional** | **$H_{POA}$** | Estándar de simulación solar en Norteamérica. |
| **Base Continental** | Registros continentales consolidados | **No** (100% Offline) | **$GHI$ (Horizontal)** | Contingencia offline cuando no hay conexión a internet. |

Al presionar el botón **☀️ Cálculo Solar**, la herramienta consulta los 12 meses de irradiancia en Horas Solar Pico ($HSP$ en $\text{kWh/m}^2/\text{día}$), calcula el promedio anual, determina el **Mes Crítico** (menor recurso) y el **Mes Máximo**.

---

### 3.5 Casos de Estudio Certificados vs. Coordenadas Libres
- **⭐ Caso Estándar:** Bloquea coordenadas ($12.18^\circ\text{ N}, -71.28^\circ\text{ O}$, Tilt $12^\circ$), temperaturas e irradiancia fija oficial ($5.80\text{ h/d}$ anual y $5.20\text{ h/d}$ crítica). **Usa de forma exclusiva el módulo de referencia oficial de 550 Wp**.
- **Casos 1 al 5:** Mantienen coordenadas y temperaturas certificadas para garantizar evaluaciones homogéneas, permitiendo modificar el área disponible, el $PR$ y la referencia de panel.
- **Coordenadas Libres:** Desbloquea todos los campos para proyectos en cualquier parte del mundo.

---

### 3.6 Correcciones Térmicas y Tensiones de Seguridad (Voc y Vmp)
La aplicación implementa las ecuaciones de corrección térmica de la norma **NTC 2050**:
- **Tensión de Circuito Abierto a Temperatura Mínima ($V_{oc,Tmin}$):**
  $$V_{oc}(T_{min}) = N_s \times [V_{oc,STC} + \alpha_{Voc} \times (T_{min} - 25^\circ\text{C})]$$
  Se verifica que $V_{oc}(T_{min}) \le V_{max,sistema}$ ($600\text{ V}$ en residencial y $1000\text{ V}$ en industrial).
- **Temperatura de Operación de Celda ($T_{cell}$) y Tensión de Máxima Potencia ($V_{mp,Top}$):**
  Con irradiancia real $G = 800\text{ W/m}^2$:
  $$T_{cell} = T_{amb,op} + \left(\frac{\text{NOCT} - 20}{800}\right) \times 800 = T_{amb,op} + (\text{NOCT} - 20)$$
  $$V_{mp}(T_{cell}) = N_s \times [V_{mp,STC} + \gamma_{Vmp} \times (T_{cell} - 25^\circ\text{C})]$$
  Garantiza que la cadena opere dentro de la ventana de seguimiento del MPPT.

---

### 3.7 Selección y Edición de Módulos FV
- **Selección:** Elija entre las alternativas del catálogo (ej. Módulo 1: 150/210 Wp, Módulo 2: 330 Wp, Módulo 3: 550 Wp bifacial).
- **Edición Técnica (Botón ⚙️ / Editar Catálogo):** Permite modificar en un modal la potencia pico ($P_{max}$), tensiones ($V_{oc}$, $V_{mp}$), corrientes ($I_{sc}$, $I_{mp}$), coeficientes térmicos ($\alpha$, $\gamma$), NOCT y dimensiones geométricas.

---

### 3.8 Metodología de Cálculo del Arreglo Solar
1. **Potencia Pico Requerida ($P_{pico}$):**
   $$P_{pico}\text{ (kWp)} = \frac{E_d\text{ (kWh/día)}}{\text{HSP}\text{ (h/día)} \times \text{PR}}$$
2. **Criterio de Diseño:**
   - **Promedio Anual:** Utiliza la media de los 12 meses.
   - **Mes Crítico:** Utiliza el mes más desfavorable (diseño conservador indispensable en sistemas aislados).
3. **Número de Módulos por Energía ($N_{mod,req}$):**
   $$N_{mod,req} = \left\lceil \frac{P_{pico}\text{ (W)}}{P_{mod,STC}\text{ (W)}} \right\rceil$$
4. **Restricción de Área en Techo ($N_{mod,area}$):**
   $$N_{mod,area} = \left\lfloor \frac{\text{Área Disponible (m}^2\text{)}}{\text{Área del Módulo (m}^2\text{)}} \right\rfloor$$
   Si $N_{mod,req} \le N_{mod,area}$, la instalación cabe en cubierta. Si no, se genera una alerta indicando el porcentaje de cobertura alcanzable.

---

### 3.9 Visualizador Interactivo 24 h del Generador
En la tarjeta **Visualizador Interactivo del Generador (Reto 02)**:
- **Gráfico de Áreas Superpuestas 24 h:** Muestra simultáneamente la curva horaria de **Demanda de Cargas** (área índigo translúcida) y la curva de **Generación Fotovoltaica** (área ámbar luminosa diurna), permitiendo identificar a simple vista los momentos de superávit de generación y los periodos que dependen de la red o las baterías.
- **Controles de Animación Diurna:**
  - Botón **▶ Reproducir el día**: Inicia una animación continua de 24 horas del ciclo solar.
  - Barra de desplazamiento horaria (`00:00 – 23:50`): Permite ubicar el cursor en cualquier momento exacto del día.
  - Indicadores en vivo: Muestran en tiempo real los Vatios generados por los paneles, los Vatios demandados por las cargas y el estado del flujo de potencia hacia el inversor, la casa o el banco de baterías.
- **Pestañas de Vista Adicionales:**
  - *Layout en Cubierta:* Distribución espacial del arreglo de paneles sobre el techo disponible.
  - *Orientación 3D:* Representación visual del ángulo de inclinación (*Tilt*) y orientación (*Azimut*).
  - *Esquema Eléctrico:* Diagrama de conexionado de cadenas en serie y paralelo ($N_s \times N_p$).

---

### 3.10 Proyecciones de Generación y Reporte Ejecutivo
- **Comparativa de Tecnologías:** Evalúa simultáneamente 3 módulos del catálogo indicando cantidad de paneles, potencia instalada, ocupación de área y margen respecto al límite normativo de tensión.
- **Proyecciones Mensuales y Anuales:** Gráfico de barras y tabla de balance mes a mes para visualizar la estacionalidad de la producción solar.
- **Barra de Acciones Ejecutivas:** Permite descargar el informe PDF, exportar a Excel o guardar el archivo JSON del proyecto.

---

## 4. Reto 03: Conversión de Potencia y Almacenamiento (Etapa 3)

### 4.1 ¿Qué hace esta sección y cómo ingresar?
Haga clic en el botón superior **🔋 Etapa 3: Conversión y Baterías**. Esta sección realiza el acondicionamiento de potencia eléctrica, la selección y verificación de equipos electrónicos de potencia y el dimensionamiento del almacenamiento electroquímico.

---

### 4.2 Banner de Datos Heredados y Sincronización Continua (RF-26)
En la parte superior de la Etapa 3 se encuentra el **Banner de Datos Heredados de Reto 01 & Reto 02**:
- **Energía Diaria ($E_d$):** Demanda calculada en el Reto 01 en kWh/día.
- **Demanda Máxima ($P_{max}$):** Pico de consumo en Vatios con su hora exacta de ocurrencia.
- **Generador FV (Instalado / Requerido):**
  - Muestra la **Potencia Instalada** en kWp (calculada a partir del número de paneles seleccionados: $P_{inst} = N_{total} \times P_{mod} / 1000$).
  - Muestra la **Potencia Pico Requerida** ($P_{req} = E_d / (\text{HSP} \times \text{PR})$).
  - Detalla la configuración de cadenas: $N_{total}\text{ módulos } (N_s\text{S} \times N_p\text{P})$ y la referencia del panel.
- **Recurso y Desempeño (HSP / PR):**
  - Muestra la irradiancia anual promedio, el valor de $PR$ heredado y el **HSP Activo** según el criterio de diseño seleccionado (*Promedio Anual* o *Mes Crítico*).
- **Tipo de Aplicación:** Indica si el sistema es Aislado (*Off-Grid*), Conectado a Red (*On-Grid*) o Híbrido.

> **Reactividad Total:** Si en la Etapa 2 usted cambia el valor de $PR$, alterna entre Criterio Anual y Mes Crítico, modifica la inclinación o selecciona otro panel solar, la Etapa 3 actualiza todos sus cálculos de forma instantánea y en tiempo real.

---

### 4.3 Selector de Rama Operativa: Con Almacenamiento vs. Red
En la tarjeta de configuración de conversión encontrará dos botones principales:
- **`🔋 Con Almacenamiento (Off-Grid / Aislado / Híbrido)`:** Activa los módulos de reguladores MPPT, banco de baterías, balance de cierre energético y tiempos de recarga.
- **`⚡ Conectado a Red (On-Grid / Sin Almacenamiento)`:** Oculta los módulos de baterías y despliega el comparador de inversores de inyección con verificación de relación $DC/AC$.

---

### 4.4 Verificación Eléctrica del Arreglo y Corrientes NTC 2050 (Art. 690-8)
La tarjeta **Verificación Eléctrica del Arreglo y Separación de Corrientes NTC 2050** analiza la seguridad de la instalación fotovoltaica:
1. **Tensión Máxima en Frío ($V_{oc,Tmin}$):**
   Comprueba que la tensión en circuito abierto a la temperatura mínima extrema del sitio no supere el límite de seguridad ($600\text{ V}$ o $1000\text{ V}$).
2. **Tensión de Operación a Plena Carga ($V_{mp,Top}$):**
   Calcula la tensión del arreglo cuando las celdas se calientan en condiciones reales para asegurar que caiga dentro de la ventana del regulador/inversor.
3. **Diferenciación de Corrientes según NTC 2050 Sección 690-8:**
   - **Corriente de Cortocircuito del Arreglo ($I_{sc,gen}$):**
     $$I_{sc,gen} = N_p \times I_{sc,mod}$$
   - **Corriente Máxima de Diseño del Circuito ($I_{diseño}$):**
     Aplica el factor de sobreirradiancia ($1.25$) y el factor de operación continua ($1.25$), resultando en un factor combinado de **$1.5625$**:
     $$I_{diseño} = 1.25 \times 1.25 \times I_{sc,gen} = 1.5625 \times I_{sc,gen}$$
     Este valor define el calibre mínimo de los conductores y la capacidad nominal de los fusibles de protección en corriente continua.
   - **Corriente de Operación Normal ($I_{mp,gen}$):**
     $$I_{mp,gen} = N_p \times I_{mp,mod}$$

---

### 4.5 Reconfiguración Interactiva del Arreglo Solar (Strings Ns × Np)
En esta misma tarjeta puede ajustar la configuración de cadenas:
- **Selector de Módulos en Serie ($N_s$):** Permite cambiar el número de módulos por cadena.
- **Recálculo Automático de Ramas en Paralelo ($N_p$):** La aplicación recalcula $N_p = \lceil N_{total} / N_s \rceil$ y actualiza de inmediato las tensiones $V_{oc}(T_{min})$ y corrientes resultantes, alertando si la nueva configuración excede los límites admisibles del equipo seleccionado.

---

### 4.6 Comparador de Reguladores MPPT e Inversores Híbridos
En la rama con almacenamiento se presenta la tabla interactiva de reguladores MPPT e inversores híbridos (ej. *Regulador MPPT 150/35*, *MPPT 250/100*, *Inversor Híbrido 3 kW 48V*, *Inversor Híbrido 5 kW 48V*):
- **Parámetros evaluados:**
  - Tensión máxima admisible ($V_{oc,max} \ge V_{oc,Tmin}$).
  - Tensión mínima de arranque ($V_{mppt,min} \le V_{mp,Top}$).
  - Corriente máxima de entrada en CC ($I_{in,max} \ge I_{sc,gen}$).
  - Potencia nominal máxima recomendada.
- **Veredicto Técnico:**
  - **`Cumple` (Verde):** El equipo es 100% compatible eléctrica y térmicamente.
  - **`Alerta` (Ámbar):** El equipo funciona pero opera cerca de sus límites de potencia o corriente.
  - **`No Cumple` (Rojo):** Excede la tensión máxima de entrada o la corriente máxima, con riesgo de daño o desconexión por sobretensión.
- **Selección de Equipo Activo:** Haga clic sobre cualquier fila de la tabla para seleccionar ese equipo como el dispositivo de conversión del proyecto.

---

### 4.7 Comparador de Inversores Conectados a Red (On-Grid)
En la rama de conexión a red se evalúan los inversores fotovoltaicos tipo *string*:
- **Relación $DC/AC$ ($P_{dc,gen} / P_{ac,inv}$):** Relación entre la potencia pico del generador solar y la potencia nominal en corriente alterna del inversor.
  - La aplicación define un rango óptimo admisible entre **$1.00$ y $1.35$**.
  - Si la relación es menor a 1.00, el inversor está subutilizado. Si es mayor a 1.35, se advierte sobre posibles pérdidas por recorte de potencia (*clipping*).
- **Selección:** Haga clic sobre el inversor deseado para vincularlo al proyecto.

---

### 4.8 Gestión del Catálogo de Equipos e Importación/Exportación JSON
En la esquina superior de la sección de conversión encontrará los controles de catálogo:
- **Botón `⚙️ Gestionar Catálogo de Equipos y Fichas Técnicas (RF-27)`:**
  Abre una ventana modal con tres pestañas: *Reguladores MPPT*, *Inversores Solares* y *Baterías*. Permite crear nuevos modelos, editar equipos existentes (marca, modelo, tensiones, corrientes, eficiencias, precios, enlaces de fichas técnicas) o eliminarlos.
- **Botón `⬇ Exportar Catálogo JSON`:**
  Descarga un archivo estructurado `.json` que contiene todas las fichas técnicas de reguladores, inversores y baterías (incluidas las modificaciones o equipos personalizados que usted haya creado).
- **Botón `⬆ Importar Catálogo JSON`:**
  Permite cargar un catálogo `.json` externo para incorporarlo de inmediato a la aplicación. La herramienta valida la estructura del archivo y actualiza todas las tablas de selección.
- **Botón `🔄 Restablecer Todo de Fábrica`:**
  Restaura los equipos predeterminados certificados en caso de requerir volver a la configuración original.

---

### 4.9 Dimensionamiento Técnico del Banco de Baterías (GEL / AGM / LFP)
En la sección **Banco de Baterías y Almacenamiento**:
1. **Parámetros de Diseño:**
   - **Tensión del Bus DC ($V_{bus}$):** Selector para fijar la tensión en `12 V`, `24 V` o `48 V`.
   - **Autonomía ($N$ días):** Días continuos de operación sin radiación solar (predeterminado: 2 días).
   - **Profundidad de Descarga de Diseño ($DoD$):** Porcentaje máximo de descarga admisible (ej. 50% para Plomo-Ácido AGM/GEL, 80–90% para Litio $LiFePO_4$).
   - **Factor de Temperatura ($f_T$):** Corrección por degradación de capacidad ante temperaturas extremas (1.00 para condiciones estándar).
2. **Capacidad Requerida:**
   - Energía diaria en corriente continua requerida por el inversor:
     $$E_{d,CC}\text{ (Wh)} = \frac{E_d}{\eta_{inv}}$$
   - Capacidad nominal requerida:
     $$C_n\text{ (Wh)} = \frac{E_{d,CC} \times N}{DoD \times f_T}$$
     $$C_n\text{ (Ah)} = \frac{C_n\text{ (Wh)}}{V_{bus}}$$
3. **Configuración Serie/Paralelo del Banco:**
   - Baterías en serie para alcanzar la tensión del bus:
     $$N_{s,bat} = \frac{V_{bus}}{V_{bat,unit}}$$
   - Ramas en paralelo para alcanzar la capacidad:
     $$N_{p,bat} = \left\lceil \frac{C_n\text{ (Ah)}}{C_{unit,bat}\text{ (Ah)}} \right\rceil$$
   - Total de baterías: $N_{total,bat} = N_{s,bat} \times N_{p,bat}$.
4. **Verificación de Tasas de Corriente ($C$-rate):**
   - **Tasa de Carga ($C_{carga}$):** Corriente solar entregada por los paneles dividida entre la capacidad instalada ($I_{mp} / C_{inst}$). Se verifica que no supere el límite del fabricante (típicamente $0.20C$).
   - **Tasa de Descarga ($C_{descarga}$):** Corriente exigida por la demanda máxima dividida entre la capacidad instalada ($I_{max,descarga} / C_{inst}$). Se verifica que no supere el límite máximo (típicamente $0.50C$).
5. **Profundidad de Descarga Real:**
   - $DoD_{fin}$: Porcentaje al que llegará el banco tras agotar los días de autonomía previstos.
   - $DoD_{diario}$: Porcentaje ciclado en un día típico de operación.
6. **Diagrama Esquemático en SVG del Banco:**
   Visualiza las conexiones físicas del banco, mostrando la disposición de las baterías en serie y paralelo, los puentes intercelda y el rotulado claro de los bornes positivo ($+$) y negativo ($-$) conectados al inversor/regulador.

---

### 4.10 Balance de Cierre Energético y Tiempos de Recarga
La tarjeta final de la Etapa 3 evalúa si el generador fotovoltaico es capaz de recargar las baterías y cubrir el consumo total:

1. **Generación Requerida ($E_{gen}$):**
   Distingue con rigor termodinámico los consumos diurnos de los nocturnos:
   - El consumo diurno dentro de la ventana solar se toma directamente de los paneles en CC (no sufre pérdidas de ciclado en baterías).
   - El consumo nocturno fuera de la ventana solar cicla a través del banco con el rendimiento de ida y vuelta (*round-trip efficiency* $\eta_{bat}$, típicamente 80–85% en plomo y 95% en litio).
   $$E_{gen}\text{ (Wh/día)} = E_{diurno,directo} + \frac{E_{nocturno,banco}}{\eta_{bat}}$$
2. **Potencia Pico Requerida de Cierre:**
   $$P_{req,anual}\text{ (W)} = \frac{E_{gen}}{\text{HSP}_{anual} \times PR} \qquad P_{req,crítico}\text{ (W)} = \frac{E_{gen}}{\text{HSP}_{crítico} \times PR}$$
3. **Tiempo de Recarga de Batería:**
   Calcula cuántos días toma recargar el banco desde su nivel de descarga tras la autonomía:
   - Se evalúa en el **Mejor Mes** (mes de mayor recurso) y en el **Peor Mes** (mes crítico).
   - Si el saldo diario neto es positivo ($E_{saldo} = E_{prod} - E_{gen} > 0$), se muestra el tiempo de recarga en días (ej. `2.4 d` en mejor mes, `3.1 d` en peor mes).
   - Si el saldo es nulo o negativo, se despliega la advertencia en rojo:
     > **"No se recupera energía: el balance diario es nulo o negativo"**
     Indicando con precisión cuántos paneles adicionales en serie compatibles ($+\Delta N$) son necesarios para que el banco recargue.

---

## 5. Reto 04: Cierre del Sistema, Ficha Técnica y Escenario Grupo A (Etapa 4)

### 5.1 ¿Qué hace esta sección y cómo ingresar?
Haga clic en el botón superior **📑 Etapa 4: Componentes e Informe**. Esta sección consolida la entrega final de ingeniería según el pliego de condiciones técnicas del periodo 2026-II, integrando la justificación de transitorios, la validación de doble fuente del recurso solar, la ficha técnica consolidada, la suite de pruebas automáticas y los módulos de exportación final.

---

### 5.2 Escenario Oficial del Grupo A (San Andrés Isla)
Al pulsar en la barra superior el botón **🌴 Grupo A (San Andrés)**, se cargan de forma íntegra los parámetros oficiales del pliego de condiciones:
- **Ubicación Geográfica:** Coordenadas $12.58^\circ\text{ N}, -81.70^\circ\text{ O}$ (Archipiélago de San Andrés, Providencia y Santa Catalina).
- **Régimen de Operación:** Conectado a Red (*On-Grid*) con tarifa oficial de **$1.200 COP/kWh** (SOPESA).
- **Área Disponible:** $30\text{ m}^2$ en cubierta.
- **Cuadro Oficial de 8 Cargas:**
  1. Iluminación LED ($15\text{ W} \times 10\text{ unid.}$, 18:00 – 23:00).
  2. Nevera eficiente ($200\text{ W} \times 1\text{ unid.}$, 24 h continuo).
  3. Televisor Smart ($80\text{ W} \times 2\text{ unid.}$, 12:00 – 14:00 y 19:00 – 22:00).
  4. Ventilador de techo ($60\text{ W} \times 3\text{ unid.}$, 11:00 – 17:00 y 21:00 – 06:00, cruce continuo de medianoche).
  5. Computador portátil ($65\text{ W} \times 2\text{ unid.}$, 08:00 – 12:00 y 14:00 – 18:00).
  6. Lavadora automática ($450\text{ W} \times 1\text{ unid.}$, 08:00 – 10:00).
  7. Microondas ($1.100\text{ W} \times 1\text{ unid.}$, 07:00 – 07:30 y 12:00 – 12:30).
  8. **Bomba de agua de cisterna (0,5 HP):** Carga inductiva crítica ($600\text{ W} \times 1\text{ unid.}$, 06:00 – 07:00 y 17:00 – 18:00).
- **Métricas Resultantes Certificadas:**
  - $P_{inst} = 2.530\text{ W}$.
  - $E_d = 12,865\text{ kWh/día}$ ($5,390\text{ kWh}$ diurnos en ventana solar 06–18 h y $7,475\text{ kWh}$ nocturnos).
  - $P_{max} = 1.215\text{ W}$ a las 22:00–23:00 h (con desempate automático registrado en memoria).

---

### 5.3 Justificación Técnica de Transitorios de Arranque (Bomba 0,5 HP)
En la Etapa 4 se incluye la tarjeta de justificación técnica ante el transitorio de arranque inductivo de la bomba de cisterna de 0,5 HP (factor de arranque típico de $3\times$, elevando la potencia transitoria a $\sim 1.800\text{ W}$ durante los primeros 500 ms):
- **En Modo On-Grid (Régimen Oficial Grupo A):**
  La red eléctrica insular de SOPESA opera como un bus de impedancia despreciable (fuente infinita), absorbiendo de forma instantánea la corriente inrush de arranque sin sobrecargar el generador fotovoltaico ni provocar desconexiones del inversor.
- **En Modo Off-Grid / Respaldo:**
  El inversor seleccionado cuenta con capacidad de sobrecarga transitoria del **200% durante 5 segundos** (6.000 W pico para un inversor de 3.000 W nominales). La potencia simultánea pico durante el arranque ($615\text{ W} - 600\text{ W} + 1.800\text{ W} = 1.815\text{ W}$) queda ampliamente por debajo del umbral de disparo de 6.000 W.

---

### 5.4 Validación Cruzada de Doble Fuente del Recurso Solar (RF-41)
La aplicación implementa la verificación cruzada de irradiancia exigida en el pliego de condiciones:
- **Fuente Primaria (PVGIS-SARAH2 / Base Local):** $\text{HSP} = 5,32\text{ kWh/m}^2\cdot\text{día}$ (mes crítico: $4,75\text{ kWh/m}^2\cdot\text{día}$ en noviembre).
- **Fuente Secundaria (NASA POWER MERRA-2):** $\text{HSP} = 5,48\text{ kWh/m}^2\cdot\text{día}$ (mes crítico: $4,92\text{ kWh/m}^2\cdot\text{día}$).
- **Cálculo de Divergencia Relativa:**
  $$|\Delta\%| = \left| \frac{\text{HSP}_{\text{NASA}} - \text{HSP}_{\text{PVGIS}}}{\text{HSP}_{\text{PVGIS}}} \right| \times 100\% = \left| \frac{5,48 - 5,32}{5,32} \right| \times 100\% = 3,01\%$$
- **Criterio de Aceptación:** Dado que $|\Delta\%| = 3,01\% \le \pm 15\%$, ambas fuentes son mutuamente consistentes y el recurso solar queda certificado formalmente para el dimensionamiento.

---

### 5.5 Fichas Técnicas Consolidadas y Balance Global
La Etapa 4 presenta la matriz final de componentes seleccionados:
- **Módulo Fotovoltaico:** Referencia comercial, potencia pico ($P_{max}$), tensiones ($V_{oc}, V_{mp}$), corrientes ($I_{sc}, I_{mp}$), número de módulos requeridos, arreglo de strings ($N_s \times N_p$) y enlace web directo a la ficha técnica oficial del fabricante.
- **Inversor / Regulador:** Modelo seleccionado, potencia nominal, eficiencia, rango MPPT y compatibilidad térmica certificada.
- **Banco de Baterías (si aplica):** Tecnología, tensión de bus, capacidad útil instalada, número de baterías ($N_s \times N_p$) y bornes.
- **Balance Energético Global:** Generación diaria proyectada frente a la demanda y ahorro anual estimado en la factura de energía.

---

### 5.6 Informe Técnico Ejecutivo en PDF
Presione el botón **`📄 Descargar Informe PDF`** en la cabecera de la Etapa 4:
- Se genera un documento ejecutivo de alta calidad gráfica adaptado al régimen del proyecto:
  - **En sistemas Conectados a Red (On-Grid):** Excluye baterías y reguladores de carga, presentando exclusivamente el inversor de inyección seleccionado, su potencia nominal/pico, relación DC/AC, rango MPPT y compatibilidad térmica.
  - **En sistemas Con Almacenamiento (Off-Grid / Aislados):** Presenta el banco de baterías, el inversor/regulador activo y el balance con tiempos de recarga en el mejor mes y en el peor mes.
- Contiene: membrete institucional de la Universidad del Magdalena, identificación del proyecto y autores, resumen ejecutivo de KPIs, tabla detallada de cargas, balance de ventana solar, parámetros del generador, especificaciones de los equipos seleccionados, verificación normativa de seguridad eléctrica según NTC 2050 y firmas de responsabilidad técnica.

---

### 5.7 Exportación Tabular Normalizada en CSV (RF-40)
Presione el botón **`📊 Exportar Resultados (CSV)`**:
- Descarga una planilla tabular con delimitador punto y coma (`;`) y codificación **UTF-8 BOM**.
- Se abre de forma nativa e inmediata en Microsoft Excel en español sin requerir asistentes de importación de texto.
- Incluye: metadatos del proyecto, cuadro completo de cargas, desglose del perfil horario de 24 horas, indicadores globales de demanda, recurso solar y especificaciones de los componentes seleccionados.

---

### 5.8 Suite Interactiva de Pruebas Automáticas (RF-45)
Presione el botón **`🧪 Suite de Pruebas`**:
- Abre una ventana modal dedicada que ejecuta automáticamente cinco baterías de prueba canónicas para validar el motor analítico de la aplicación:
  1. **Reto 01A:** Carga exclusiva diurna (100% en ventana solar).
  2. **Reto 01B:** Carga exclusiva nocturna (100% fuera de ventana solar).
  3. **Reto 01C:** Cruce continuo de medianoche (`22:00 – 04:00`).
  4. **Caso Estandarizado:** Estación Alta Guajira ($7,580\text{ kWh/d}$, $910\text{ W} P_{max}$).
  5. **Escenario Grupo A:** San Andrés ($12,865\text{ kWh/d}$, $2.530\text{ W} P_{inst}$, $1.215\text{ W} P_{max}$).
- La suite verifica de forma automatizada las tolerancias numéricas y emite un veredicto verde **`5/5 PASS (100%)`**, garantizando la confiabilidad del software.

---

### 5.9 Manual de Usuario y Normativa Integrado (RF-47)
En la esquina superior de la aplicación puede abrir el manual de usuario interactivo embebido:
- **Pestaña 1 (Manual de Uso):** Guía rápida paso a paso de navegación entre las cuatro etapas.
- **Pestaña 2 (Normativa y Criterios de Ingeniería):** Marco regulatorio aplicable en Colombia (NTC 2050 Sección 690, factores de seguridad de corriente $1.5625$, RETIE, límites de tensión en corriente continua y criterios de dimensionamiento de protecciones).

---

## 6. Compendio Maestro de Ecuaciones y Metodología

| Concepto Técnico | Ecuación Matemática | Variables y Unidades |
|---|---|---|
| **Potencia Instalada Total** | $P_{inst} = \sum_{i=1}^n N_i \times P_i$ | $N_i$: cantidad, $P_i$: potencia unitaria (W) |
| **Demanda Máxima Simultánea** | $P_{max} = \max_{h \in [0, 23]} \left( \sum_{i=1}^n N_i \times P_i \times u_{i,h} \right)$ | $u_{i,h} \in \{0, 1\}$: estado en la hora $h$ |
| **Energía Diaria** | $E_d = \sum_{h=0}^{23} P(h) \times 1\text{ h}$ | $P(h)$: potencia consumida en la hora $h$ (Wh) |
| **Energía Mensual** | $E_m = \sum_{i=1}^n (N_i \times P_i \times h_{dia,i} \times d_{mes,i})$ | $d_{mes,i}$: días de operación por mes |
| **Energía Anual** | $E_a = \sum_{i=1}^n (N_i \times P_i \times h_{dia,i} \times d_{mes,i} \times m_{ano,i})$ | $m_{ano,i}$: meses de operación por año |
| **Potencia Pico Solar Requerida** | $P_{pico} = \frac{E_d}{\text{HSP} \times \text{PR}}$ | $E_d$ en kWh/día, $\text{HSP}$ en h/día, $PR \in [0.70, 0.85]$ |
| **Tensión $V_{oc}$ en Frío Extremo** | $V_{oc}(T_{min}) = N_s \times [V_{oc,STC} + \alpha_{Voc} \times (T_{min} - 25^\circ\text{C})]$ | $\alpha_{Voc}$ en V/°C, $T_{min}$ en °C |
| **Temperatura de Operación de Celda** | $T_{cell} = T_{amb,op} + (\text{NOCT} - 20^\circ\text{C})$ | Para radiación real $G = 800\text{ W/m}^2$ |
| **Tensión $V_{mp}$ en Condiciones Reales** | $V_{mp}(T_{cell}) = N_s \times [V_{mp,STC} + \gamma_{Vmp} \times (T_{cell} - 25^\circ\text{C})]$ | $\gamma_{Vmp}$ en V/°C, $T_{cell}$ en °C |
| **Corriente de Cortocircuito del Arreglo** | $I_{sc,gen} = N_p \times I_{sc,mod}$ | $N_p$: cadenas en paralelo |
| **Corriente de Diseño (NTC 2050 Art. 690-8)** | $I_{diseño} = 1.25 \times 1.25 \times I_{sc,gen} = 1.5625 \times I_{sc,gen}$ | Factor combinado de sobreirradiancia y régimen continuo |
| **Capacidad Nominal de Baterías (Ah)** | $C_n = \frac{E_d / \eta_{inv} \times N_{días}}{V_{bus} \times DoD \times f_T}$ | $V_{bus}$ en V, $DoD \in [0.10, 0.95]$, $f_T \approx 1.00$ |
| **Generación Requerida para Cierre ($E_{gen}$)** | $E_{gen} = \frac{E_{diurno}}{\eta_{inv}} + \frac{E_{nocturno} / \eta_{inv}}{\eta_{bat,round-trip}}$ | $\eta_{bat}$: eficiencia de ida y vuelta (80–95%) |
| **Tiempo de Recarga de Baterías** | $T_{rec} = \frac{(N_{días} \times E_d / \eta_{inv}) / \eta_{bat}}{(P_{inst} \times \text{HSP} \times PR) - E_{gen}}$ | Días de recuperación tras agotar la autonomía |
| **Relación DC/AC (Inversor On-Grid)** | $R_{DC/AC} = \frac{P_{dc,gen}\text{ (W)}}{P_{ac,inv}\text{ (W)}}$ | Rango admisible recomendado: $[1.00, 1.35]$ |
| **Divergencia entre Fuentes Solares** | $|\Delta\%| = \left| \frac{\text{HSP}_{\text{NASA}} - \text{HSP}_{\text{PVGIS}}}{\text{HSP}_{\text{PVGIS}}} \right| \times 100\%$ | Criterio de validación técnica: $|\Delta\%| \le \pm 15\%$ |

---

## 7. Arquitectura Técnica, Persistencia y Despliegue en Vercel

### 7.1 Estructura Modular de Archivos
```
Reto01-ESFV/
├── index.html              # Estructura semántica SPA y contenedores de las 4 etapas
├── css/
│   └── styles.css          # Sistema de diseño con variables CSS, dark/light theme y diseño responsivo
├── js/
│   ├── app.js              # Controlador principal, ciclo de vida DOM y switchStage()
│   ├── i18n.js             # Diccionario bilingüe (Español / Inglés) con persistencia
│   ├── loads.js            # Lógica y renderizado reactivo del cuadro de cargas
│   ├── calculations.js     # Motor matemático de caracterización de demanda (Reto 01)
│   ├── chart.js            # Renderizado de curvas de carga 24 h en Chart.js
│   ├── persistence.js      # Exportación e importación de estado en JSON
│   ├── excel.js            # Integración de importación y exportación de hojas Excel (.xlsx)
│   ├── report.js           # Generación de informe PDF con html2pdf
│   ├── cases_db.js         # Base de datos de casos predefinidos (Caso Estándar, Grupo A, Casos 1-5)
│   ├── solar_db.js         # Base de datos de climatología solar local
│   ├── continents_db.js    # Base de datos offline para contingencia continental
│   ├── modules_db.js       # Catálogo de paneles solares fotovoltaicos
│   ├── pvgis_service.js    # Conexión al servicio satelital PVGIS (JRC Comisión Europea)
│   ├── pvwatts_service.js  # Conexión a la API NREL PVWatts v8
│   ├── nasa_power_service.js # Conexión a la API satelital NASA POWER (temperaturas extremas)
│   ├── sizing.js           # Motor de cálculo y dimensionamiento del generador FV (Reto 02)
│   ├── sizing_ui.js        # Interfaz de dimensionamiento, tablas térmicas y comparativas
│   ├── pv_visualizer.js    # Visualizador 24 h del generador (animación orbital y áreas superpuestas)
│   ├── conversion_db.js    # Catálogo de reguladores MPPT, inversores y baterías (Reto 03)
│   ├── conversion.js       # Motor analítico de acondicionamiento, baterías y balance de cierre
│   ├── conversion_ui.js    # Interfaz de conversión, esquemas SVG de baterías y gestión JSON
│   └── final_report_ui.js  # Etapa 4: Ficha técnica, justificación de transitorios, CSV y test suite
├── api/
│   └── pvgis.js            # Proxy serverless para peticiones seguras a PVGIS en Vercel
├── server.py               # Servidor HTTP local en Python con proxy integrado para desarrollo
└── vercel.json             # Configuración de despliegue en la nube
```

### 7.2 Política de Cero Secretos Expuestos (RF-42)
El código fuente no incluye claves privadas ni credenciales codificadas en el repositorio. Las consultas a PVGIS se realizan a través del proxy serverless (`/api/pvgis`), garantizando cumplimiento de políticas de seguridad y evitando restricciones de CORS.

### 7.3 Instrucciones de Ejecución Local
Para ejecutar la aplicación localmente en su estación de trabajo:
1. Abra una terminal en el directorio raíz del proyecto.
2. Inicie el servidor local con el script de Python:
   ```bash
   python server.py 8080
   ```
3. Abra su navegador web en la dirección:
   ```
   http://localhost:8080
   ```

### 7.4 Despliegue en Vercel
1. Conecte el repositorio a su cuenta de **Vercel**.
2. Framework Preset: `Other` (sitio estático HTML/CSS/JS).
3. Root Directory: `./` (raíz).
4. Build Command: vacío (no requiere transpilación).
5. Output Directory: `./`.
6. Presione **Deploy**. La aplicación quedará disponible en HTTPS con alta disponibilidad global.
