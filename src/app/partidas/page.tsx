import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PlayerAvatar } from "@/components/player-avatar";
import { DeleteGameButton } from "@/components/delete-game-button";

export const dynamic = "force-dynamic";

type GameWithParticipants = Prisma.GameGetPayload<{
  include: {
    participants: {
      include: { player: true };
    };
  };
}>;

export default async function PartidasPage() {
  const games = await prisma.game.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      participants: {
        include: { player: true },
        orderBy: { totalPoints: "desc" },
      },
    },
  });

  const enCurso = games.filter((g) => g.status === "IN_PROGRESS");
  const finalizadas = games.filter((g) => g.status === "FINISHED");

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold">Partidas</h1>
        <Link
          href="/partidas/nueva"
          className="bg-primary text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-primary-dark transition-colors"
        >
          + Nueva partida
        </Link>
      </div>

      <GameSection title="En curso" games={enCurso} emptyText="No hay partidas en curso." />
      <GameSection
        title="Finalizadas"
        games={finalizadas}
        emptyText="Todavía no se terminó ninguna partida."
      />
    </div>
  );
}

function GameSection({
  title,
  games,
  emptyText,
}: {
  title: string;
  games: GameWithParticipants[];
  emptyText: string;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-semibold text-lg">{title}</h2>
      {games.length === 0 ? (
        <p className="text-muted text-sm">{emptyText}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {games.map((game) => (
            <li
              key={game.id}
              className="bg-card border border-border rounded-lg p-4 flex items-center gap-4 hover:border-primary transition-colors"
            >
              <Link
                href={`/partidas/${game.id}`}
                className="flex-1 min-w-0 flex items-center gap-4"
              >
                <div className="flex -space-x-2">
                  {game.participants.map((p) => (
                    <PlayerAvatar
                      key={p.id}
                      name={p.player.name}
                      photoUrl={p.player.photoUrl}
                      size={32}
                    />
                  ))}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {game.participants.map((p) => p.player.name).join(", ")}
                  </p>
                  <p className="text-xs text-muted">
                    {new Date(game.createdAt).toLocaleString("es-AR")}
                  </p>
                </div>
                {game.status === "FINISHED" && (
                  <span className="text-xs font-medium bg-accent/20 text-accent rounded-full px-2 py-1 shrink-0">
                    🏆{" "}
                    {game.participants
                      .filter((p) => p.isWinner)
                      .map((p) => p.player.name)
                      .join(", ")}
                  </span>
                )}
              </Link>
              <DeleteGameButton gameId={game.id} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
