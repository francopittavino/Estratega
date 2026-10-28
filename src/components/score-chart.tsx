"use client";

import { useState, type PointerEvent } from "react";
import { PlayerAvatar } from "@/components/player-avatar";

// Gráfico de línea de cómo fueron los puntos de una partida: el eje X son
// las rondas (El Estratega) o los minutos desde que arrancó (truco), y al
// final de cada línea va la foto del jugador (o las fotos del equipo).
//
// Los colores van por orden fijo y siguen a cada jugador, no a su puesto:
// quien llama tiene que pasar las series siempre en el mismo orden, aunque
// cambie quién va ganando. La paleta está validada para daltonismo contra el
// fondo de las tarjetas (--card).
export const SERIES_COLORS = [
  "#3987e5", // azul
  "#d95926", // naranja
  "#199e70", // aqua
  "#c98500", // amarillo
  "#d55181", // magenta
  "#008300", // verde
  "#9085e9", // violeta
  "#e66767", // rojo
];

export type ChartMember = { id: string; name: string; photoUrl: string | null };

export type ChartSeries = {
  id: string;
  label: string;
  members: ChartMember[];
  // Ordenados por x. El primero es el arranque de la partida (x = 0).
  points: { x: number; y: number }[];
};

type Props = {
  series: ChartSeries[];
  xKind: "round" | "minutes";
  xMax: number;
  // Tope fijo del eje Y (30 en el truco). Sin él, se calcula de los datos.
  yMax?: number;
  // Raya horizontal de referencia (las 15 que parten malas y buenas).
  yGuide?: number;
  // Escalones en vez de rectas: en el truco el puntaje salta de a un punto y
  // se queda quieto hasta el próximo, no crece de a poco entre dos toques.
  step?: boolean;
  height?: number;
};

const AVATAR = 26;
// Lo que se monta una foto sobre la otra en los equipos de 2 y 3.
const AVATAR_OVERLAP = 10;
const PAD_TOP = AVATAR / 2 + 4;
// Abajo van los números del eje X y, debajo, qué miden.
const PAD_BOTTOM = 34;
const PAD_LEFT = 30;
// Entre el final de las líneas y la columna de fotos, para la rayita que une
// cada foto con su punto.
const LEADER = 10;
// Lo mínimo que tiene que haber entre una foto y la de abajo (con su aro).
const AVATAR_GAP = AVATAR + 6;

const Y_STEPS = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000];
const ROUND_STEPS = [1, 2, 5, 10, 20, 50, 100];
const MINUTE_STEPS = [1, 2, 5, 10, 15, 20, 30, 60, 120];

// El paso más chico que deja como mucho maxTicks divisiones hasta max.
function niceStep(max: number, maxTicks: number, steps: number[]) {
  return steps.find((s) => Math.ceil(max / s) <= maxTicks) ?? steps[steps.length - 1];
}

function formatMinutes(minutes: number) {
  const total = Math.round(minutes);
  if (total < 60) return `${total} min`;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return m ? `${h} h ${String(m).padStart(2, "0")}` : `${h} h`;
}

function formatX(kind: Props["xKind"], x: number) {
  if (kind === "minutes") return formatMinutes(x);
  return x === 0 ? "Inicio" : `Ronda ${x}`;
}

// Lo que valía la serie en x: el último punto que no se pasa.
function valueAt(points: ChartSeries["points"], x: number) {
  let value = points[0]?.y ?? 0;
  for (const p of points) {
    if (p.x > x) break;
    value = p.y;
  }
  return value;
}

function groupWidth(members: number) {
  return AVATAR + 4 + (members - 1) * (AVATAR - AVATAR_OVERLAP);
}

export function ScoreChart({
  series,
  xKind,
  xMax: rawXMax,
  yMax: fixedYMax,
  yGuide,
  step = false,
  height: minHeight = 220,
}: Props) {
  const [hoverX, setHoverX] = useState<number | null>(null);

  const colorOf = (index: number) => SERIES_COLORS[index % SERIES_COLORS.length];

  // Con muchos jugadores el gráfico crece, así las fotos de la derecha
  // entran todas una abajo de la otra sin pisarse.
  const height = Math.max(minHeight, series.length * AVATAR_GAP + PAD_TOP + PAD_BOTTOM);
  const xMax = Math.max(rawXMax, 1);
  const dataMax = Math.max(1, ...series.flatMap((s) => s.points.map((p) => p.y)));
  const yStep = niceStep(fixedYMax ?? dataMax, fixedYMax ? 6 : 5, Y_STEPS);
  const yMax = fixedYMax ?? Math.ceil(dataMax / yStep) * yStep;

  const xStep =
    xKind === "round"
      ? niceStep(xMax, 8, ROUND_STEPS)
      : niceStep(xMax, 5, MINUTE_STEPS);
  const xTicks: number[] = [];
  for (let x = 0; x <= xMax + 1e-9; x += xStep) xTicks.push(x);
  const yTicks: number[] = [];
  for (let y = 0; y <= yMax; y += yStep) yTicks.push(y);

  // Coordenadas en % del área de dibujo. El <svg> se estira al tamaño del
  // contenedor (preserveAspectRatio="none") y los trazos llevan
  // non-scaling-stroke para que no se deformen; todo lo que no puede
  // estirarse (textos, fotos, puntitos) va en HTML posicionado con estos %.
  const px = (x: number) => (Math.min(x, xMax) / xMax) * 100;
  const py = (y: number) => 100 - (Math.min(y, yMax) / yMax) * 100;

  function path(points: ChartSeries["points"]) {
    if (points.length === 0) return "";
    const [first, ...rest] = points;
    let d = `M ${px(first.x)} ${py(first.y)}`;
    for (const p of rest) {
      d += step ? ` H ${px(p.x)} V ${py(p.y)}` : ` L ${px(p.x)} ${py(p.y)}`;
    }
    // En escalones la línea sigue derecha hasta "ahora": el puntaje no
    // cambió desde el último toque.
    if (step) d += ` H ${px(xMax)}`;
    return d;
  }

  // Las fotos van en una columna a la derecha, cada una a la altura donde
  // termina su línea. Si dos líneas terminan muy cerca, las fotos se separan
  // lo justo para no pisarse (primero empujando hacia abajo y, si se salen
  // por abajo, hacia arriba), y una rayita las une con el final exacto.
  // Todas las líneas terminan en el borde derecho: la última ronda o "ahora".
  const plotHeight = height - PAD_TOP - PAD_BOTTOM;
  const ends = series
    .map((s, index) => {
      const last = s.points[s.points.length - 1] ?? { x: 0, y: 0 };
      const dotTop = (py(last.y) / 100) * plotHeight;
      return { series: s, color: colorOf(index), x: step ? xMax : last.x, y: last.y, dotTop, top: dotTop };
    })
    .sort((a, b) => a.dotTop - b.dotTop);
  const minTop = AVATAR / 2 - PAD_TOP + 2;
  const maxTop = plotHeight + AVATAR / 2;
  for (let i = 0; i < ends.length; i++) {
    const floor = i === 0 ? minTop : ends[i - 1].top + AVATAR_GAP;
    ends[i].top = Math.max(ends[i].top, floor);
  }
  for (let i = ends.length - 1; i >= 0; i--) {
    const ceiling = i === ends.length - 1 ? maxTop : ends[i + 1].top - AVATAR_GAP;
    ends[i].top = Math.min(ends[i].top, ceiling);
  }
  const padRight =
    LEADER + Math.max(...ends.map((e) => groupWidth(e.series.members.length))) + 2;

  // Los x donde tiene sentido pararse con el dedo o el mouse: el arranque,
  // cada ronda o cada toque, y el final.
  const candidates = [
    ...new Set([0, xMax, ...series.flatMap((s) => s.points.map((p) => p.x))]),
  ].sort((a, b) => a - b);

  function handlePointer(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const fraction = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
    const target = fraction * xMax;
    let best = candidates[0];
    for (const c of candidates) {
      if (Math.abs(c - target) < Math.abs(best - target)) best = c;
    }
    setHoverX(best);
  }

  const hoverRows =
    hoverX === null
      ? []
      : series
          .map((s, index) => ({
            id: s.id,
            label: s.label,
            color: colorOf(index),
            value: valueAt(s.points, hoverX),
          }))
          .sort((a, b) => b.value - a.value);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative select-none" style={{ height }}>
        <div
          className="absolute touch-pan-y"
          style={{ top: PAD_TOP, bottom: PAD_BOTTOM, left: PAD_LEFT, right: padRight }}
          onPointerMove={handlePointer}
          onPointerDown={handlePointer}
          onPointerLeave={() => setHoverX(null)}
          aria-hidden
        >
          <svg
            className="absolute inset-0 h-full w-full overflow-visible"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {yTicks.map((y) => (
              <line
                key={y}
                x1={0}
                x2={100}
                y1={py(y)}
                y2={py(y)}
                stroke="var(--border)"
                strokeWidth={1}
                strokeOpacity={y === 0 ? 1 : 0.5}
                vectorEffect="non-scaling-stroke"
              />
            ))}
            {yGuide !== undefined && (
              <line
                x1={0}
                x2={100}
                y1={py(yGuide)}
                y2={py(yGuide)}
                stroke="var(--muted)"
                strokeWidth={1}
                strokeDasharray="4 4"
                vectorEffect="non-scaling-stroke"
              />
            )}
            {hoverX !== null && (
              <line
                x1={px(hoverX)}
                x2={px(hoverX)}
                y1={0}
                y2={100}
                stroke="var(--muted)"
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
              />
            )}
            {series.map((s, index) => (
              <path
                key={s.id}
                d={path(s.points)}
                fill="none"
                stroke={colorOf(index)}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>

          {yTicks.map((y) => (
            <span
              key={y}
              className="absolute -translate-y-1/2 text-right text-[10px] text-muted tabular-nums"
              style={{ top: `${py(y)}%`, left: -PAD_LEFT, width: PAD_LEFT - 6 }}
            >
              {y}
            </span>
          ))}
          {xTicks.map((x) => (
            <span
              key={x}
              className="absolute top-full mt-1 -translate-x-1/2 text-[10px] text-muted tabular-nums whitespace-nowrap"
              style={{ left: `${px(x)}%` }}
            >
              {xKind === "minutes" ? Math.round(x) : x}
            </span>
          ))}

          {/* La rayita de cada punto a su foto. Va en píxeles y no en %,
              porque vive en el margen derecho, afuera del área de dibujo. */}
          <svg
            className="absolute top-0 left-full overflow-visible"
            width={LEADER}
            height={plotHeight}
          >
            {ends.map((end) => (
              <line
                key={end.series.id}
                x1={0}
                y1={end.dotTop}
                x2={LEADER}
                y2={end.top}
                stroke={end.color}
                strokeWidth={1.5}
              />
            ))}
          </svg>

          {ends.map((end) => (
            <span
              key={`dot-${end.series.id}`}
              className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-card"
              style={{ left: `${px(end.x)}%`, top: end.dotTop, background: end.color }}
            />
          ))}

          {ends.map((end) => (
            <div
              key={`photo-${end.series.id}`}
              className="absolute flex -space-x-2.5 -translate-y-1/2"
              style={{ left: `calc(100% + ${LEADER}px)`, top: end.top }}
            >
              {end.series.members.map((m) => (
                <span
                  key={m.id}
                  className="inline-flex rounded-full p-0.5 shadow-md shadow-black/50"
                  style={{ background: end.color }}
                >
                  <PlayerAvatar name={m.name} photoUrl={m.photoUrl} size={AVATAR} />
                </span>
              ))}
            </div>
          ))}

          {hoverX !== null &&
            hoverRows.map((row) => (
              <span
                key={`hover-${row.id}`}
                className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-card"
                style={{ left: `${px(hoverX)}%`, top: `${py(row.value)}%`, background: row.color }}
              />
            ))}

          {hoverX !== null && (
            <div
              className="absolute top-0 z-10 min-w-32 rounded-lg border border-border bg-background/95 px-2.5 py-2 shadow-xl shadow-black/50 pointer-events-none"
              style={
                px(hoverX) > 55
                  ? { right: `calc(${100 - px(hoverX)}% + 10px)` }
                  : { left: `calc(${px(hoverX)}% + 10px)` }
              }
            >
              <p className="mb-1 text-[11px] font-semibold text-muted">
                {formatX(xKind, hoverX)}
              </p>
              <ul className="flex flex-col gap-0.5">
                {hoverRows.map((row) => (
                  <li key={row.id} className="flex items-center gap-1.5 text-xs">
                    <span
                      className="h-0.5 w-3 shrink-0 rounded-full"
                      style={{ background: row.color }}
                    />
                    <span className="flex-1 truncate">{row.label}</span>
                    <span className="font-semibold tabular-nums">{row.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <span className="absolute bottom-0 right-0 text-[10px] text-muted">
          {xKind === "round" ? "rondas" : "minutos"}
        </span>
      </div>

      {series.length > 1 && (
        <ul className="flex flex-wrap gap-x-4 gap-y-1">
          {series.map((s, index) => (
            <li key={s.id} className="flex items-center gap-1.5 text-xs">
              <span
                className="h-0.5 w-4 rounded-full"
                style={{ background: colorOf(index) }}
              />
              {s.label}
            </li>
          ))}
        </ul>
      )}

      {/* Lo mismo en tabla para el lector de pantalla. El sr-only va en un
          div: a una <table> no le hace caso al ancho de 1px y ensancha la
          página. */}
      <div className="sr-only">
        <table>
          <caption>Puntos de cada uno a lo largo de la partida</caption>
          <thead>
            <tr>
              <th>{xKind === "round" ? "Ronda" : "Minuto"}</th>
              {series.map((s) => (
                <th key={s.id}>{s.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {candidates.map((x) => (
              <tr key={x}>
                <td>{formatX(xKind, x)}</td>
                {series.map((s) => (
                  <td key={s.id}>{valueAt(s.points, x)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
