"use client";

import { useState } from "react";

// Marcador de truco a la criolla: cada 5 puntos forman un cuadradito —
// cuatro palitos haciendo el cuadrado y el quinto cruzado en el medio —
// solo que acá los palitos son cigarrillos encendidos.

const THICKNESS = 9;
const HALF = THICKNESS / 2;
// Todos los cigarrillos miden lo mismo, como en la vida real. Por eso el
// cruzado no llega de esquina a esquina: la diagonal del cuadrado es más
// larga que el lado, así que queda centrado y sin tocar a los demás.
const LENGTH = 64;

type Stick = { x: number; y: number; angle: number };

// Cuadrado de lado 80 con sus esquinas en (10,10) y (90,90). Los cuatro
// lados quedan cortados antes de las esquinas para que ningún cigarrillo se
// monte sobre otro. Cada palito arranca donde termina el anterior (la brasa
// de uno cerca del filtro del siguiente), así las brasas quedan repartidas.
const STICKS: Stick[] = [
  { x: 10, y: 82, angle: -90 }, // 1 · lado izquierdo, brasa abajo
  { x: 18, y: 10, angle: 0 }, // 2 · lado de arriba, brasa a la izquierda
  { x: 90, y: 18, angle: 90 }, // 3 · lado derecho, brasa arriba
  { x: 82, y: 90, angle: 180 }, // 4 · lado de abajo, brasa a la derecha
  { x: 27.4, y: 72.6, angle: -45 }, // 5 · el cruzado, centrado en el medio
];

// De la punta al filtro: ceniza, brasa, papel y filtro naranja.
const ASH_END = 5;
const EMBER_MID = 7.5;
const EMBER_END = 10.5;
const FILTER_START = LENGTH * 0.72;

// Dónde cae la brasa de cada cigarrillo en el cuadradito, para largar el
// humo desde ahí. El humo se dibuja aparte y sin rotar, porque sube derecho
// sin importar cómo esté acostado el cigarrillo.
function emberPoint({ x, y, angle }: Stick) {
  const rad = (angle * Math.PI) / 180;
  return {
    x: x + EMBER_MID * Math.cos(rad),
    y: y + EMBER_MID * Math.sin(rad),
  };
}

function Cigarette({ x, y, angle, delay }: Stick & { delay: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      {/* resplandor de la brasa: late para que se vea que está prendida */}
      <ellipse
        className="cig-ember-glow"
        cx={EMBER_MID}
        cy={0}
        rx={10}
        ry={7.5}
        fill="#ff7a18"
        style={{ filter: "blur(3px)", animationDelay: delay }}
      />

      {/* filtro naranja */}
      <rect
        x={FILTER_START}
        y={-HALF}
        width={LENGTH - FILTER_START}
        height={THICKNESS}
        rx={2.5}
        fill="#f28d1e"
        stroke="rgba(0,0,0,0.45)"
        strokeWidth={0.6}
      />
      <rect x={FILTER_START + 3} y={-HALF + 1} width={1} height={THICKNESS - 2} fill="#c96e0f" />
      <rect x={FILTER_START + 6} y={-HALF + 1} width={1} height={THICKNESS - 2} fill="#c96e0f" />

      {/* papel blanco */}
      <rect
        x={EMBER_END - 1}
        y={-HALF}
        width={FILTER_START - EMBER_END + 2.5}
        height={THICKNESS}
        rx={1.2}
        fill="#ffffff"
        stroke="rgba(0,0,0,0.45)"
        strokeWidth={0.6}
      />
      {/* la banda blanca donde el papel pisa al filtro */}
      <rect
        x={FILTER_START - 1}
        y={-HALF + 0.3}
        width={2.6}
        height={THICKNESS - 0.6}
        fill="#ffffff"
      />

      {/* sombra abajo: sin esto el cigarrillo se ve plano */}
      <rect
        x={EMBER_END}
        y={HALF - 2.2}
        width={LENGTH - EMBER_END - 1}
        height={2}
        rx={1}
        fill="#000"
        opacity={0.16}
      />

      {/* papel chamuscado justo antes de la brasa */}
      <rect
        x={EMBER_END - 1}
        y={-HALF}
        width={2.6}
        height={THICKNESS}
        rx={1}
        fill="#b5651d"
        opacity={0.7}
      />

      {/* ceniza de la punta */}
      <rect
        x={0}
        y={-HALF + 0.9}
        width={ASH_END + 0.6}
        height={THICKNESS - 1.8}
        rx={2}
        fill="#5f5a54"
      />
      <rect
        x={0.9}
        y={-HALF + 1.9}
        width={ASH_END - 1.2}
        height={THICKNESS - 3.8}
        rx={1.2}
        fill="#9a938a"
      />

      {/* la brasa, de rojo apagado en la ceniza a amarillo contra el papel */}
      <rect
        x={ASH_END - 0.4}
        y={-HALF + 0.5}
        width={2.4}
        height={THICKNESS - 1}
        rx={1.2}
        fill="#c23206"
      />
      <rect
        x={ASH_END + 1.4}
        y={-HALF + 0.2}
        width={2.6}
        height={THICKNESS - 0.4}
        rx={1.2}
        fill="#ff6a12"
      />
      <rect
        x={ASH_END + 3.6}
        y={-HALF + 0.2}
        width={EMBER_END - ASH_END - 3.4}
        height={THICKNESS - 0.4}
        rx={1.2}
        fill="#ffb52e"
      />
      <rect
        x={ASH_END + 4.4}
        y={-HALF + 1.6}
        width={EMBER_END - ASH_END - 5}
        height={THICKNESS - 3.2}
        rx={1}
        fill="#fff0b8"
      />
    </g>
  );
}

// La bocanada que larga el cigarrillo cuando lo acabás de poner. Se anima una
// sola vez al montarse: los que ya estaban no se vuelven a montar cuando
// sumás un punto, así que solo humea el nuevo.
function Smoke({ x, y, delay }: { x: number; y: number; delay: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path
        className="cig-smoke"
        style={{ filter: "blur(1.3px)", animationDelay: delay }}
        d="M0 0 c -3.5 -5 3 -8 -0.5 -13 c -3.5 -5 3 -8 -0.5 -13"
        fill="none"
        stroke="#f4f1ea"
        strokeWidth={3.2}
        strokeLinecap="round"
      />
      <path
        className="cig-smoke"
        style={{ filter: "blur(2px)", animationDelay: `calc(${delay} + 0.35s)` }}
        d="M1.5 0 c 3 -4.5 -2.5 -7.5 0.5 -12 c 3 -4.5 -2 -7 0 -11"
        fill="none"
        stroke="#e6e2da"
        strokeWidth={2.4}
        strokeLinecap="round"
      />
    </g>
  );
}

// Un cuadradito: de 0 a 5 cigarrillos.
export function CigaretteSquare({ count }: { count: number }) {
  const shown = Math.min(Math.max(count, 0), STICKS.length);
  const visible = STICKS.slice(0, shown);

  // Los que ya estaban al abrir la página no humean: si no, al entrar
  // largarían humo los 60 cigarrillos del anotador de una y se nota el tirón.
  // El humo es para el que acabás de poner.
  // (useState y no useRef: leer un ref durante el render está prohibido)
  const [alAbrir] = useState(shown);

  return (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-auto overflow-visible"
      role="img"
      aria-label={`${shown} de 5`}
    >
      {/* guía tenue del cuadrado, para que los lugares vacíos no bailen */}
      <rect
        x={10}
        y={10}
        width={80}
        height={80}
        fill="none"
        stroke="currentColor"
        strokeWidth={1}
        strokeDasharray="3 4"
        className="text-border"
        opacity={0.55}
      />
      {visible.map((stick, i) => (
        // Las brasas no titilan todas juntas: cada una arranca un poco
        // después que la anterior.
        <Cigarette key={i} {...stick} delay={`${i * 0.31}s`} />
      ))}
      {visible.map((stick, i) => {
        if (i < alAbrir) return null;
        const { x, y } = emberPoint(stick);
        return <Smoke key={i} x={x} y={y} delay={`${(i - alAbrir) * 0.12}s`} />;
      })}
    </svg>
  );
}

// Un bloque del anotador (malas o buenas): hasta 15 puntos = 3 cuadraditos.
export function TallyBlock({ value, label }: { value: number; label: string }) {
  const squares = [0, 1, 2].map((i) => Math.min(5, Math.max(0, value - i * 5)));

  return (
    <div className="flex flex-col gap-1">
      <p className="text-[10px] uppercase tracking-widest text-muted text-center">
        {label}
      </p>
      {/* Dos por fila y no tres: en un celular cada mitad del anotador mide
          menos de 200px y con tres al lado los cigarrillos no se distinguen. */}
      <div className="grid grid-cols-2 gap-1">
        {squares.map((count, i) => (
          <CigaretteSquare key={i} count={count} />
        ))}
      </div>
    </div>
  );
}
