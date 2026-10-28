/* ═══════════════════════════════════════════════════════════════════════
   pv_visualizer.js — Panel visual interactivo del generador (Reto 02)
   Cuatro vistas interactivas SVG animadas:
   1. 'dia': ☀️ Un día de energía (animación orbital, sol/luna, flujo de potencia y simulación 24h)
   2. 'techo': 🧩 Módulos y área (arreglo Ns × Np, ocupación de techo y comparación gráfica)
   3. 'orient': 🧭 Inclinación y orientación (vista lateral con transportador y brújula 360°)
   4. 'elec': 🔌 Voltaje y corriente (esquema eléctrico, Voc corregido y márgenes NTC 2050 690-8)
   ═══════════════════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    const PVV = {
        h: 12.0,
        play: false,
        raf: 0,
        last: 0,
        view: 'dia'
    };

    const pvvClamp = (x, a, b) => Math.min(b, Math.max(a, x));
    const pvvSun = h => Math.max(0, Math.sin(Math.PI * (h - 6) / 12)); // 0 noche, 1 mediodía
    const fx = (v, d = 2) => Number.isFinite(v) ? v.toLocaleString('es-CO', { minimumFractionDigits: d, maximumFractionDigits: d }) : '—';

    const pvvVIEWS = [
        ['dia', '☀️ Un día de energía'],
        ['techo', '🧩 Módulos y área'],
        ['orient', '🧭 Inclinación y orientación'],
        ['elec', '🔌 Voltaje y corriente']
    ];

    const pvvGloss = `
        <details class="pvv-gloss" style="margin-top: 1rem; font-size: 0.85rem;">
            <summary style="cursor: pointer; font-weight: 700; color: var(--accent);">📖 Glosario de términos del generador FV</summary>
            <dl style="display: grid; grid-template-columns: auto 1fr; gap: 0.35rem 0.9rem; margin-top: 0.6rem;">
                <dt style="font-weight: 700; color: var(--text-primary);">kWp</dt>
                <dd style="margin: 0; color: var(--text-secondary);">Potencia pico instalada en condiciones estándar (1000 W/m², 25°C).</dd>
                <dt style="font-weight: 700; color: var(--text-primary);">HSP</dt>
                <dd style="margin: 0; color: var(--text-secondary);">Horas Sol Pico: horas equivalentes de radiación máxima diaria (1000 W/m²).</dd>
                <dt style="font-weight: 700; color: var(--text-primary);">PR</dt>
                <dd style="margin: 0; color: var(--text-secondary);">Performance Ratio: rendimiento global considerando pérdidas térmicas, polvo, cableado e inversor.</dd>
                <dt style="font-weight: 700; color: var(--text-primary);">Cadena (Serie)</dt>
                <dd style="margin: 0; color: var(--text-secondary);">Módulos conectados sucesivamente: los voltajes se suman manteniendo la corriente.</dd>
                <dt style="font-weight: 700; color: var(--text-primary);">Paralelo</dt>
                <dd style="margin: 0; color: var(--text-secondary);">Cadenas conectadas en paralelo: las corrientes se suman manteniendo el voltaje.</dd>
                <dt style="font-weight: 700; color: var(--text-primary);">Voc / Vmp</dt>
                <dd style="margin: 0; color: var(--text-secondary);">Voltajes de circuito abierto (máximo con frío) y máxima potencia en operación.</dd>
            </dl>
        </details>
    `;

    function pvVisualUpdate() {
        const host = document.getElementById('pv-visual-host');
        if (!host) return;

        const sizingState = window.APP?.state?.sizing || {};
        const selRes = sizingState.selectedResult;
        const profile = typeof calcHourlyProfile === 'function' ? calcHourlyProfile() : new Array(24).fill(0);
        const edKwh = typeof calcDailyEnergy === 'function' ? calcDailyEnergy(profile) : 0;
        const pmax = typeof calcMaxDemand === 'function' ? calcMaxDemand(profile) : 0;

        if (!host.dataset.init) {
            host.dataset.init = '1';
            host.innerHTML = `
                <div class="card fade-in pvv" style="margin-top: 1.25rem;">
                    <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
                        <div>
                            <h2 style="display: flex; align-items: center; gap: 0.5rem; margin: 0;">
                                <span>🔭</span> Visualizador Interactivo del Generador FV (Reto 02)
                            </h2>
                            <p class="card-description" style="margin: 0.25rem 0 0 0;">
                                Figuras y gráficos interactivos que se sincronizan en vivo con tus datos de cargas, módulos y orientación.
                            </p>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="pvv-tabs" style="display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 1rem;">
                            ${pvvVIEWS.map(v => `<button type="button" class="pvv-tab ${v[0] === PVV.view ? 'on' : ''}" data-v="${v[0]}">${v[1]}</button>`).join('')}
                        </div>
                        <div id="pvv-body"></div>
                        ${pvvGloss}
                    </div>
                </div>
            `;

            host.querySelectorAll('.pvv-tab').forEach(b => {
                b.addEventListener('click', () => {
                    PVV.view = b.dataset.v;
                    pvvStop();
                    pvVisualUpdate();
                });
            });
        }

        host.querySelectorAll('.pvv-tab').forEach(b => b.classList.toggle('on', b.dataset.v === PVV.view));

        const body = document.getElementById('pvv-body');
        if (!body) return;

        if (!selRes || !selRes.module || edKwh <= 0) {
            pvvStop();
            body.innerHTML = `
                <div class="pvv-say">
                    ℹ️ Ingrese cargas en la Etapa 1 y seleccione un módulo fotovoltaico para activar el simulador visual del sistema.
                </div>
            `;
            return;
        }

        const m = selRes.module;
        const n = selRes.finalModCount || selRes.modulesCount || 1;
        const pinst = Number.isFinite(selRes.installedPowerKwp)
            ? selRes.installedPowerKwp
            : (Number.isFinite(selRes.installedPowerW) ? selRes.installedPowerW / 1000 : (n * m.pmax / 1000));
        const area = selRes.totalArea || selRes.occupiedAreaM2 || (n * (m.area || 2.58));
        const hsp = (sizingState.solarResource && (sizingState.solarResource.annualHsp || sizingState.solarResource.annual || sizingState.solarResource.hspAnnual)) || 5.6;
        const pr = sizingState.pr || 0.75;
        const egenDaily = Number.isFinite(selRes.estimatedDailyKwh) ? selRes.estimatedDailyKwh : (pinst * hsp * pr);
        const coveragePct = edKwh > 0 ? (egenDaily / edKwh * 100) : 100;

        const kp = [
            [n, 'módulos en arreglo'],
            [fx(pinst, 2) + ' kWp', 'potencia instalada'],
            [fx(area, 1) + ' m²', 'área ocupada'],
            [fx(coveragePct, 0) + ' %', 'cobertura de demanda']
        ];

        const context = {
            m,
            n,
            ns: selRes.ns || Math.max(1, Math.round(n / 2)),
            np: selRes.np || Math.max(1, Math.floor(n / (selRes.ns || 1))),
            pinst,
            area,
            edKwh,
            pmax,
            profile,
            egenDaily,
            tilt: sizingState.tilt ?? 10,
            azimuth: sizingState.azimuth ?? 0,
            availableArea: sizingState.availableArea || 50,
            vmaxSystem: sizingState.vmaxSystem || 600,
            tmin: sizingState.tmin || 20,
            tambOp: sizingState.tambOp || 32,
            thermal: selRes.thermal || {}
        };

        const renderFn = {
            dia: pvvDay,
            techo: pvvLayout,
            orient: pvvOrient,
            elec: pvvElec
        }[PVV.view];

        body.innerHTML = `
            <div class="pvv-kpis">
                ${kp.map(k => `<div class="pvv-kpi"><b>${k[0]}</b><span>${k[1]}</span></div>`).join('')}
            </div>
            ${renderFn(context)}
        `;

        if (PVV.view === 'dia') {
            pvvDayBind(context);
        }
    }

    /* ── Vista 1: un día completo (animación 24h orbital sol/luna, paneles, cargas, flujo) ── */
    function pvvDay(ctx) {
        const bars = ctx.profile;
        const mx = Math.max(...bars, 1);
        const peakW = ctx.egenDaily * 1000 * Math.PI / 24;
        const gmx = Math.max(mx, peakW, 1);
        const X = h => 30 + h * 29.2;
        const Y = w => 110 - w / gmx * 95;

        const stars = [[60, 30], [140, 70], [220, 25], [310, 60], [420, 20], [520, 55], [610, 30], [700, 75], [90, 120], [680, 140], [250, 130], [560, 110]]
            .map(s => `<circle cx="${s[0]}" cy="${s[1]}" r="1.6" fill="#fff"/>`).join('');

        // Path de área para Demanda de Cargas (Stepped Area para reflejar con precisión el consumo horario)
        let demStepCommands = '';
        for (let h = 0; h < 24; h++) {
            const w = bars[h] || 0;
            const yVal = Y(w).toFixed(1);
            const x1 = X(h).toFixed(1);
            const x2 = X(h + 1).toFixed(1);
            if (h === 0) {
                demStepCommands += `M ${x1},${yVal} L ${x2},${yVal}`;
            } else {
                demStepCommands += ` L ${x1},${yVal} L ${x2},${yVal}`;
            }
        }
        const demAreaPath = `${demStepCommands} L ${X(24).toFixed(1)},110 L ${X(0).toFixed(1)},110 Z`;
        const demLinePath = demStepCommands;

        // Path de área para Generación FV (Curva suave sinusoidal diurna)
        const genLinePoints = [];
        for (let i = 0; i <= 48; i++) {
            const h = i / 2;
            const w = peakW * pvvSun(h);
            genLinePoints.push(`${X(h).toFixed(1)},${Y(w).toFixed(1)}`);
        }
        const genLinePath = `M ${genLinePoints.join(' L ')}`;
        const genAreaPath = `M ${X(0).toFixed(1)},110 L ${genLinePoints.join(' L ')} L ${X(24).toFixed(1)},110 Z`;

        const isGrid = window.APP?.state?.project?.systemType === 'on-grid';

        return `
            <div class="pvv-ctrl">
                <button type="button" class="btn btn-primary btn-sm" id="pvv-play">▶ Reproducir el día</button>
                <input type="range" id="pvv-h" min="0" max="23.9" step="0.1" value="${PVV.h}" aria-label="Hora del día">
                <b id="pvv-clock" style="min-width: 3.5rem; color: var(--accent); font-size: 1.05rem;">12:00</b>
            </div>
            <svg viewBox="0 0 760 330" role="img" aria-label="Simulación de generación y consumo solar 24h">
                <rect id="pvv-sky" width="760" height="262" fill="#0f172a"/>
                <g id="pvv-stars">${stars}</g>
                <g class="pvv-cloud" id="pvv-clouds" opacity=".8">
                    <ellipse cx="200" cy="70" rx="46" ry="12" fill="#fff"/>
                    <ellipse cx="228" cy="62" rx="28" ry="12" fill="#fff"/>
                    <ellipse cx="560" cy="100" rx="40" ry="10" fill="#fff"/>
                    <ellipse cx="582" cy="93" rx="24" ry="10" fill="#fff"/>
                </g>
                <g id="pvv-sun">
                    <circle r="30" fill="#fbbf24" opacity=".25" class="pvv-pulse"/>
                    <g class="pvv-rays" stroke="#fbbf24" stroke-width="3" stroke-linecap="round">
                        ${Array.from({ length: 12 }, (_, i) => `<line x1="0" y1="-24" x2="0" y2="-34" transform="rotate(${i * 30})"/>`).join('')}
                    </g>
                    <circle r="17" fill="#fbbf24"/>
                </g>
                <g id="pvv-moon">
                    <circle r="13" fill="#e2e8f0"/>
                    <circle cx="6" cy="-3" r="11" id="pvv-moonmask" fill="#0f172a"/>
                </g>
                <!-- Suelo / Terreno -->
                <rect y="262" width="760" height="68" fill="#166534" opacity=".85"/>
                <!-- Haz solar incidente -->
                <line id="pvv-beam" x1="0" y1="0" x2="0" y2="0" stroke="#fde047" stroke-width="2.5" stroke-dasharray="4 6" class="pvv-flow"/>
                <!-- Arreglo de Paneles con Inclinación Real -->
                <g transform="translate(70,262)">
                    <line x1="30" y1="0" x2="30" y2="-10" stroke="#94a3b8" stroke-width="4"/>
                    <line x1="140" y1="0" x2="140" y2="-26" stroke="#94a3b8" stroke-width="4"/>
                    <g transform="rotate(${-pvvClamp(ctx.tilt, 5, 55)} 0 -8)">
                        <rect x="0" y="-16" width="170" height="10" rx="2" fill="#1e3a8a" stroke="#93c5fd"/>
                        ${[1, 2, 3, 4, 5, 6, 7].map(i => `<line x1="${i * 21.2}" y1="-16" x2="${i * 21.2}" y2="-6" stroke="#60a5fa" stroke-width=".8"/>`).join('')}
                        <rect id="pvv-glow" x="0" y="-16" width="170" height="10" rx="2" fill="#fde68a" opacity="0"/>
                    </g>
                    <text x="85" y="22" text-anchor="middle" font-size="11" fill="#fff" font-weight="700">${ctx.n} módulos · ${ctx.tilt}°</text>
                </g>
                <!-- Inversor / Regulador MPPT -->
                <rect x="305" y="222" width="58" height="40" rx="6" fill="#334155" stroke="#94a3b8" stroke-width="1.5"/>
                <text x="334" y="239" text-anchor="middle" font-size="10.5" font-weight="800" fill="#fff">${isGrid ? 'Inv.' : 'MPPT'}</text>
                <text x="334" y="253" text-anchor="middle" font-size="8.5" fill="#cbd5e1">${isGrid ? 'DC→AC' : 'Control'}</text>
                <!-- Flujo FV -> Inversor -->
                <path id="pvv-f1" d="M238 250 L305 244" stroke="#f59e0b" stroke-width="3.5" fill="none" stroke-linecap="round" opacity="0"/>
                <!-- Flujo Inversor -> Cargas -->
                <path id="pvv-f2" d="M363 244 L435 244" stroke="#f59e0b" stroke-width="3.5" fill="none" stroke-linecap="round" opacity="0"/>
                <!-- Casa / Cargas -->
                <rect x="430" y="210" width="165" height="52" rx="10" fill="#1e293b" stroke="#94a3b8" stroke-width="1.5"/>
                <rect id="pvv-win" x="436" y="216" width="153" height="40" rx="6" fill="#fde047" opacity="0"/>
                <path d="M515 220 l-14 20 h10 l-4 14 l16 -22 h-10 z" fill="#64748b"/>
                <text x="512" y="202" text-anchor="middle" font-size="11" fill="#fff" font-weight="700">Tus Cargas Eléctricas</text>
                <!-- Baterías o Red -->
                ${isGrid ? `
                    <line x1="685" y1="170" x2="685" y2="262" stroke="#94a3b8" stroke-width="4"/>
                    <line x1="670" y1="182" x2="700" y2="182" stroke="#94a3b8" stroke-width="3"/>
                    <text x="685" y="285" text-anchor="middle" font-size="11" fill="#fff" font-weight="700">Red Eléctrica</text>
                    <path id="pvv-f3" d="M595 244 L685 184" stroke="#22c55e" stroke-width="3.5" fill="none" stroke-linecap="round" opacity="0"/>
                ` : `
                    <rect x="635" y="222" width="68" height="40" rx="6" fill="#0f172a" stroke="#94a3b8" stroke-width="1.5"/>
                    <rect id="pvv-batlvl" x="640" y="227" width="30" height="30" rx="3" fill="#22c55e"/>
                    <rect x="703" y="234" width="5" height="16" fill="#94a3b8"/>
                    <text x="670" y="285" text-anchor="middle" font-size="11" fill="#fff" font-weight="700">Baterías</text>
                    <path id="pvv-f3" d="M595 244 L635 244" stroke="#22c55e" stroke-width="3.5" fill="none" stroke-linecap="round" opacity="0"/>
                `}
                <!-- Indicadores de Potencia en Vivo -->
                <text id="pvv-t1" x="16" y="24" font-size="13" font-weight="800" fill="#f59e0b">☀️ Generación: -- W</text>
                <text id="pvv-t2" x="16" y="44" font-size="13" font-weight="800" fill="#38bdf8">🔌 Demanda: -- W</text>
            </svg>
            <!-- Gráfica de Áreas Superpuestas 24h: Consumo vs Generación FV -->
            <svg viewBox="0 0 760 135" style="margin-top: 0.6rem; background: var(--bg-card); border-radius: 10px; border: 1px solid var(--border-subtle);" role="img" aria-label="Curvas superpuestas de consumo y producción solar hora a hora">
                <defs>
                    <linearGradient id="pvv-dem-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#6366f1" stop-opacity="0.45"/>
                        <stop offset="100%" stop-color="#6366f1" stop-opacity="0.08"/>
                    </linearGradient>
                    <linearGradient id="pvv-gen-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.60"/>
                        <stop offset="100%" stop-color="#f59e0b" stop-opacity="0.12"/>
                    </linearGradient>
                </defs>
                <!-- Líneas de cuadrícula horaria y eje base -->
                <line x1="${X(0)}" y1="110" x2="${X(24)}" y2="110" stroke="var(--border-subtle)" stroke-width="1.2"/>
                ${[0, 6, 12, 18, 24].map(h => `<line x1="${X(h)}" y1="15" x2="${X(h)}" y2="110" stroke="var(--border-subtle)" stroke-width="0.8" stroke-dasharray="3 3"/>`).join('')}

                <!-- 1. Área de Demanda de Cargas (Fondo translúcido) -->
                <path d="${demAreaPath}" fill="url(#pvv-dem-grad)" />
                <path d="${demLinePath}" fill="none" stroke="#6366f1" stroke-width="2.2" stroke-linejoin="round" />

                <!-- 2. Área de Generación FV (Frontal luminosa superpuesta) -->
                <path d="${genAreaPath}" fill="url(#pvv-gen-grad)" />
                <path d="${genLinePath}" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />

                <!-- Cursor vertical del momento actual -->
                <line id="pvv-cur" x1="${X(PVV.h)}" x2="${X(PVV.h)}" y1="12" y2="112" stroke="#ef4444" stroke-width="2.2"/>

                <!-- Etiquetas de tiempo -->
                ${[0, 6, 12, 18, 23].map(h => `<text x="${X(h)}" y="126" text-anchor="middle" font-size="10" fill="var(--text-muted)">${String(h).padStart(2, '0')}:00</text>`).join('')}

                <!-- Leyenda de áreas superpuestas -->
                <text x="745" y="15" text-anchor="end" font-size="10.5">
                    <tspan fill="#818cf8" font-weight="700">■ Área Demanda Cargas</tspan>&nbsp;&nbsp;&nbsp;&nbsp;
                    <tspan fill="#f59e0b" font-weight="700">■ Área Generación FV</tspan>
                </text>
            </svg>
            <div class="pvv-say" id="pvv-say"></div>
        `;
    }

    function pvvDayBind(ctx) {
        const sl = document.getElementById('pvv-h');
        const pb = document.getElementById('pvv-play');
        const peakW = ctx.egenDaily * 1000 * Math.PI / 24;
        const isGrid = window.APP?.state?.project?.systemType === 'on-grid';
        const pm = Math.max(ctx.pmax, 1);

        const draw = h => {
            PVV.h = h;
            const sky = document.getElementById('pvv-sky');
            if (!sky) return;

            const s = pvvSun(h);
            const day = pvvClamp(s * 3, 0, 1);
            const gen = peakW * s;
            const dem = ctx.profile[Math.floor(h) % 24] || 0;

            const lerp = (a, b) => Math.round(a + (b - a) * day);
            const skyCol = `rgb(${lerp(15, 125)},${lerp(23, 211)},${lerp(42, 252)})`;
            sky.setAttribute('fill', skyCol);

            const mmask = document.getElementById('pvv-moonmask');
            if (mmask) mmask.setAttribute('fill', skyCol);

            const stars = document.getElementById('pvv-stars');
            if (stars) stars.setAttribute('opacity', 1 - day);

            const sun = document.getElementById('pvv-sun');
            const moon = document.getElementById('pvv-moon');
            const beam = document.getElementById('pvv-beam');

            if (h >= 6 && h <= 18) {
                const a = Math.PI * (h - 6) / 12;
                const x = 380 - 320 * Math.cos(a);
                const y = 250 - 195 * Math.sin(a);
                if (sun) {
                    sun.setAttribute('transform', `translate(${x},${y})`);
                    sun.setAttribute('opacity', 1);
                }
                if (moon) moon.setAttribute('opacity', 0);
                if (beam) {
                    beam.setAttribute('x1', x);
                    beam.setAttribute('y1', y);
                    beam.setAttribute('x2', 155);
                    beam.setAttribute('y2', 238);
                    beam.setAttribute('opacity', (0.2 + 0.8 * s).toFixed(2));
                }
            } else {
                const hn = h > 18 ? h - 18 : h + 6;
                const a = Math.PI * hn / 12;
                if (moon) {
                    moon.setAttribute('transform', `translate(${380 - 320 * Math.cos(a)},${250 - 195 * Math.sin(a)})`);
                    moon.setAttribute('opacity', 1);
                }
                if (sun) sun.setAttribute('opacity', 0);
                if (beam) beam.setAttribute('opacity', 0);
            }

            const glow = document.getElementById('pvv-glow');
            if (glow) glow.setAttribute('opacity', (0.75 * s).toFixed(2));

            const on = gen > 5;
            ['pvv-f1', 'pvv-f2'].forEach(id => {
                const f = document.getElementById(id);
                if (f) {
                    f.setAttribute('opacity', on ? 1 : 0);
                    f.classList.toggle('pvv-flow', on);
                }
            });

            const win = document.getElementById('pvv-win');
            if (win) win.setAttribute('opacity', (pvvClamp(dem / pm, 0, 1) * 0.95 + (dem > 0 ? 0.05 : 0)).toFixed(2));

            const f3 = document.getElementById('pvv-f3');
            const diff = gen - dem;
            const act = Math.abs(diff) > 2;
            if (f3) {
                f3.setAttribute('opacity', act ? 1 : 0);
                f3.classList.toggle('pvv-flow', act);
                f3.classList.toggle('rev', diff < 0);
                f3.setAttribute('stroke', diff >= 0 ? '#10b981' : '#f97316');
            }

            const bl = document.getElementById('pvv-batlvl');
            if (bl) {
                const lvl = pvvClamp(8 + 22 * (0.5 + 0.5 * Math.sin(Math.PI * (h - 12) / 12) * (gen > dem ? 1 : 0.6)), 5, 30);
                bl.setAttribute('width', lvl);
            }

            const t1 = document.getElementById('pvv-t1');
            const t2 = document.getElementById('pvv-t2');
            if (t1) t1.textContent = `☀️ Generación: ${Math.round(gen).toLocaleString('es-CO')} W`;
            if (t2) t2.textContent = `🔌 Demanda: ${Math.round(dem).toLocaleString('es-CO')} W`;

            const cur = document.getElementById('pvv-cur');
            if (cur) {
                const curX = 30 + h * 29.2;
                cur.setAttribute('x1', curX);
                cur.setAttribute('x2', curX);
            }

            const clock = document.getElementById('pvv-clock');
            if (clock) {
                const hr = String(Math.floor(h)).padStart(2, '0');
                const mn = String(Math.floor((h % 1) * 60)).padStart(2, '0');
                clock.textContent = `${hr}:${mn}`;
            }

            if (sl) sl.value = h;

            const say = document.getElementById('pvv-say');
            if (say) {
                if (gen < 2) {
                    say.innerHTML = isGrid
                        ? '🌙 <b>Noche:</b> Los paneles no generan energía. Las cargas se alimentan directamente de la <b>red eléctrica</b>.'
                        : '🌙 <b>Noche:</b> Las cargas se alimentan de la energía almacenada en el <b>banco de baterías</b>.';
                } else if (diff >= 0) {
                    say.innerHTML = isGrid
                        ? `☀️ <b>Generación solar plena:</b> Los paneles cubren el 100% de la demanda instantánea y entregan un excedente de <b>${Math.round(diff)} W</b> a la red.`
                        : `☀️ <b>Generación solar plena:</b> Los paneles abastecen las cargas y destinan el excedente de <b>${Math.round(diff)} W</b> a la recarga de baterías.`;
                } else {
                    say.innerHTML = isGrid
                        ? `⛅ <b>Generación parcial:</b> Los paneles entregan ${Math.round(gen)} W; los <b>${Math.round(-diff)} W</b> restantes se toman de la red.`
                        : `⛅ <b>Generación parcial:</b> Los paneles aportan ${Math.round(gen)} W; los <b>${Math.round(-diff)} W</b> restantes provienen de las baterías.`;
                }
            }
        };

        if (sl) {
            sl.addEventListener('input', () => {
                pvvStop();
                draw(+sl.value);
            });
        }

        if (pb) {
            pb.addEventListener('click', () => {
                if (PVV.play) {
                    pvvStop();
                } else {
                    PVV.play = true;
                    pb.textContent = '⏸ Pausar';
                    PVV.last = performance.now();
                    const step = t => {
                        if (!PVV.play || !document.getElementById('pvv-h')) return pvvStop();
                        const dt = (t - PVV.last) / 1000;
                        PVV.last = t;
                        draw((PVV.h + dt * 2.5) % 24);
                        PVV.raf = requestAnimationFrame(step);
                    };
                    PVV.raf = requestAnimationFrame(step);
                }
            });
        }

        draw(PVV.h);
    }

    function pvvStop() {
        PVV.play = false;
        cancelAnimationFrame(PVV.raf);
        const b = document.getElementById('pvv-play');
        if (b) b.textContent = '▶ Reproducir el día';
    }

    /* ── Vista 2: módulos, cadenas y comparación de área ── */
    function pvvLayout(ctx) {
        const cells = Math.min(ctx.ns, 20);
        const rows = Math.min(ctx.np, 8);
        const cw = 20, rh = 24;

        const grid = Array.from({ length: rows }, (_, r) =>
            `<text x="8" y="${40 + r * rh + 12}" font-size="10" fill="var(--text-muted)">C${r + 1}</text>` +
            Array.from({ length: cells }, (_, c) =>
                `<rect class="pvv-cell" style="animation-delay:${(r * cells + c) * 12}ms" x="${38 + c * (cw + 3)}" y="${40 + r * rh}" width="${cw}" height="16" rx="2" fill="#1e3a8a" stroke="#60a5fa"/>`
            ).join('')
        ).join('');

        const H1 = 50 + rows * rh;
        const maxA = Math.max(ctx.area, ctx.availableArea, 1);
        const w = v => Math.max(8, 540 * v / maxA);
        const over = ctx.area > ctx.availableArea;
        const tennis = ctx.area / 260; // 260 m² es el área de una cancha de tenis estándar

        return `
            <svg viewBox="0 0 760 ${H1 + 160}" role="img" aria-label="Distribución física de módulos y área">
                <text x="8" y="22" font-size="13" font-weight="700" fill="var(--text-primary)">
                    Distribución de los ${ctx.n} módulos: ${ctx.np} cadena(s) en paralelo de ${ctx.ns} en serie
                </text>
                ${grid}
                <g transform="translate(0,${H1 + 10})">
                    <text x="8" y="16" font-size="13" font-weight="700" fill="var(--text-primary)">Comparación de Superficie vs Área Disponible</text>
                    <rect x="38" y="30" width="${w(ctx.availableArea)}" height="26" rx="6" fill="#64748b" opacity=".4"/>
                    <text x="48" y="47" font-size="11.5" fill="#fff" font-weight="700">Área disponible: ${fx(ctx.availableArea, 0)} m²</text>
                    <rect x="38" y="66" width="${w(ctx.area)}" height="26" rx="6" fill="${over ? '#ef4444' : '#10b981'}" class="pvv-cell"/>
                    <text x="48" y="83" font-size="11.5" fill="#fff" font-weight="700">Área requerida por generador: ${fx(ctx.area, 1)} m²</text>
                    <text x="8" y="122" font-size="11.5" fill="var(--text-muted)">
                        ≈ Equivalente a ${fx(tennis, 2)} cancha(s) de tenis (260 m² cada una).
                    </text>
                </g>
            </svg>
            <div class="pvv-say">
                ${over
                    ? `⚠️ <b>Atención:</b> El generador sobrepasa el área declarada por <b>${fx(ctx.area - ctx.availableArea, 1)} m²</b>. Se recomienda seleccionar un módulo de mayor potencia unitaria o habilitar más superficie.`
                    : `✅ <b>Área suficiente:</b> El generador cabe holgadamente, dejando <b>${fx(ctx.availableArea - ctx.area, 1)} m²</b> disponibles para pasillos de mantenimiento.`
                }
            </div>
        `;
    }

    /* ── Vista 3: inclinación lateral y brújula de azimut ── */
    function pvvOrient(ctx) {
        const t = ctx.tilt || 10;
        const az = ctx.azimuth || 0;
        const brg = (180 + az) * Math.PI / 180;
        const dx = Math.sin(brg) * 60;
        const dy = -Math.cos(brg) * 60;

        return `
            <svg viewBox="0 0 760 270" role="img" aria-label="Inclinación y brújula de orientación">
                <!-- Inclinación lateral -->
                <text x="20" y="24" font-size="13" font-weight="700" fill="var(--text-primary)">Inclinación del plano: ${t}°</text>
                <rect x="20" y="215" width="320" height="8" fill="#166534"/>
                <g transform="translate(60,215)">
                    <line x1="0" y1="0" x2="200" y2="0" stroke="#94a3b8" stroke-dasharray="4 4"/>
                    <g style="transform:rotate(${-t}deg);transition:transform .5s">
                        <rect x="0" y="-10" width="200" height="10" rx="2" fill="#1e3a8a" stroke="#60a5fa"/>
                    </g>
                    <path d="M70 0 A70 70 0 0 0 ${(70 * Math.cos(t * Math.PI / 180)).toFixed(1)} ${(-70 * Math.sin(t * Math.PI / 180)).toFixed(1)}" fill="none" stroke="#f59e0b" stroke-width="2.5" class="pvv-draw"/>
                    <text x="80" y="-8" font-size="13" font-weight="800" fill="#f59e0b">${t}°</text>
                </g>
                <text x="20" y="250" font-size="11" fill="var(--text-muted)">
                    En Colombia (latitudes bajas) se recomiendan inclinaciones entre 10° y 15° para facilitar autolimpieza por lluvia.
                </text>

                <!-- Brújula de Azimut -->
                <text x="420" y="24" font-size="13" font-weight="700" fill="var(--text-primary)">Orientación (Azimut): ${az}°</text>
                <g transform="translate(560,140)">
                    <circle r="85" fill="none" stroke="var(--border-input)" stroke-width="2"/>
                    <text y="-92" text-anchor="middle" font-size="12" font-weight="800" fill="var(--text-secondary)">N</text>
                    <text y="104" text-anchor="middle" font-size="12" font-weight="800" fill="var(--accent)">S (0°)</text>
                    <text x="-98" y="4" text-anchor="middle" font-size="12" font-weight="800" fill="var(--text-secondary)">O</text>
                    <text x="98" y="4" text-anchor="middle" font-size="12" font-weight="800" fill="var(--text-secondary)">E</text>
                    <line x1="0" y1="0" x2="0" y2="60" stroke="#94a3b8" stroke-dasharray="3 4"/>
                    <g style="transition:all .5s">
                        <line x1="0" y1="0" x2="${dx.toFixed(1)}" y2="${dy.toFixed(1)}" stroke="#f59e0b" stroke-width="5" stroke-linecap="round" class="pvv-draw"/>
                        <circle cx="${dx.toFixed(1)}" cy="${dy.toFixed(1)}" r="9" fill="#f59e0b" class="pvv-pulse"/>
                    </g>
                    <rect x="-14" y="-14" width="28" height="28" rx="3" fill="#1e3a8a" stroke="#60a5fa" transform="rotate(${az})"/>
                </g>
            </svg>
            <div class="pvv-say">
                🧭 Los módulos están orientados a <b>${az}°</b> (con respecto al Sur) e inclinados <b>${t}°</b>. La flecha ámbar indica el vector normal hacia el sol.
            </div>
        `;
    }

    /* ── Vista 4: voltaje serie y corriente paralelo ── */
    function pvvElec(ctx) {
        const m = ctx.m;
        const vocCold = ctx.thermal.vocColdArray || (ctx.ns * m.voc * (1 + (m.bVoc || -0.27)/100 * (ctx.tmin - 25)));
        const vmax = ctx.vmaxSystem || 600;
        const pctVoc = pvvClamp(vocCold / vmax * 100, 0, 120);
        const vocOk = vocCold <= vmax;
        const iscArr = ctx.thermal.iscArray || (ctx.np * m.isc);
        const idis = ctx.thermal.iDiseno || (iscArr * 1.5625);

        return `
            <svg viewBox="0 0 760 260" role="img" aria-label="Esquema eléctrico de conexión serie y paralelo">
                <text x="20" y="24" font-size="13" font-weight="700" fill="var(--text-primary)">
                    Conexión eléctrica: ${ctx.np} cadena(s) en paralelo × ${ctx.ns} módulo(s) en serie
                </text>
                <!-- Cadenas ilustrativas -->
                ${Array.from({ length: Math.min(ctx.np, 3) }, (_, r) => {
                    const y = 50 + r * 42;
                    return `
                        <g>
                            <text x="20" y="${y + 14}" font-size="10.5" fill="var(--text-secondary)">Cadena ${r + 1}:</text>
                            <rect x="80" y="${y}" width="48" height="24" rx="3" fill="#1e3a8a" stroke="#60a5fa"/>
                            <text x="104" y="${y + 15}" font-size="10" fill="#fff" text-anchor="middle">${m.vmp}V</text>
                            <line x1="128" y1="${y + 12}" x2="148" y2="${y + 12}" stroke="#f59e0b" stroke-width="2.5"/>
                            <rect x="148" y="${y}" width="48" height="24" rx="3" fill="#1e3a8a" stroke="#60a5fa"/>
                            <text x="172" y="${y + 15}" font-size="10" fill="#fff" text-anchor="middle">${m.vmp}V</text>
                            <text x="205" y="${y + 16}" font-size="12" fill="var(--text-muted)">… × ${ctx.ns} módulos</text>
                        </g>
                    `;
                }).join('')}

                <!-- Barra de Voltaje de Seguridad -->
                <text x="360" y="52" font-size="12.5" font-weight="700" fill="var(--text-primary)">Tensión Máxima del Generador (Voc @ ${ctx.tmin}°C)</text>
                <rect x="360" y="62" width="360" height="22" rx="11" fill="var(--bg-input)"/>
                <rect x="360" y="62" width="${(360 * Math.min(pctVoc, 100) / 100).toFixed(0)}" height="22" rx="11" fill="${vocOk ? '#10b981' : '#ef4444'}"/>
                <text x="360" y="104" font-size="11.5" fill="var(--text-primary)" font-weight="700">
                    ${vocCold.toFixed(1)} V calculados de un límite de ${vmax} V (${pctVoc.toFixed(0)}%)
                </text>

                <!-- Corrientes -->
                <text x="360" y="138" font-size="12.5" font-weight="700" fill="var(--text-primary)">Corrientes de Arreglo (NTC 2050)</text>
                <text x="360" y="158" font-size="12" fill="var(--text-secondary)">• Corriente de Cortocircuito (Isc gen): <strong>${iscArr.toFixed(1)} A</strong> (${ctx.np} × ${m.isc}A)</text>
                <text x="360" y="178" font-size="12" fill="var(--text-secondary)">• Corriente de Diseño NTC 2050 Art. 690-8 (×1.5625): <strong style="color:var(--accent);">${idis.toFixed(1)} A</strong></text>
            </svg>
            <div class="pvv-say">
                ${vocOk
                    ? `✅ <b>Tensión segura:</b> El voltaje corregido a temperatura mínima (${vocCold.toFixed(1)} V) no excede la tensión admisible (${vmax} V).`
                    : `⛔ <b>Peligro de sobretensión:</b> El voltaje (${vocCold.toFixed(1)} V) supera el límite de ${vmax} V. Debe reducirse el número de módulos en serie.`
                }
            </div>
        `;
    }

    window.pvVisualUpdate = pvVisualUpdate;

    document.addEventListener('DOMContentLoaded', () => {
        // Enlazar al botón de dimensionamiento o recálculo
        setTimeout(pvVisualUpdate, 500);
    });
})();

