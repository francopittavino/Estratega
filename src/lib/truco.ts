// Reglas y etiquetas del anotador de truco. Fuente única, usada tanto por
// la UI como por la validación de los server actions.

// Se juega a 30: 15 de malas y 15 de buenas. No se puede pasar de 30.
export const TRUCO_TARGET = 30;
export const TRUCO_HALF = TRUCO_TARGET / 2;

// Cuántos jugadores por equipo. 1 = solitario, 2 = dúo, 3 = trío.
export const TEAM_SIZES = [1, 2, 3] as const;
export type TeamSize = (typeof TEAM_SIZES)[number];

export function isTeamSize(value: number): value is TeamSize {
  return (TEAM_SIZES as readonly number[]).includes(value);
}

export const TEAM_SIZE_SHORT: Record<number, string> = {
  1: "1 vs 1",
  2: "2 vs 2",
  3: "3 vs 3",
};

export const TEAM_SIZE_NAME: Record<number, string> = {
  1: "Solitario",
  2: "Dúo",
  3: "Trío",
};

export const TEAM_SIZE_PLURAL: Record<number, string> = {
  1: "Solitarios",
  2: "Dúos",
  3: "Tríos",
};

// Un puntaje de 0..30 partido en los dos bloques del anotador criollo.
export function splitScore(points: number) {
  const clamped = Math.min(Math.max(points, 0), TRUCO_TARGET);
  return {
    malas: Math.min(clamped, TRUCO_HALF),
    buenas: Math.max(clamped - TRUCO_HALF, 0),
  };
}
