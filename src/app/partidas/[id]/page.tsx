import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { GameBoard } from "@/components/game-board";
import { ClaimControl } from "@/components/claim-control";
import { LiveRefresh } from "@/components/live-refresh";
import { ScoreChart, type ChartSeries } from "@/components/score-chart";
import { isOwner, readDeviceKey } from "@/lib/owner";

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
      rounds: { orderBy: { number: "asc" } },
    },
  });

  if (!game) notFound();

  const canScore = isOwner(game.ownerKey, await readDeviceKey());

  const openRound = game.rounds.find((r) => !r.closedAt) ?? null;
  const roundNumber = game.rounds.at(-1)?.number ?? 1;

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

  // Una línea por jugador con el acumulado ronda a ronda. La ronda abierta
  // entra con lo que ya se cargó, así el punto con la foto se mueve en vivo y
  // queda fijo al cerrarla. Van ordenados por id (el orden en que se los
  // eligió) y no por puntaje, para que cada uno conserve su color aunque
  // cambie quién va ganando.
  const chartSeries: ChartSeries[] = [...game.participants]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((p) => {
      let total = 0;
      const points = [{ x: 0, y: 0 }];
      for (const round of game.rounds) {
        total += p.roundScores.find((s) => s.roundId === round.id)?.points ?? 0;
        points.push({ x: round.number, y: total });
      }
      return {
        id: p.id,
        label: p.player.name,
        members: [{ id: p.playerId, name: p.player.name, photoUrl: p.player.photoUrl }],
        points,
      };
    });

  return (
    <div className="flex flex-col gap-4">
      {/* Los que solo miran no tienen forma de enterarse de un cambio hecho
          en otro celular: se les refresca el marcador solo. */}
      <LiveRefresh enabled={!canScore && game.status === "IN_PROGRESS"} />
      {!canScore && game.status === "IN_PROGRESS" && (
        <ClaimControl gameId={game.id} kind="estratega" />
      )}
      <GameBoard
        gameId={game.id}
        status={game.status}
        roundNumber={roundNumber}
        openRoundId={openRound?.id ?? null}
        participants={participants}
        canScore={canScore}
      />
      <section className="bg-card border border-border shadow-lg shadow-black/30 rounded-xl p-3 sm:p-4 flex flex-col gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">
          {game.status === "IN_PROGRESS" ? "Cómo viene la partida" : "Cómo fue la partida"}
        </h2>
        <ScoreChart series={chartSeries} xKind="round" xMax={roundNumber} />
      </section>
    </div>
  );
}
