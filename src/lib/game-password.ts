import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { ADMIN_PASSWORD } from "@/lib/admin-password";

// Contraseña propia de cada partida, elegida por quien la crea. Es la que
// usa el dueño para recuperar el control si se le cae la página, cambia de
// celular o le quiere pasar el anotador a otro.
//
// Se guarda hasheada con scrypt y salt por partida, nunca en texto plano,
// porque acá la contraseña la elige el usuario y bien puede repetir una que
// use en otro lado.

const KEY_LENGTH = 32;

export function hashGamePassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `${salt}:${hash}`;
}

function matchesGamePassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;

  const expected = Buffer.from(hash, "hex");
  if (expected.length !== KEY_LENGTH) return false;

  const candidate = scryptSync(password, salt, KEY_LENGTH);
  return timingSafeEqual(candidate, expected);
}

// Normaliza lo que escribió el usuario al crear la partida. Si no puso
// nada, la partida queda sin contraseña propia y solo la destraba la
// maestra.
export function normalizeNewPassword(password: string | undefined): string | null {
  const clean = password?.trim() ?? "";
  return clean.length > 0 ? hashGamePassword(clean) : null;
}

// Sirven dos: la que se eligió al crear esa partida, y la maestra
// compartida (así el dueño de la app puede destrabar cualquier partida
// aunque no sepa la que puso el otro).
export function assertCanClaim(password: string, storedHash: string | null) {
  if (password === ADMIN_PASSWORD) return;
  if (storedHash && matchesGamePassword(password, storedHash)) return;
  throw new Error("Contraseña incorrecta");
}
