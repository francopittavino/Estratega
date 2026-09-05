"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { assertAdminPassword } from "@/lib/admin-password";

export async function createGame(playerIds: string[]) {
  const uniqueIds = Array.from(new Set(playerIds)).filter(Boolean);
  if (uniqueIds.length < 2) {
    throw new Error("Elegí al menos 2 jugadores para arrancar una partida");
  }

  const game = await prisma.game.create({
    data: {
      participants: {
        create: uniqueIds.map((playerId) => ({ playerId })),
      },
      rounds: {
        create: [{ number: 1 }],
      },
    },
  });

  revalidatePath("/partidas");
  redirect(`/partidas/${game.id}`);
}

// Un solo click por jugador por ronda, pero se puede volver a tocar
// otro botón para corregir mientras la ronda siga abierta.
export async function setRoundScore(
  gameId: string,
  roundId: string,
  participantId: string,
  points: number
) {
  if (!Number.isInteger(points) || points < 0 || points > 5) {
    throw new Error("El puntaje rápido va de +0 a +5");
  }

  const round = await prisma.round.findUnique({ where: { id: roundId } });
  if (!round || round.gameId !== gameId) {
    throw new Error("Ronda inválida");
  }
  if (round.closedAt) {
    throw new Error("Esa ronda ya se cerró");
  }

  await prisma.roundScore.upsert({
    where: { roundId_participantId: { roundId, participantId } },
    update: { points },
    create: { roundId, participantId, points },
  });

  revalidatePath(`/partidas/${gameId}`);
}

export async function closeRound(gameId: string, roundId: string) {
  await prisma.$transaction(async (tx) => {
    const round = await tx.round.findUnique({
      where: { id: roundId },
      include: { scores: true },
    });
    if (!round || round.gameId !== gameId) throw new Error("Ronda inválida");
    if (round.closedAt) return;

    const game = await tx.game.findUnique({
      where: { id: gameId },
      include: { participants: true },
    });
    if (!game || game.status !== "IN_PROGRESS") {
      throw new Error("La partida no está en curso");
    }

    for (const participant of game.participants) {
      const score = round.scores.find((s) => s.participantId === participant.id);
      const points = score?.points ?? 0;
      await tx.gameParticipant.update({
        where: { id: participant.id },
        data: { totalPoints: { increment: points } },
      });
    }

    await tx.round.update({
      where: { id: roundId },
      data: { closedAt: new Date() },
    });

    await tx.round.create({
      data: { gameId, number: round.number + 1 },
    });
  });

  revalidatePath(`/partidas/${gameId}`);
}

export async function finishGame(gameId: string) {
  await prisma.$transaction(async (tx) => {
    const game = await tx.game.findUnique({
      where: { id: gameId },
      include: {
        participants: true,
        rounds: { where: { closedAt: null }, include: { scores: true } },
      },
    });
    if (!game || game.status !== "IN_PROGRESS") return;

    const openRound = game.rounds[0];
    if (openRound && openRound.scores.length > 0) {
      for (const participant of game.participants) {
        const score = openRound.scores.find((s) => s.participantId === participant.id);
        const points = score?.points ?? 0;
        await tx.gameParticipant.update({
          where: { id: participant.id },
          data: { totalPoints: { increment: points } },
        });
      }
      await tx.round.update({
        where: { id: openRound.id },
        data: { closedAt: new Date() },
      });
    } else if (openRound) {
      // Ronda abierta sin ningún puntaje cargado: se descarta.
      await tx.round.delete({ where: { id: openRound.id } });
    }

    const participants = await tx.gameParticipant.findMany({
      where: { gameId },
    });
    const maxPoints = Math.max(...participants.map((p) => p.totalPoints));
    const winnerIds = participants
      .filter((p) => p.totalPoints === maxPoints)
      .map((p) => p.id);

    await tx.gameParticipant.updateMany({
      where: { id: { in: winnerIds } },
      data: { isWinner: true },
    });

    const winnerPlayerIds = participants
      .filter((p) => winnerIds.includes(p.id))
      .map((p) => p.playerId);

    await tx.player.updateMany({
      where: { id: { in: winnerPlayerIds } },
      data: { wins: { increment: 1 } },
    });

    await tx.game.update({
      where: { id: gameId },
      data: { status: "FINISHED", finishedAt: new Date() },
    });
  });

  revalidatePath(`/partidas/${gameId}`);
  revalidatePath("/partidas");
  revalidatePath("/tops");
  revalidatePath("/");
}

// Vuelve la ronda abierta actual a la ronda cerrada anterior, por si hubo
// un error de posición: descarta la ronda abierta y resta los puntos de la
// última ronda cerrada para poder recargarlos.
export async function goBackOneRound(gameId: string) {
  await prisma.$transaction(async (tx) => {
    const game = await tx.game.findUnique({ where: { id: gameId } });
    if (!game || game.status !== "IN_PROGRESS") {
      throw new Error("La partida no está en curso");
    }

    const rounds = await tx.round.findMany({
      where: { gameId },
      orderBy: { number: "desc" },
      take: 2,
    });
    const [current, previous] = rounds;
    if (!current || current.closedAt || !previous || !previous.closedAt) {
      throw new Error("No hay una ronda anterior a la que volver");
    }

    const previousScores = await tx.roundScore.findMany({
      where: { roundId: previous.id },
    });
    for (const score of previousScores) {
      await tx.gameParticipant.update({
        where: { id: score.participantId },
        data: { totalPoints: { decrement: score.points } },
      });
    }

    await tx.round.delete({ where: { id: current.id } });
    await tx.round.update({
      where: { id: previous.id },
      data: { closedAt: null },
    });
  });

  revalidatePath(`/partidas/${gameId}`);
}

export async function deleteGame(gameId: string, password: string) {
  assertAdminPassword(password);

  await prisma.$transaction(async (tx) => {
    const game = await tx.game.findUnique({
      where: { id: gameId },
      include: { participants: true },
    });
    if (!game) return;

    if (game.status === "FINISHED") {
      const winnerPlayerIds = game.participants
        .filter((p) => p.isWinner)
        .map((p) => p.playerId);
      if (winnerPlayerIds.length > 0) {
        await tx.player.updateMany({
          where: { id: { in: winnerPlayerIds } },
          data: { wins: { decrement: 1 } },
        });
      }
    }

    await tx.game.delete({ where: { id: gameId } });
  });

  revalidatePath("/partidas");
  revalidatePath("/tops");
  revalidatePath("/");
}
