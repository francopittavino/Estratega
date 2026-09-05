import { prisma } from "@/lib/prisma";
import { createPlayer } from "@/lib/actions/players";
import { PlayerCard } from "@/components/player-card";

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
            className="bg-primary text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-primary-dark transition-colors"
          >
            Agregar jugador
          </button>
        </form>
      </section>

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="font-semibold text-lg">
            Jugadores ({players.length})
          </h2>
          {players.length > 0 && (
            <p className="text-xs text-muted">
              Tocá la foto para cambiarla, el nombre para editarlo.
            </p>
          )}
        </div>
        {players.length === 0 ? (
          <p className="text-muted text-sm">
            Todavía no hay jugadores cargados.
          </p>
        ) : (
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {players.map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
