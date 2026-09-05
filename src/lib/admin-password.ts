// Contraseña compartida para acciones destructivas o de edición sensible
// (borrar partida, editar/borrar jugador, cambiar foto de un jugador ya
// creado). No es autenticación real, es solo un freno para que no
// cualquiera con el link toque datos ajenos.
export const ADMIN_PASSWORD = "estratega";

export function assertAdminPassword(password: string) {
  if (password !== ADMIN_PASSWORD) {
    throw new Error("Contraseña incorrecta");
  }
}
