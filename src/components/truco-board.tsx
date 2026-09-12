"use client";

import { useOptimistic, useState, useTransition } from "react";
import { PlayerAvatar } from "@/components/player-avatar";
import { TallyBlock } from "@/components/cigarette-tally";
import { addTrucoPoint, finishTrucoGame } from "@/lib/actions/truco";
import { splitScore, TEAM_SIZE_SHORT, TRUCO_TARGET } from "@/lib/truco";

type Member = { id: string; name: string; photoUrl: string | null };
type Team = "A" | "B";

type Props = {
  gameId: string;
  status: "IN_PROGRESS" | "FINISHED";
  teamSize: number;
  pointsA: number;
  pointsB: number;
  winnerTeam: Team | null;
  teamA: Member[];
  teamB: Member[];
  canScore: boolean;
};

function teamLabel(members: Member[]) {
  return members.map((m) => m.name).join(" y ");
}

export function TrucoBoard({
  gameId,
  status,
  teamSize,
  pointsA,
  pointsB,
  winnerTeam,
  teamA,
  teamB,
  canScore,
}: Props) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  // Cartel de confirmación propio en vez de confirm(): el nativo del
  // navegador queda feo en el celular y bloquea toda la pestaña.
  const [asking, setAsking] = useState<null | {
    team: Team;
    reachedTarget: boolean;
  }>(null);

  // El + y el - se ven al toque; cuando el server responde, React vuelve a
  // tomar los valores reales que llegan por props.
  const [points, bumpPoints] = useOptimistic(
    { A: pointsA, B: pointsB },
    (state, change: { team: Team; delta: number }) => ({
      ...state,
      [change.team]: Math.min(
        Math.max(state[change.team] + change.delta, 0),
        TRUCO_TARGET
      ),
    })
  );

  const inProgress = status === "IN_PROGRESS";
  const editable = inProgress && canScore;

  function handlePoint(team: Team, delta: 1 | -1) {
    setError(null);
    startTransition(async () => {
      bumpPoints({ team, delta });
      try {
        const result = await addTrucoPoint(gameId, team, delta);
        if (result.reachedTarget) {
          setAsking({ team, reachedTarget: true });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo anotar");
      }
    });
  }

  function confirmFinish() {
    setError(null);
    setAsking(null);
    startTransition(async () => {
      try {
        await finishTrucoGame(gameId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo finalizar");
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <h1 className="text-xl font-bold">
          {inProgress ? "Truco" : "Partida finalizada"}
        </h1>
        <p className="text-xs uppercase tracking-widest text-muted">
          {TEAM_SIZE_SHORT[teamSize]} · a {TRUCO_TARGET}
        </p>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {/* Sin overflow-hidden: la barra de botones de abajo es sticky y un
          ancestro con overflow recortado la dejaría de pegar al viewport. */}
      <div className="bg-card border border-border shadow-lg shadow-black/30 rounded-xl">
        <div className="grid grid-cols-2">
          <TeamColumn
            members={teamA}
            points={points.A}
            isWinner={winnerTeam === "A"}
            showTrophy={!inProgress}
          />
          <div className="border-l-2 border-border">
            <TeamColumn
              members={teamB}
              points={points.B}
              isWinner={winnerTeam === "B"}
              showTrophy={!inProgress}
            />
          </div>
        </div>

        {/* Los botones quedan pegados abajo de la pantalla: el anotador es
            más alto que un celular y no se puede depender de que scrollees
            para sumar un punto. */}
        {editable && (
          <div className="sticky bottom-0 grid grid-cols-2 bg-card/95 backdrop-blur border-t border-border rounded-b-xl">
            <TeamControls onPoint={(delta) => handlePoint("A", delta)} />
            <div className="border-l-2 border-border">
              <TeamControls onPoint={(delta) => handlePoint("B", delta)} />
            </div>
          </div>
        )}
      </div>

      {editable && (
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            setAsking({
              team: points.A >= points.B ? "A" : "B",
              reachedTarget: false,
            })
          }
          className="self-center border border-primary text-primary rounded-md px-5 py-2 text-sm font-medium hover:bg-primary/10 transition-colors disabled:opacity-60"
        >
          Finalizar partida
        </button>
      )}

      {asking && (
        <FinishDialog
          members={asking.team === "A" ? teamA : teamB}
          reachedTarget={asking.reachedTarget}
          tie={points.A === points.B}
          onConfirm={confirmFinish}
          onCancel={() => setAsking(null)}
        />
      )}
    </div>
  );
}

function FinishDialog({
  members,
  reachedTarget,
  tie,
  onConfirm,
  onCancel,
}: {
  members: Member[];
  reachedTarget: boolean;
  tie: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-card border border-border rounded-xl shadow-xl p-5 w-full max-w-sm flex flex-col gap-4">
        <p className="text-base font-semibold">
          {reachedTarget
            ? `¡${teamLabel(members)} ${members.length > 1 ? "llegaron" : "llegó"} a ${TRUCO_TARGET}!`
            : "¿Finalizar la partida?"}
        </p>
        <p className="text-sm text-muted">
          {tie
            ? "Van empatados: si finalizás ahora no se cuenta victoria para nadie."
            : `Si finalizás, la partida se cierra y ${teamLabel(members)} suma la victoria al ranking.`}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 bg-primary text-white rounded-md px-4 py-2.5 text-sm font-medium hover:bg-primary-dark transition-colors"
          >
            Finalizar partida
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 border border-border text-muted rounded-md px-4 py-2.5 text-sm font-medium hover:text-foreground transition-colors"
          >
            Seguir jugando
          </button>
        </div>
      </div>
    </div>
  );
}

function TeamColumn({
  members,
  points,
  isWinner,
  showTrophy,
}: {
  members: Member[];
  points: number;
  isWinner: boolean;
  showTrophy: boolean;
}) {
  const { malas, buenas } = splitScore(points);

  return (
    <div className="p-1.5 sm:p-3 flex flex-col gap-2.5">
      <div className="flex flex-col items-center gap-1">
        <div className="flex justify-center -space-x-1.5">
          {members.map((m) => (
            <PlayerAvatar
              key={m.id}
              name={m.name}
              photoUrl={m.photoUrl}
              size={40}
            />
          ))}
        </div>
        <p className="text-xs text-center leading-tight text-muted line-clamp-2">
          {members.map((m) => m.name).join(" · ")}
        </p>
        <p className="text-3xl sm:text-4xl font-bold text-primary tabular-nums leading-none">
          {points}
          {showTrophy && isWinner && <span className="text-2xl"> 🏆</span>}
        </p>
      </div>

      <TallyBlock value={malas} label="Malas" />
      <TallyBlock value={buenas} label="Buenas" />
    </div>
  );
}

// El + y el - no se bloquean mientras hay una llamada en curso: el
// incremento del server es atómico, así que se pueden encadenar toques sin
// perder ninguno.
function TeamControls({ onPoint }: { onPoint: (delta: 1 | -1) => void }) {
  return (
    <div className="flex gap-2 p-2">
      <button
        type="button"
        aria-label="Restar un punto"
        onClick={() => onPoint(-1)}
        className="flex-1 h-12 rounded-lg border border-border bg-background text-xl font-bold text-muted hover:border-primary/50 hover:text-foreground active:scale-95 transition-transform"
      >
        −
      </button>
      <button
        type="button"
        aria-label="Sumar un punto"
        onClick={() => onPoint(1)}
        className="flex-[2] h-12 rounded-lg bg-primary text-white text-2xl font-bold shadow-md shadow-primary/20 hover:bg-primary-dark active:scale-95 transition-transform"
      >
        +
      </button>
    </div>
  );
}
