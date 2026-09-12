import { cookies } from "next/headers";
import { createHash, randomBytes } from "node:crypto";

// "Dueño de la partida" sin login: el navegador que crea una partida
// recibe una cookie con un id aleatorio (httpOnly, así no se puede leer ni
// falsificar desde JS). En la base guardamos solo el hash de ese id, y
// cualquier acción que cambie puntos lo exige. El resto de la gente puede
// abrir el link y mirar el marcador, pero no tocarlo.
//
// Si el dueño pierde la cookie (borró datos, cambió de celular) o quiere
// pasarle el anotador a otro, hay un botón "Tomar el control" que pide la
// contraseña compartida (ver admin-password.ts) y reasigna el dueño al
// dispositivo actual.

const COOKIE_NAME = "estratega_device";
const FIVE_YEARS_IN_SECONDS = 60 * 60 * 24 * 365 * 5;

function hash(deviceId: string) {
  return createHash("sha256").update(deviceId).digest("hex");
}

// Para renderizar: lee la cookie si existe. No la crea, porque durante el
// render de un Server Component no se pueden escribir cookies.
export async function readDeviceKey(): Promise<string | null> {
  const store = await cookies();
  const id = store.get(COOKIE_NAME)?.value;
  return id ? hash(id) : null;
}

// Para server actions: lee la cookie o la crea si el navegador todavía no
// tiene una.
export async function ensureDeviceKey(): Promise<string> {
  const store = await cookies();
  let id = store.get(COOKIE_NAME)?.value;
  if (!id) {
    id = randomBytes(24).toString("hex");
    store.set(COOKIE_NAME, id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: FIVE_YEARS_IN_SECONDS,
    });
  }
  return hash(id);
}

// Las partidas creadas antes de esta función no tienen dueño (ownerKey
// null): quedan abiertas para cualquiera, como venían funcionando.
export function isOwner(
  ownerKey: string | null,
  deviceKey: string | null
): boolean {
  if (!ownerKey) return true;
  return deviceKey !== null && deviceKey === ownerKey;
}

export const NOT_OWNER_MESSAGE =
  "Solo el que inició la partida puede anotar. Pedile que anote él, o usá " +
  "“Tomar el control” con la contraseña.";

export async function assertOwner(ownerKey: string | null) {
  if (!isOwner(ownerKey, await readDeviceKey())) {
    throw new Error(NOT_OWNER_MESSAGE);
  }
}
