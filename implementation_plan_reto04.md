# Plan de Implementación Técnico — Reto 04 + Cierre Reto 03 (Grupo A)
**Plataforma Integral de Dimensionamiento Solar Fotovoltaico (Retos 01, 02, 03 y 04)**  
**Versión:** `v1.0.0` | **Fecha:** Octubre 2026 | **Institución:** Universidad del Magdalena

---

## 1. Contexto y Objetivos del Reto 04
Integración definitiva de los Retos 01, 02 y 03 en una plataforma web estática de grado profesional, con despliegue en Vercel, cero secretos, adaptabilidad móvil en 360 px, suite de pruebas automatizadas y escenario oficial precargado para el **Grupo A: San Andrés (Insular)**.

Adicionalmente, se asegura el cierre del Reto 03 mediante una **Página Técnica de Componentes Seleccionados** en la aplicación y en el Informe Final exportable.

---

## 2. Requerimientos Funcionales RF-37 a RF-48

### RF-37: Disponibilidad Pública en Vercel
- Despliegue estático HTTPS sin requerir servidor backend para el cálculo.
- Acceso directo sin instalación, sin registro y sin credenciales.

### RF-38: Flujo Completo Unificado
- Navegación reactiva continua: `Proyecto -> Cargas (Reto 01) -> Resultados -> Generador (Reto 02) -> Conversión y Baterías (Reto 03) -> Componentes e Informe (Reto 04)`.
- Sincronización en memoria compartida sin recarga de variables.

### RF-39: Escenario del Grupo A Precargado (San Andrés)
- Carga en un solo clic y mediante archivo JSON.
- Coordenadas: `12,58° N, 81,70° O`. Área: `30 m²`. CU: `1.200 $/kWh`. 365 días/año.
- 8 cargas obligatorias (Pinst = 2.530 W, Ed = 12.865 Wh/día, Pmax = 1.215 W a las 22:00–23:00).
- Justificación técnica del transitorio de arranque de la bomba de cisterna 0,5 HP (~1.800 W).

### RF-40: Persistencia y Exportación Multiformato
- Guardado y carga en archivo `.json`.
- Exportación del informe ejecutivo y de componentes a PDF/Impresión (@media print).
- Exportación tabular completa de resultados y especificaciones de equipos a `.csv` y `.json`.

### RF-41: Recurso Solar con Contingencia y Contraste de Segunda Fuente
- Base local precargada en caso de fallo de APIs externas o modo offline.
- Tabla de contraste de 2 fuentes (PVGIS vs NASA POWER / Atlas UPME) con $|\Delta| \le \pm 15\%$.

### RF-42: Cero Secretos Expuestos
- Auditoría estricta de cero API keys en frontend, repositorio o informes.

### RF-43: Compatibilidad y Adaptabilidad Móvil (360 px)
- Responsive design operable en smartphones de 360 px de ancho.
- Verificación en Google Chrome y Mozilla Firefox.

### RF-44: Consistencia de Idioma, Formato y Unidades
- 100% en español técnico.
- Unidades visibles obligatorias en todas las variables. Redondeo regional consistente (`es-CO`).

### RF-45: Suite de Pruebas Ejecutable
- Panel interactivo que valida:
  1. Caso Reto 01A (Solo Diurno)
  2. Caso Reto 01B (Solo Nocturno)
  3. Caso Reto 01C (Mixto con cruce de medianoche)
  4. Caso Estandarizado (Nazareth, Alta Guajira - Retos 02/03)
  5. Escenario Grupo A (San Andrés - Reto 04)

### RF-46: Blindaje de Casos Borde y Regla de Empate Horario
- Validación defensiva (potencias negativas, cantidades cero, CU <= 0, autonomía inválida).
- Si la demanda máxima ocurre en varias horas, reporta la primera y lista explícitamente las demás.

### RF-47: Documentación Integrada
- Manual de usuario integrado de 2 páginas.
- `README.md` técnico y completo.

### RF-48: Versionado y Trazabilidad v1.0.0
- Etiqueta `v1.0.0` y fecha visibles en UI.
- Archivo `CHANGELOG.md` con trazabilidad completa de cambios.
