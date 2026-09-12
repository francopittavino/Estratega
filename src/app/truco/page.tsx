import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PlayerAvatar } from "@/components/player-avatar";
import { DeleteGameButton } from "@/components/delete-game-button";
import { TEAM_SIZE_SHORT } from "@/lib/truco";

export const dynamic = "force-dynamic";

type TrucoGameWithMembers = Prisma.TrucoGameGetPayload<{
  include: { members: { include: { player: true } } };
}>;

export default async function TrucoPage() {
  const games = await prisma.trucoGame.findMany({
    orderBy: { createdAt: "desc" },
    include: { members: { include: { player: true } } },
  });

  const enCurso = games.filter((g) => g.status === "IN_PROGRESS");
  const finalizadas = games.filter((g) => g.status === "FINISHED");

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-xl font-bold">Truco</h1>
        <div className="flex gap-2">
          <Link
            href="/truco/tops"
            className="border border-border text-muted rounded-md px-4 py-2 text-sm font-medium hover:border-primary/50 hover:text-foreground transition-colors"
          >
            Tops
          </Link>
          <Link
            href="/truco/nueva"
            className="bg-primary text-white rounded-md shadow-md shadow-primary/20 px-4 py-2 text-sm font-medium hover:bg-primary-dark transition-colors"
          >
            + Nueva partida
          </Link>
        </div>
      </div>

      <TrucoSection
        title="En curso"
        games={enCurso}
        emptyText="No hay partidas de truco en curso."
      />
      <TrucoSection
        title="Finalizadas"
        games={finalizadas}
        emptyText="Todavía no se terminó ninguna partida de truco."
      />
    </div>
  );
}

function TeamLine({
  members,
  points,
  isWinner,
}: {
  members: TrucoGameWithMembers["members"];
  points: number;
  isWinner: boolean;
}) {
  return (
    <span className="flex items-center gap-1.5 min-w-0">
      <span className="flex -space-x-1.5 shrink-0">
        {members.map((m) => (
          <PlayerAvatar
            key={m.id}
            name={m.player.name}
            photoUrl={m.player.photoUrl}
            size={24}
          />
        ))}
      </span>
      <span className="text-sm truncate">
        {members.map((m) => m.player.name).join(" y ")}
      </span>
      <span
        className={`text-sm font-bold tabular-nums shrink-0 ${
          isWinner ? "text-accent" : "text-primary"
        }`}
      >
        {points}
        {isWinner && " 🏆"}
      </span>
    </span>
  );
}

function TrucoSection({
  title,
  games,
  emptyText,
}: {
  title: string;
  games: TrucoGameWithMembers[];
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
              className="bg-card border border-border shadow-lg shadow-black/30 rounded-lg p-3 flex items-center gap-3 hover:border-primary transition-colors"
            >
              <Link
                href={`/truco/${game.id}`}
                className="flex-1 min-w-0 flex flex-col gap-1"
              >
                <TeamLine
                  members={game.members.filter((m) => m.team === "A")}
                  points={game.pointsA}
                  isWinner={game.winnerTeam === "A"}
                />
                <TeamLine
                  members={game.members.filter((m) => m.team === "B")}
                  points={game.pointsB}
                  isWinner={game.winnerTeam === "B"}
                />
                <span className="text-xs text-muted">
                  {TEAM_SIZE_SHORT[game.teamSize]} ·{" "}
                  {new Date(game.createdAt).toLocaleString("es-AR")}
                </span>
              </Link>
              <DeleteGameButton gameId={game.id} kind="truco" />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
