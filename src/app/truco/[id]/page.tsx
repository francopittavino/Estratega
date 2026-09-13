import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TrucoBoard } from "@/components/truco-board";
import { ClaimControl } from "@/components/claim-control";
import { LiveRefresh } from "@/components/live-refresh";
import { isOwner, readDeviceKey } from "@/lib/owner";

export const dynamic = "force-dynamic";

export default async function PartidaTrucoPage({
  params,
}: PageProps<"/truco/[id]">) {
  const { id } = await params;

  const game = await prisma.trucoGame.findUnique({
    where: { id },
    include: { members: { include: { player: true } } },
  });

  if (!game) notFound();

  const canScore = isOwner(game.ownerKey, await readDeviceKey());

  const toMember = (m: (typeof game.members)[number]) => ({
    id: m.id,
    name: m.player.name,
    photoUrl: m.player.photoUrl,
  });

  return (
    // Alto fijo de pantalla (menos el padding del <main>: pt-16 + pb-6) para
    // que el anotador se reparta lo que hay y los 30 puntos entren sin
    // scrollear. Adentro todo va con flex-1 + min-h-0.
    <div className="flex flex-col gap-2 h-[calc(100dvh-5.5rem)]">
      {/* Los que solo miran no tienen forma de enterarse de un cambio hecho
          en otro celular: se les refresca el marcador solo. */}
      <LiveRefresh enabled={!canScore && game.status === "IN_PROGRESS"} />
      {!canScore && game.status === "IN_PROGRESS" && (
        <ClaimControl gameId={game.id} kind="truco" />
      )}
      <TrucoBoard
        gameId={game.id}
        status={game.status}
        teamSize={game.teamSize}
        pointsA={game.pointsA}
        pointsB={game.pointsB}
        winnerTeam={game.winnerTeam}
        teamA={game.members.filter((m) => m.team === "A").map(toMember)}
        teamB={game.members.filter((m) => m.team === "B").map(toMember)}
        canScore={canScore}
      />
    </div>
  );
}
