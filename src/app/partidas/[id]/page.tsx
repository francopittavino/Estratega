import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { GameBoard } from "@/components/game-board";

export const dynamic = "force-dynamic";

export default async function PartidaPage({
  params,
}: PageProps<"/partidas/[id]">) {
  const { id } = await params;

  const game = await prisma.game.findUnique({
    where: { id },
    include: {
      participants: {
        include: { player: true, roundScores: true },
      },
      rounds: {
        orderBy: { number: "desc" },
        take: 1,
      },
    },
  });

  if (!game) notFound();

  const openRound = game.rounds.find((r) => !r.closedAt) ?? null;
  const roundNumber = game.rounds[0]?.number ?? 1;

  const participants = [...game.participants]
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .map((p) => ({
      id: p.id,
      playerId: p.playerId,
      totalPoints: p.totalPoints,
      isWinner: p.isWinner,
      player: { name: p.player.name, photoUrl: p.player.photoUrl },
      currentRoundPoints: openRound
        ? p.roundScores.find((s) => s.roundId === openRound.id)?.points ?? null
        : null,
    }));

  return (
    <GameBoard
      gameId={game.id}
      status={game.status}
      roundNumber={roundNumber}
      openRoundId={openRound?.id ?? null}
      participants={participants}
    />
  );
}
