"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { TrucoTeam } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { assertAdminPassword } from "@/lib/admin-password";
import { assertOwner, ensureDeviceKey } from "@/lib/owner";
import { isTeamSize, TRUCO_TARGET } from "@/lib/truco";

async function assertCanScore(gameId: string) {
  const game = await prisma.trucoGame.findUnique({
    where: { id: gameId },
    select: { ownerKey: true },
  });
  if (!game) throw new Error("Partida inexistente");
  await assertOwner(game.ownerKey);
}

export async function createTrucoGame(
  teamSize: number,
  teamA: string[],
  teamB: string[]
) {
  if (!isTeamSize(teamSize)) {
    throw new Error("Modalidad inválida");
  }
  if (teamA.length !== teamSize || teamB.length !== teamSize) {
    throw new Error(`Cada equipo tiene que tener ${teamSize} jugador(es)`);
  }

  const all = [...teamA, ...teamB].filter(Boolean);
  if (new Set(all).size !== all.length) {
    throw new Error("Un jugador no puede estar en los dos equipos");
  }

  const found = await prisma.player.count({ where: { id: { in: all } } });
  if (found !== all.length) {
    throw new Error("Alguno de los jugadores elegidos ya no existe");
  }

  const ownerKey = await ensureDeviceKey();

  const game = await prisma.trucoGame.create({
    data: {
      teamSize,
      ownerKey,
      members: {
        create: [
          ...teamA.map((playerId) => ({ playerId, team: "A" as const })),
          ...teamB.map((playerId) => ({ playerId, team: "B" as const })),
        ],
      },
    },
  });

  revalidatePath("/truco");
  redirect(`/truco/${game.id}`);
}

export type AddPointResult = {
  pointsA: number;
  pointsB: number;
  // true solo cuando este toque fue el que llevó al equipo a 30, para
  // preguntar una sola vez si se finaliza la partida.
  reachedTarget: boolean;
};

// Suma o resta de a un punto. No deja pasar de 30 ni bajar de 0.
export async function addTrucoPoint(
  gameId: string,
  team: TrucoTeam,
  delta: number
): Promise<AddPointResult> {
  if (delta !== 1 && delta !== -1) {
    throw new Error("Solo se puede sumar o restar de a un punto");
  }
  if (team !== "A" && team !== "B") {
    throw new Error("Equipo inválido");
  }
  await assertCanScore(gameId);

  // El incremento es atómico y el where hace de tope: si el equipo ya está
  // en 30 no suma, y si está en 0 no resta. Así se puede tocar el + varias
  // veces seguidas sin esperar la respuesta del server y no se pierde
  // ningún toque ni se pisan entre sí.
  const limit = delta === 1 ? { lt: TRUCO_TARGET } : { gt: 0 };
  const changed = await prisma.trucoGame.updateMany({
    where:
      team === "A"
        ? { id: gameId, status: "IN_PROGRESS", pointsA: limit }
        : { id: gameId, status: "IN_PROGRESS", pointsB: limit },
    data:
      team === "A"
        ? { pointsA: { increment: delta } }
        : { pointsB: { increment: delta } },
  });

  const game = await prisma.trucoGame.findUnique({
    where: { id: gameId },
    select: { pointsA: true, pointsB: true },
  });
  if (!game) throw new Error("Partida inexistente");

  const current = team === "A" ? game.pointsA : game.pointsB;

  revalidatePath(`/truco/${gameId}`);

  return {
    pointsA: game.pointsA,
    pointsB: game.pointsB,
    reachedTarget:
      changed.count > 0 && delta === 1 && current === TRUCO_TARGET,
  };
}

export async function finishTrucoGame(gameId: string) {
  await assertCanScore(gameId);

  await prisma.$transaction(async (tx) => {
    const game = await tx.trucoGame.findUnique({ where: { id: gameId } });
    if (!game) throw new Error("Partida inexistente");

    // Igual que en El Estratega: la fila se reclama con un update
    // condicional para que dos toques casi simultáneos no la cierren dos
    // veces y dupliquen la victoria en el ranking.
    const winnerTeam: TrucoTeam | null =
      game.pointsA === game.pointsB ? null : game.pointsA > game.pointsB ? "A" : "B";

    await tx.trucoGame.updateMany({
      where: { id: gameId, status: "IN_PROGRESS" },
      data: { status: "FINISHED", finishedAt: new Date(), winnerTeam },
    });
  });

  revalidatePath(`/truco/${gameId}`);
  revalidatePath("/truco");
  revalidatePath("/truco/tops");
}

// Reasigna el dueño de la partida al dispositivo actual (ver owner.ts).
export async function claimTrucoGame(gameId: string, password: string) {
  assertAdminPassword(password);

  const ownerKey = await ensureDeviceKey();
  const claimed = await prisma.trucoGame.updateMany({
    where: { id: gameId },
    data: { ownerKey },
  });
  if (claimed.count === 0) throw new Error("Partida inexistente");

  revalidatePath(`/truco/${gameId}`);
}

export async function deleteTrucoGame(gameId: string, password: string) {
  assertAdminPassword(password);

  // El ranking de truco se calcula a partir de las partidas finalizadas, no
  // hay contadores que descontar: borrar la partida la saca del ranking sola.
  await prisma.trucoGame.deleteMany({ where: { id: gameId } });

  revalidatePath("/truco");
  revalidatePath("/truco/tops");
}
