// Marcador de truco a la criolla: cada 5 puntos forman un cuadradito —
// cuatro palitos haciendo el cuadrado y el quinto cruzado en el medio —
// solo que acá los palitos son cigarrillos encendidos.

const THICKNESS = 10;

type Stick = { x: number; y: number; angle: number; length: number };

// Cuadrado de lado 82 con sus esquinas en (9,9) y (91,91): ocupa casi todo
// el viewBox para que en un celular los cigarrillos se vean grandes. Cada
// palito arranca donde termina el anterior, así las brasas quedan repartidas.
const STICKS: Stick[] = [
  { x: 9, y: 91, angle: -90, length: 82 }, // 1 · lado izquierdo
  { x: 9, y: 9, angle: 0, length: 82 }, // 2 · lado de arriba
  { x: 91, y: 9, angle: 90, length: 82 }, // 3 · lado derecho
  { x: 91, y: 91, angle: 180, length: 82 }, // 4 · lado de abajo
  { x: 12, y: 88, angle: -45, length: 111.7 }, // 5 · la cruzada del medio
];

function Cigarette({ x, y, angle, length }: Stick) {
  const half = THICKNESS / 2;
  const filterStart = length * 0.68;

  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      {/* papel */}
      <rect
        x={2.5}
        y={-half}
        width={filterStart - 2.5}
        height={THICKNESS}
        rx={1.5}
        fill="#f7f2e8"
        stroke="rgba(0,0,0,0.45)"
        strokeWidth={0.7}
      />
      {/* filtro */}
      <rect
        x={filterStart - 1}
        y={-half}
        width={length - filterStart + 1}
        height={THICKNESS}
        rx={2}
        fill="#d89b4a"
        stroke="rgba(0,0,0,0.45)"
        strokeWidth={0.7}
      />
      <line
        x1={filterStart + 2.5}
        y1={-half + 0.7}
        x2={filterStart + 2.5}
        y2={half - 0.7}
        stroke="#a9742d"
        strokeWidth={0.9}
      />
      {/* sombra de abajo, para que no quede plano */}
      <rect
        x={3}
        y={half - 2.4}
        width={length - 4}
        height={2.4}
        rx={1.1}
        fill="#000"
        opacity={0.18}
      />
      {/* ceniza y brasa */}
      <rect
        x={0}
        y={-half + 0.7}
        width={4}
        height={THICKNESS - 1.4}
        rx={1.4}
        fill="#7d766d"
      />
      <ellipse
        cx={1.5}
        cy={0}
        rx={2.3}
        ry={half - 0.9}
        fill="#ff6a12"
        style={{ filter: "drop-shadow(0 0 2.5px rgba(255,106,18,0.95))" }}
      />
      <ellipse cx={1.3} cy={0} rx={1.1} ry={half - 2.6} fill="#ffd166" />
    </g>
  );
}

// Un cuadradito: de 0 a 5 cigarrillos.
export function CigaretteSquare({ count }: { count: number }) {
  const shown = Math.min(Math.max(count, 0), STICKS.length);

  return (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-auto"
      role="img"
      aria-label={`${shown} de 5`}
    >
      {/* guía tenue del cuadrado, para que los lugares vacíos no bailen */}
      <rect
        x={9}
        y={9}
        width={82}
        height={82}
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
