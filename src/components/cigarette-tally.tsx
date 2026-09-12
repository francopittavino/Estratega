// Marcador de truco a la criolla: cada 5 puntos forman un cuadradito —
// cuatro palitos haciendo el cuadrado y el quinto cruzado en el medio —
// solo que acá los palitos son cigarrillos encendidos.

const THICKNESS = 9;
const HALF = THICKNESS / 2;

type Stick = { x: number; y: number; angle: number; length: number };

// Cuadrado de lado 80 con sus esquinas en (10,10) y (90,90).
//
// Los cuatro lados no llegan a las esquinas: quedan cortados antes para que
// ningún cigarrillo se monte sobre otro (antes se cruzaban en las esquinas y
// se veía todo amontonado). Los huecos que quedan en las esquinas de abajo a
// la izquierda y arriba a la derecha son justo por donde pasa el cigarrillo
// cruzado, así que tampoco toca a ninguno.
//
// Cada palito arranca donde termina el anterior (la brasa de uno queda cerca
// del filtro del siguiente), así las brasas quedan repartidas por todo el
// cuadradito y no amontonadas de un lado.
const STICKS: Stick[] = [
  { x: 10, y: 74, angle: -90, length: 56 }, // 1 · lado izquierdo, brasa abajo
  { x: 18, y: 10, angle: 0, length: 56 }, // 2 · lado de arriba, brasa a la izquierda
  { x: 90, y: 26, angle: 90, length: 56 }, // 3 · lado derecho, brasa arriba
  { x: 82, y: 90, angle: 180, length: 56 }, // 4 · lado de abajo, brasa a la derecha
  { x: 10, y: 90, angle: -45, length: 113.1 }, // 5 · la cruzada, esquina a esquina
];

// El resplandor de la brasa. Va como filtro CSS y no como <filter> de SVG
// para no tener que darle un id único a cada cuadradito.
const EMBER_GLOW =
  "drop-shadow(0 0 2px rgba(255,170,60,1)) drop-shadow(0 0 7px rgba(255,95,0,0.9))";

function Cigarette({ x, y, angle, length }: Stick) {
  // De la punta al filtro: ceniza, brasa, papel y corcho. La brasa va en
  // bandas de rojo apagado a amarillo: la parte más caliente es la que toca
  // el papel sin quemar, y hacia la punta se va enfriando hasta la ceniza.
  const ashEnd = 5;
  const emberEnd = 10.5;
  const filterStart = length * 0.72;

  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      {/* corcho del filtro */}
      <rect
        x={filterStart}
        y={-HALF}
        width={length - filterStart}
        height={THICKNESS}
        rx={2.5}
        fill="#c49a6c"
        stroke="rgba(0,0,0,0.5)"
        strokeWidth={0.6}
      />
      {/* dos rayitas del corcho, que es lo que lo hace leer como filtro */}
      <rect x={filterStart + 3} y={-HALF + 1} width={1} height={THICKNESS - 2} fill="#a97f52" />
      <rect x={filterStart + 6} y={-HALF + 1} width={1} height={THICKNESS - 2} fill="#a97f52" />

      {/* papel */}
      <rect
        x={emberEnd - 1}
        y={-HALF}
        width={filterStart - emberEnd + 2.5}
        height={THICKNESS}
        rx={1.2}
        fill="#f6f2e9"
        stroke="rgba(0,0,0,0.5)"
        strokeWidth={0.6}
      />
      {/* la banda blanca donde el papel pisa al corcho */}
      <rect
        x={filterStart - 1}
        y={-HALF + 0.3}
        width={2.6}
        height={THICKNESS - 0.6}
        fill="#fdfbf6"
      />

      {/* brillo arriba y sombra abajo: sin esto el cigarrillo se ve plano */}
      <rect
        x={emberEnd}
        y={-HALF + 0.8}
        width={length - emberEnd - 1}
        height={1.6}
        rx={0.8}
        fill="#fff"
        opacity={0.45}
      />
      <rect
        x={emberEnd}
        y={HALF - 2.4}
        width={length - emberEnd - 1}
        height={2.2}
        rx={1}
        fill="#000"
        opacity={0.25}
      />

      {/* chamuscado del papel justo antes de la brasa */}
      <rect
        x={emberEnd - 1}
        y={-HALF}
        width={3}
        height={THICKNESS}
        rx={1}
        fill="#8a5a2b"
        opacity={0.75}
      />

      {/* ceniza de la punta: gris oscuro por fuera, más clara por dentro */}
      <rect
        x={0}
        y={-HALF + 0.9}
        width={ashEnd + 0.6}
        height={THICKNESS - 1.8}
        rx={2}
        fill="#5f5a54"
      />
      <rect
        x={0.9}
        y={-HALF + 1.9}
        width={ashEnd - 1.2}
        height={THICKNESS - 3.8}
        rx={1.2}
        fill="#9a938a"
      />

      {/* la brasa, de rojo apagado en la ceniza a amarillo contra el papel */}
      <g style={{ filter: EMBER_GLOW }}>
        <rect
          x={ashEnd - 0.4}
          y={-HALF + 0.5}
          width={2.4}
          height={THICKNESS - 1}
          rx={1.2}
          fill="#b32c05"
        />
        <rect
          x={ashEnd + 1.4}
          y={-HALF + 0.2}
          width={2.6}
          height={THICKNESS - 0.4}
          rx={1.2}
          fill="#ff6410"
        />
        <rect
          x={ashEnd + 3.6}
          y={-HALF + 0.2}
          width={emberEnd - ashEnd - 3.4}
          height={THICKNESS - 0.4}
          rx={1.2}
          fill="#ffb52e"
        />
        <rect
          x={ashEnd + 4.4}
          y={-HALF + 1.6}
          width={emberEnd - ashEnd - 5}
          height={THICKNESS - 3.2}
          rx={1}
          fill="#ffe9a3"
        />
      </g>
    </g>
  );
}

// Un cuadradito: de 0 a 5 cigarrillos.
export function CigaretteSquare({ count }: { count: number }) {
  const shown = Math.min(Math.max(count, 0), STICKS.length);

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
      {STICKS.slice(0, shown).map((stick, i) => (
        <Cigarette key={i} {...stick} />
      ))}
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
