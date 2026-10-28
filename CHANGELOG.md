# Registro de Cambios (CHANGELOG)

Todas las modificaciones notables realizadas en la **Plataforma Integral de Planeación y Dimensionamiento Solar Fotovoltaico** quedan documentadas en este archivo cronológico, de acuerdo con las especificaciones de versionado semántico y los requerimientos funcionales del proyecto.

---

## [v1.2.0] — 2026-10-28
### Ajustes en Balance y Recarga de Batería, Gráfica de Áreas 24h y Reactividad Total de Datos Heredados
- **Reactividad e Integración Plena de Datos Heredados (RF-26):**
  - Corrección en la extracción de métricas solares desde `solarResource`: lectura de `annualHsp`, `criticalMonthHsp`, `maxMonthHsp` y `monthlyHsp`, superando la desconexión que dejaba los valores en valores fijos (5,80 h / 4,80 h).
  - Normalización reactiva del Performance Ratio (PR) y sincronización con el campo `#sizing-pr`.
  - Lectura directa del número real de módulos dimensionados (`finalModCount`) y potencia pico del generador, reflejando fielmente el arreglo calculado en Reto 02.
  - Notificación reactiva inmediata: cada modificación en Reto 02 (PR, HSP, mes suspendido/reactivado o cambio de módulo) dispara automáticamente `updateConversion()`, actualizando en tiempo real la tarjeta de datos heredados, la evaluación técnica y el balance de recarga.
- **Tiempo de Recarga de Batería (Mejor y Peor Mes):**
  - Desglose explícito del tiempo de recarga en un día del **mejor mes** ($HSP_{max}$) y del **peor mes** ($HSP_{min}$ / mes crítico), complementando el régimen promedio anual.
  - Eliminación total del término *"superávit"* en alertas, etiquetas y diagnósticos técnicos.
  - Actualización del mensaje de déficit / alerta a la redacción exacta solicitada: `"No se recupera energía: el balance diario es nulo o negativo"`.
  - Supresión del botón interactivo de añadir paneles (`+3 mód`); en su lugar, se presenta un diagnóstico cuantitativo indicando cuántos paneles extra en serie son necesarios para alcanzar el balance de recarga.
- **Gráfica de Áreas Superpuestas 24h en el Simulador Visual:**
  - Rediseño de la gráfica 24h inferior: transición de diagrama de barras simple a **gráfica de áreas superpuestas**, permitiendo visualizar tanto el consumo como la generación solar en un mismo plano con una curva por delante de la otra mediante rellenos translúcidos con gradientes (#6366f1 para demanda y #f59e0b para generación) y trazos nítidos.
  - Corrección en la lectura de propiedades del generador (`finalModCount` e `installedPowerKwp`), resolviendo el error donde la generación aparecía plana o imperceptible frente a altas demandas.
- **Sincronización Inmediata en Proyectos Aislados (Off-Grid / Híbridos):**
  - Corrección del flujo de inicialización y cambio de escenario: al cargar o trabajar en un proyecto aislado (`off-grid` o `hybrid`), la rama se configura automáticamente en `storage`, visibilizando inmediatamente el banco de baterías, KPIs, circuito SVG y balance sin necesidad de conmutar a red y volver.
  - Definición global de `updateConversion()` en `js/app.js` para asegurar reactividad total en la navegación entre etapas.

---

## [v1.1.0] — 2026-10-28
### Ajuste de Balance Energético, Tiempo de Recarga de Batería, Visualizador Interactivo y Catálogos JSON
- **Ajuste Físico del Balance de Cierre Energético (RF-34, RF-35):**
  - Desacoplamiento de la energía diurna directa ($E_{in,CC}$) respecto a la energía nocturna ciclada por batería ($E_{out,CC}$), eliminando la doble penalización del 20% en la producción solar total.
  - Corrección del superávit neto diario para régimen anual y mes crítico: $Surplus = E_{prod} - E_{req}$, evitando falsas alertas de "Banco no recupera" cuando el arreglo FV está correctamente dimensionado.
  - Actualización del indicador y título a **"Tiempo de recarga de batería"**, con evaluación dual para régimen promedio anual y mes crítico.
- **Panel Visual Interactivo del Generador FV (Reto 02):**
  - Incorporación del módulo interactivo con 4 figuras SVG animadas en tiempo real:
    - *Un día de energía:* Simulación orbital 24h (sol/luna, iluminación diurna/nocturna, flujo animado de potencia a cargas y almacenamiento, y sincronización con la curva horaria).
    - *Módulos y área:* Distribución física $N_s \times N_p$, ocupación superficial vs área disponible y comparativa con canchas de tenis.
    - *Inclinación y orientación:* Vista lateral con transportador angular e inclinación real $\beta$, y brújula 360° con vector de azimut.
    - *Voltaje y corriente:* Esquema eléctrico en serie/paralelo, indicador de $V_{oc}(T_{min})$ vs límite de seguridad $V_{max}$, y corrientes NTC 2050 (Art. 690-8).
- **Importación y Exportación de Catálogos en Formato JSON:**
  - Botones dedicados en la Etapa 3 y en el modal de gestión para exportar e importar el catálogo completo de equipos de conversión (controladores MPPT, inversores y baterías) y módulos FV.
  - Compatibilidad completa de persistencia para proyectos locales.

---

## [v1.0.0] — 2026-10-27 (Lanzamiento Definitivo Reto 04)
### Universidad del Magdalena — Periodo 2026-II — Grupo A (San Andrés)

### Novedades y Características Principales
- **Etapa 4: Ficha Técnica de Componentes Seleccionados e Informe Final (RF-36, RF-38):**
  - Vista técnica dedicada que consolida los componentes seleccionados (módulo solar, inversor de red, regulador MPPT y banco de baterías).
  - Integración de especificaciones eléctricas STC, coeficientes de temperatura, tensiones de seguridad RETIE y corrientes NTC 2050 (factores $1,25\times$ y $1,5625\times$).
  - Enlaces directos a fichas técnicas oficiales de AutoSolar (con enlaces de contingencia ante ausencia de conectividad).
- **Escenario Oficial del Grupo A Precargado (RF-39):**
  - Botón de carga en un solo clic `🌴 Grupo A (San Andrés)` en cabecera y en navegación de dimensionamiento.
  - Carga automática de 8 cargas obligatorias: $P_{inst} = 2.530\text{ W}$, $E_d = 12.865\text{ Wh/día}$ ($5.390\text{ Wh}$ diurna y $7.475\text{ Wh}$ nocturna), $P_{max} = 1.215\text{ W}$ a las 22:00–23:00 h.
  - Coordenadas de San Andrés Isla: $12,58^\circ\text{ N}, 81,70^\circ\text{ O}$, área disponible de $30\text{ m}^2$, tarifa regulada $CU = 1.200\text{ COP/kWh}$.
- **Justificación Técnica del Transitorio de Arranque de la Bomba de Cisterna 0,5 HP:**
  - Análisis detallado del pico inductivo de $\sim 1.800\text{ W}$ ($3\times\text{ LRA/FLA}$).
  - Justificación de absorción directa por la red pública (SOPESA) en modalidad On-Grid y capacidad de sobrecarga de 200% (6.000 W pico) en caso de operar aislado.
- **Validación del Recurso Solar por Contraste de Doble Fuente (RF-41):**
  - Contraste entre PVGIS SARAH2 ($5,32\text{ kWh/m}^2\cdot\text{d}$) y NASA POWER MERRA-2 ($5,48\text{ kWh/m}^2\cdot\text{d}$).
  - Verificación de discrepancia relativa: $|\Delta\%| = 3,01\% \le \pm 15\%$, cumpliendo el pliego de condiciones.
  - Base de datos local precargada para operación 100% offline.
- **Exportación Tabular CSV (RF-40):**
  - Descarga de resultados en archivo `.csv` estructurado con delimitador `;` y codificación UTF-8 con BOM.
  - Incluye metadatos, cuadro de cargas, perfil horario de 24 horas, indicadores energéticos y parámetros de equipos.
- **Suite de Pruebas Automatizadas en Vivo (RF-45):**
  - Modal interactivo accesible desde la cabecera (`🧪 Pruebas`) que evalúa los 5 casos obligatorios (Reto 01A Diurno, Reto 01B Nocturno, Reto 01C Medianoche, Caso Estandarizado Alta Guajira y Escenario Grupo A).
  - Tasa de aprobación del 100% (5/5 PASS) con visualización de valores esperados vs obtenidos.
- **Regla de Desempate en Demanda Máxima Horaria (RF-46):**
  - El sistema detecta horas con demanda idéntica al pico máximo, reportando la primera y listando explícitamente las demás horas empatadas.
- **Manual de Usuario Integrado de 2 Páginas (RF-47):**
  - Modal accesible desde la cabecera (`📖 Manual`) con guía paso a paso y marco normativo (NTC 2050, RETIE).
- **Preparación para Despliegue en Vercel con Cero Secretos (RF-37, RF-42):**
  - Arquitectura estática sin claves privadas en frontend ni repositorio, con soporte para servidor proxy serverless en `/api/pvgis.js`.
  - Adaptabilidad para pantallas móviles desde 360 px de ancho (RF-43).

---

## [v0.3.0] — 2026-10-26 (Reto 03: Conversión y Almacenamiento)
- Incorporación de la Etapa 3: Conversión y Almacenamiento.
- Comparador interactivo de reguladores MPPT e inversores híbridos (INV-1, INV-2 e INV-3) con evaluación de límites $V_{oc}(T_{min})$ y $V_{mp}(T_{max})$.
- Comparador de inversores de red con verificación de relación $DC/AC$ ($1,0$ a $1,35$).
- Dimensionamiento de banco de baterías (GEL, AGM, Litio LFP) con cálculo de DoD real, tasas de carga/descarga $C$-rate y tiempo de recuperación $T_{rec}$.
- Diagrama visual dinámico del conexionado del banco de baterías en serie/paralelo.
- Balance energético de cierre con recomendación de módulos adicionales ($\Delta N$).
- Modal de gestión del catálogo de equipos, módulos y baterías (RF-27).

---

## [v0.2.0] — 2026-10-25 (Reto 02: Dimensionamiento del Generador Solar)
- Incorporación de la Etapa 2: Dimensionamiento del Generador Fotovoltaico.
- Consulta de radiación solar mediante APIs externas (PVGIS v5.2, NASA POWER, NREL PVWatts v8) y base continental local.
- Cálculo de potencia pico requerida bajo criterios de promedio anual y mes crítico.
- Corrección térmica de tensión $V_{oc}(T_{min})$ y $V_{mp}(T_{op})$ según NTC 2050 Art. 690-7.
- Cálculo de módulos requeridos por energía y verificación de área física disponible en cubierta.
- Comparativa simultánea de 3 tecnologías de módulos fotovoltaicos.
- Gráficos de proyección de generación mensual vs demanda con Chart.js.

---

## [v0.1.0] — 2026-10-24 (Reto 01: Caracterización de Demanda Energética)
- Configuración de información de proyecto y clasificación de instalación (Residencial / Industrial).
- Cuadro de cargas interactivo con franjas horarias configurables (soporte para cruce de medianoche y franjas discontinuas).
- Cálculo automático de potencia instalada ($P_{inst}$), demanda máxima ($P_{max}$), energía diaria ($E_d$), mensual ($E_m$) y anual ($E_a$).
- Estimación de costos con base en tarifa unitaria ($CU$).
- Gráfico dinámico de perfil de demanda de 24 horas con diferenciación diurna/nocturna.
- Exportación e importación en formato Excel (`.xlsx`) y persistencia local en JSON.
- Generación de informe ejecutivo en PDF.
- Soporte multilingüe (Español / Inglés) y modo oscuro / claro.
