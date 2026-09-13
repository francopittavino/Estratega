"use client";

import { useState } from "react";

// Marcador de truco a la criolla: cada 5 puntos forman un cuadradito —
// cuatro palitos haciendo el cuadrado y el quinto cruzado en el medio —
// solo que acá los palitos son cigarrillos encendidos.
//
// Los cuadraditos van uno abajo del otro (ver TallyBlock) y se achican solos
// para que los 30 puntos entren en la pantalla del celular sin scrollear. O
// sea que el dibujo tiene que leerse bien a ~70px de lado: todo lo que se ve
// acá está calibrado para ese tamaño, no para mirarlo de cerca.

// Proporciones de un cigarrillo de verdad: 84mm de largo por 8mm de ancho,
// con el filtro ocupando poco menos de un tercio. El ancho va un toque
// exagerado (7.5/64 en vez de 6/64) porque a 70px de lado un palito fiel al
// milímetro queda en dos pixeles y no se distingue nada.
const LENGTH = 64;
const THICKNESS = 7.5;
const HALF = THICKNESS / 2;

type Stick = { x: number; y: number; angle: number };

// Cuadrado de lado 80 con sus esquinas en (10,10) y (90,90). Los cuatro
// lados quedan cortados antes de las esquinas para que ningún cigarrillo se
// monte sobre otro. Cada palito arranca donde termina el anterior (la brasa
// de uno cerca del filtro del siguiente), así las brasas quedan repartidas.
// El quinto, el cruzado, mide lo mismo que los demás: por eso no llega de
// esquina a esquina (la diagonal es más larga que el lado) y queda centrado.
const STICKS: Stick[] = [
  { x: 10, y: 82, angle: -90 }, // 1 · lado izquierdo, brasa abajo
  { x: 18, y: 10, angle: 0 }, // 2 · lado de arriba, brasa a la izquierda
  { x: 90, y: 18, angle: 90 }, // 3 · lado derecho, brasa arriba
  { x: 82, y: 90, angle: 180 }, // 4 · lado de abajo, brasa a la derecha
  { x: 27.4, y: 72.6, angle: -45 }, // 5 · el cruzado, centrado en el medio
];

// De la punta al filtro: ceniza, brasa, papel chamuscado, papel y corcho.
const ASH_END = 4.6;
const EMBER_END = 7.2;
const EMBER_MID = (ASH_END + EMBER_END) / 2;
const CHAR_END = 8.8;
const FILTER_START = LENGTH * 0.71;
// El papel monta un cachito sobre el corcho, como en uno de verdad.
const PAPER_END = FILTER_START + 2.6;

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

// Los degradés y la textura del corcho se declaran UNA sola vez por página y
// los referencian los 60 cigarrillos por id. Adentro de cada <svg> habría
// doce copias de los mismos ids en el DOM. Un paint server se puede
// referenciar desde otro <svg> del mismo documento, así que alcanza con que
// este componente esté montado en algún lado de la página (lo monta
// truco-board).
export function CigaretteDefs() {
  return (
    <svg
      aria-hidden
      focusable="false"
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
    >
      <defs>
        {/* El papel no es blanco plano: es un cilindro. Brillo arriba,
            sombra abajo, que es lo que lo hace parecer redondo. */}
        <linearGradient id="cig-paper" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bdb6ab" />
          <stop offset="16%" stopColor="#ffffff" />
          <stop offset="46%" stopColor="#f7f4ee" />
          <stop offset="78%" stopColor="#c6bfb3" />
          <stop offset="100%" stopColor="#948d82" />
        </linearGradient>

        {/* Mismo cilindro, en corcho. */}
        <linearGradient id="cig-cork" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7a4a1c" />
          <stop offset="16%" stopColor="#e8ad66" />
          <stop offset="46%" stopColor="#d2893a" />
          <stop offset="78%" stopColor="#9d6629" />
          <stop offset="100%" stopColor="#603a13" />
        </linearGradient>

        {/* Los puntitos del corcho. Van de pattern y no de círculos sueltos
            para no sumarle 500 elementos al DOM con el anotador lleno. */}
        <pattern
          id="cig-cork-dots"
          width="2.6"
          height="2.6"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="0.7" cy="0.7" r="0.38" fill="#6b3f16" opacity="0.5" />
          <circle cx="1.9" cy="1.8" r="0.26" fill="#5a340f" opacity="0.42" />
        </pattern>

        {/* La brasa, a lo largo: apagada del lado de la ceniza y al rojo vivo
            del lado del papel, que es la parte que está quemando. */}
        <linearGradient id="cig-fire" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#7d1f03" />
          <stop offset="30%" stopColor="#e03d05" />
          <stop offset="62%" stopColor="#ff8c14" />
          <stop offset="100%" stopColor="#ffdc7a" />
        </linearGradient>

        <linearGradient id="cig-ash" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8d877d" />
          <stop offset="30%" stopColor="#ded8cd" />
          <stop offset="62%" stopColor="#b0a99e" />
          <stop offset="100%" stopColor="#6e685f" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function Cigarette({ x, y, angle, delay }: Stick & { delay: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      {/* Sombra apoyada: sin esto el cigarrillo flota sobre el fondo. */}
      <rect
        x={ASH_END}
        y={-HALF + 1.8}
        width={LENGTH - ASH_END}
        height={THICKNESS}
        rx={HALF}
        fill="#000"
        opacity={0.3}
      />

      {/* Resplandor de la brasa: late para que se vea que está prendida. */}
      <ellipse
        className="cig-ember-glow"
        cx={EMBER_MID}
        cy={0}
        rx={7}
        ry={5.2}
        fill="#ff7a18"
        style={{ filter: "blur(3px)", animationDelay: delay }}
      />

      {/* Filtro de corcho, con la punta de la boquilla más oscura. */}
      <rect
        x={FILTER_START}
        y={-HALF}
        width={LENGTH - FILTER_START}
        height={THICKNESS}
        rx={2}
        fill="url(#cig-cork)"
      />
      <rect
        x={FILTER_START}
        y={-HALF}
        width={LENGTH - FILTER_START}
        height={THICKNESS}
        rx={2}
        fill="url(#cig-cork-dots)"
      />
      <rect
        x={LENGTH - 2.2}
        y={-HALF}
        width={2.2}
        height={THICKNESS}
        rx={1.4}
        fill="#000"
        opacity={0.22}
      />

      {/* Papel, montado un cachito sobre el corcho. */}
      <rect
        x={CHAR_END - 1}
        y={-HALF}
        width={PAPER_END - CHAR_END + 1}
        height={THICKNESS}
        fill="url(#cig-paper)"
      />
      {/* Las dos rayitas finas donde el papel termina sobre el corcho. */}
      <rect
        x={PAPER_END}
        y={-HALF}
        width={0.5}
        height={THICKNESS}
        fill="#7a4a1c"
        opacity={0.8}
      />
      <rect
        x={PAPER_END + 1.1}
        y={-HALF}
        width={0.4}
        height={THICKNESS}
        fill="#7a4a1c"
        opacity={0.55}
      />

      {/* Papel chamuscado justo atrás de la brasa. */}
      <rect
        x={EMBER_END - 0.6}
        y={-HALF}
        width={CHAR_END - EMBER_END + 1}
        height={THICKNESS}
        fill="#8a5a24"
        opacity={0.85}
      />

      {/* La brasa, y su corazón contra el papel, que es lo que quema. */}
      <rect
        x={ASH_END - 0.4}
        y={-HALF + 0.3}
        width={EMBER_END - ASH_END + 0.6}
        height={THICKNESS - 0.6}
        rx={1.2}
        fill="url(#cig-fire)"
      />
      <rect
        x={EMBER_END - 2.4}
        y={-HALF + 1.5}
        width={2}
        height={THICKNESS - 3}
        rx={0.9}
        fill="#fff2c0"
        opacity={0.85}
      />

      {/* Ceniza de la punta: más angosta que el cigarrillo y quebrada, como
          se ve cuando recién se prendió. */}
      <path
        d={`M0 ${-HALF + 1.5} L${ASH_END} ${-HALF + 0.2} L${ASH_END} ${HALF - 0.2} L0 ${HALF - 1.5} Z`}
        fill="url(#cig-ash)"
      />
      <path
        d={`M1.3 ${-HALF + 1.3} L1.9 ${HALF - 1.3}`}
        stroke="#3b3731"
        strokeWidth={0.45}
        opacity={0.75}
      />
      <path
        d={`M2.9 ${-HALF + 0.9} L2.5 ${HALF - 1}`}
        stroke="#3b3731"
        strokeWidth={0.35}
        opacity={0.6}
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

// Un cuadradito: de 0 a 5 cigarrillos. El <svg> se estira al alto que le deja
// el padre y se centra solo (el preserveAspectRatio por defecto), así que el
// cuadrado queda cuadrado sin importar qué tan ancha sea la columna.
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
      className="w-full h-full overflow-visible"
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

// Un bloque del anotador (malas o buenas): hasta 15 puntos = 3 cuadraditos,
// uno abajo del otro. Se reparte en partes iguales el alto que le da el padre
// (flex-1 + min-h-0), que es lo que hace que los 30 puntos entren siempre en
// la pantalla sin scrollear, del celular más chico al monitor más grande.
export function TallyBlock({ value }: { value: number }) {
  const squares = [0, 1, 2].map((i) => Math.min(5, Math.max(0, value - i * 5)));

  return (
    <div className="flex-1 min-h-0 w-full flex flex-col items-center gap-0.5">
      {squares.map((count, i) => (
        <div key={i} className="flex-1 min-h-0 w-full">
          <CigaretteSquare count={count} />
        </div>
      ))}
    </div>
  );
}
