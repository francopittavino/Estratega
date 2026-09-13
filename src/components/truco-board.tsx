"use client";

import { useOptimistic, useState, useTransition } from "react";
import { PlayerAvatar } from "@/components/player-avatar";
import { CigaretteDefs, TallyBlock } from "@/components/cigarette-tally";
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
    <div className="flex-1 min-h-0 flex flex-col gap-2">
      {/* Los degradés de los cigarrillos, una sola vez para toda la página. */}
      <CigaretteDefs />

      <div className="shrink-0 flex items-center justify-between gap-2">
        <div className="flex items-baseline gap-2 min-w-0">
          <h1 className="text-lg font-bold leading-none truncate">
            {inProgress ? "Truco" : "Partida finalizada"}
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-muted whitespace-nowrap">
            {TEAM_SIZE_SHORT[teamSize]} · a {TRUCO_TARGET}
          </p>
        </div>
        {/* Arriba y chiquito: abajo no entra sin robarle alto al anotador. */}
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
            className="shrink-0 border border-primary text-primary rounded-md px-3 py-1.5 text-xs font-medium hover:bg-primary/10 transition-colors disabled:opacity-60"
          >
            Finalizar
          </button>
        )}
      </div>

      {error && <p className="shrink-0 text-sm text-red-400">{error}</p>}

      {/* El anotador se come todo el alto que queda y los cuadraditos se
          achican solos, así los 30 puntos entran en la pantalla del celular
          sin scrollear. Los + y − van en dos barras a los costados, cada una
          pegada a la columna de su equipo y a mano del pulgar. */}
      <div className="flex-1 min-h-0 flex items-stretch gap-1.5">
        {editable && (
          <TeamControls
            team={teamA}
            onPoint={(delta) => handlePoint("A", delta)}
          />
        )}

        <div className="flex-1 min-w-0 flex bg-card border border-border shadow-lg shadow-black/30 rounded-xl">
          <TeamColumn
            members={teamA}
            points={points.A}
            isWinner={winnerTeam === "A"}
            showTrophy={!inProgress}
          />
          <div className="flex-1 min-w-0 border-l-2 border-border flex">
            <TeamColumn
              members={teamB}
              points={points.B}
              isWinner={winnerTeam === "B"}
              showTrophy={!inProgress}
            />
          </div>
        </div>

        {editable && (
          <TeamControls
            team={teamB}
            onPoint={(delta) => handlePoint("B", delta)}
          />
        )}
      </div>

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

// La columna de un equipo: arriba quién es y cuánto va, abajo los seis
// cuadraditos (tres de malas y tres de buenas) uno abajo del otro, partidos
// por la raya del anotador criollo.
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
    <div className="flex-1 min-w-0 flex flex-col gap-1 px-1 py-1.5">
      <div className="shrink-0 flex flex-col items-center gap-0.5">
        {/* Las fotos y el puntaje van en la misma línea: apilados se comen
            el alto que necesitan los cuadraditos. */}
        <div className="flex items-center justify-center gap-1.5">
          <div className="flex -space-x-1.5">
            {members.map((m) => (
              <PlayerAvatar
                key={m.id}
                name={m.name}
                photoUrl={m.photoUrl}
                size={28}
              />
            ))}
          </div>
          <p className="text-2xl font-bold text-primary tabular-nums leading-none">
            {/* key = puntaje: al cambiar, React remonta el span y se vuelve a
                disparar el destello, sin necesidad de estado ni efectos. */}
            <span key={points} className="score-pop">
              {points}
            </span>
            {showTrophy && isWinner && <span className="text-lg"> 🏆</span>}
          </p>
        </div>
        <p className="w-full text-[10px] text-center leading-tight text-muted truncate">
          {members.map((m) => m.name).join(" · ")}
        </p>
      </div>

      {/* Sin rótulos de "malas" y "buenas": el alto que se llevaban ahora es
          cuadradito, que es lo que importa mirar. La raya del medio alcanza
          para saber dónde empieza cada mitad, como en el anotador de verdad.
          Quedan para el lector de pantalla, que no ocupa lugar. */}
      <span className="sr-only">Malas</span>
      <TallyBlock value={malas} />

      <div className="shrink-0 h-0.5 w-full bg-border rounded-full" />

      <span className="sr-only">Buenas</span>
      <TallyBlock value={buenas} />
    </div>
  );
}

// Las dos barras de los costados. El + y el − no se bloquean mientras hay una
// llamada en curso: el incremento del server es atómico, así que se pueden
// encadenar toques sin perder ninguno. Ocupan todo el alto de la columna para
// que no haya forma de errarle con el pulgar.
function TeamControls({
  team,
  onPoint,
}: {
  team: Member[];
  onPoint: (delta: 1 | -1) => void;
}) {
  return (
    <div className="shrink-0 w-12 sm:w-16 flex flex-col gap-1.5">
      <button
        type="button"
        aria-label={`Sumar un punto a ${teamLabel(team)}`}
        onClick={() => onPoint(1)}
        className="flex-[2] rounded-xl bg-primary text-white text-3xl font-bold shadow-md shadow-primary/20 hover:bg-primary-dark active:scale-95 transition-transform"
      >
        +
      </button>
      <button
        type="button"
        aria-label={`Restar un punto a ${teamLabel(team)}`}
        onClick={() => onPoint(-1)}
        className="flex-1 rounded-xl border border-border bg-background text-2xl font-bold text-muted hover:border-primary/50 hover:text-foreground active:scale-95 transition-transform"
      >
        −
      </button>
    </div>
  );
}
