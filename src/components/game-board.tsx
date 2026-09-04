"use client";

import { useTransition } from "react";
import { PlayerAvatar } from "@/components/player-avatar";
import { closeRound, finishGame, setRoundScore } from "@/lib/actions/games";

const QUICK_POINTS = [0, 1, 2, 3, 4, 5];

type Participant = {
  id: string;
  playerId: string;
  totalPoints: number;
  isWinner: boolean;
  player: { name: string; photoUrl: string | null };
  currentRoundPoints: number | null;
};

type Props = {
  gameId: string;
  status: "IN_PROGRESS" | "FINISHED";
  roundNumber: number;
  openRoundId: string | null;
  participants: Participant[];
};

export function GameBoard({
  gameId,
  status,
  roundNumber,
  openRoundId,
  participants,
}: Props) {
  const [isPending, startTransition] = useTransition();

  function handlePick(participantId: string, points: number) {
    if (!openRoundId) return;
    startTransition(async () => {
      await setRoundScore(gameId, openRoundId, participantId, points);
    });
  }

  function handleCloseRound() {
    if (!openRoundId) return;
    startTransition(async () => {
      await closeRound(gameId, openRoundId);
    });
  }

  function handleFinish() {
    if (!confirm("¿Finalizar la partida? Se va a definir un ganador con los puntos actuales.")) {
      return;
    }
    startTransition(async () => {
      await finishGame(gameId);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold">
          {status === "IN_PROGRESS" ? `Ronda ${roundNumber}` : "Partida finalizada"}
        </h1>
        {status === "IN_PROGRESS" && (
          <div className="flex gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={handleCloseRound}
              className="bg-utn-blue text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-utn-blue-dark transition-colors disabled:opacity-60"
            >
              Terminar ronda
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={handleFinish}
              className="border border-utn-blue text-utn-blue rounded-md px-4 py-2 text-sm font-medium hover:bg-utn-blue/10 transition-colors disabled:opacity-60"
            >
              Finalizar partida
            </button>
          </div>
        )}
      </div>

      <ul className="flex flex-col gap-3">
        {participants.map((participant, index) => (
          <li
            key={participant.id}
            className="bg-card border border-border rounded-xl p-3 sm:p-4 flex flex-col gap-3"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-muted w-5 text-center">
                {index + 1}
              </span>
              <PlayerAvatar
                name={participant.player.name}
                photoUrl={participant.player.photoUrl}
                size={40}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate flex items-center gap-1">
                  {participant.player.name}
                  {status === "FINISHED" && participant.isWinner && (
                    <span aria-label="Ganador">🏆</span>
                  )}
                </p>
              </div>
              <p className="text-2xl font-bold text-utn-blue tabular-nums">
                {participant.totalPoints}
              </p>
            </div>

            {status === "IN_PROGRESS" && (
              <div className="flex gap-1.5 pl-8 flex-wrap">
                {QUICK_POINTS.map((points) => {
                  const active = participant.currentRoundPoints === points;
                  return (
                    <button
                      key={points}
                      type="button"
                      disabled={isPending}
                      onClick={() => handlePick(participant.id, points)}
                      className={`h-9 min-w-9 px-2 rounded-md text-sm font-semibold border transition-colors disabled:opacity-60 ${
                        active
                          ? "bg-accent border-accent text-utn-blue-dark"
                          : "border-border bg-background hover:border-utn-blue/50"
                      }`}
                    >
                      +{points}
                    </button>
                  );
                })}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
