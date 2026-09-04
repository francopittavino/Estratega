import { prisma } from "@/lib/prisma";
import { createPlayer } from "@/lib/actions/players";
import { PlayerAvatar } from "@/components/player-avatar";

export const dynamic = "force-dynamic";

export default async function JugadoresPage() {
  const players = await prisma.player.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <section className="bg-card border border-border rounded-xl p-4 sm:p-6">
        <h2 className="font-semibold text-lg mb-3">Nuevo jugador</h2>
        <form action={createPlayer} className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="text-sm text-muted">
              Nombre
            </label>
            <input
              id="name"
              name="name"
              required
              placeholder="Nombre del jugador"
              className="border border-border rounded-md px-3 py-2 text-sm min-w-[200px]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="photo" className="text-sm text-muted">
              Foto (opcional)
            </label>
            <input
              id="photo"
              name="photo"
              type="file"
              accept="image/*"
              className="text-sm"
            />
          </div>
          <button
            type="submit"
            className="bg-utn-blue text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-utn-blue-dark transition-colors"
          >
            Agregar jugador
          </button>
        </form>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-semibold text-lg">
          Jugadores ({players.length})
        </h2>
        {players.length === 0 ? (
          <p className="text-muted text-sm">
            Todavía no hay jugadores cargados.
          </p>
        ) : (
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {players.map((player) => (
              <li
                key={player.id}
                className="bg-card border border-border rounded-lg p-3 flex items-center gap-3"
              >
                <PlayerAvatar
                  name={player.name}
                  photoUrl={player.photoUrl}
                  size={44}
                />
                <div className="min-w-0">
                  <p className="font-medium truncate">{player.name}</p>
                  <p className="text-xs text-muted">
                    {player.wins} {player.wins === 1 ? "victoria" : "victorias"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
