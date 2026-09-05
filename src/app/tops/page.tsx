import { prisma } from "@/lib/prisma";
import { PlayerAvatar } from "@/components/player-avatar";

export const dynamic = "force-dynamic";

const MEDALS = ["🥇", "🥈", "🥉"];

export default async function TopsPage() {
  const players = await prisma.player.findMany({
    orderBy: [{ wins: "desc" }, { name: "asc" }],
  });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">Tops</h1>
      <p className="text-muted text-sm">
        Ranking histórico por partidas ganadas.
      </p>

      {players.length === 0 ? (
        <p className="text-muted text-sm">Todavía no hay jugadores.</p>
      ) : (
        <ol className="flex flex-col gap-2">
          {players.map((player, index) => (
            <li
              key={player.id}
              className="bg-card border border-border shadow-lg shadow-black/30 rounded-lg p-3 flex items-center gap-3"
            >
              <span className="w-7 text-center font-semibold text-muted">
                {MEDALS[index] ?? index + 1}
              </span>
              <PlayerAvatar
                name={player.name}
                photoUrl={player.photoUrl}
                size={40}
              />
              <p className="flex-1 min-w-0 font-medium truncate">
                {player.name}
              </p>
              <p className="text-lg font-bold text-primary tabular-nums">
                {player.wins}
              </p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
