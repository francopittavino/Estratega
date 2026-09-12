"use client";

import { useState, useTransition } from "react";
import { PlayerAvatar } from "@/components/player-avatar";
import { createTrucoGame } from "@/lib/actions/truco";
import { TEAM_SIZES, TEAM_SIZE_NAME, TEAM_SIZE_SHORT } from "@/lib/truco";
import { isRedirectError } from "@/lib/is-redirect-error";

type Player = { id: string; name: string; photoUrl: string | null };
type Team = "A" | "B";

export function NewTrucoGameForm({ players }: { players: Player[] }) {
  const [teamSize, setTeamSize] = useState<number>(2);
  const [teams, setTeams] = useState<Record<Team, string[]>>({ A: [], B: [] });
  const [active, setActive] = useState<Team>("A");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const byId = new Map(players.map((p) => [p.id, p]));
  const complete =
    teams.A.length === teamSize && teams.B.length === teamSize;

  function changeSize(size: number) {
    setTeamSize(size);
    setTeams({ A: [], B: [] });
    setActive("A");
    setError(null);
  }

  function toggle(playerId: string) {
    setError(null);
    setTeams((prev) => {
      for (const team of ["A", "B"] as const) {
        if (prev[team].includes(playerId)) {
          setActive(team);
          return { ...prev, [team]: prev[team].filter((id) => id !== playerId) };
        }
      }
      // Entra al equipo que estás cargando; si ya está lleno, al otro.
      const target =
        prev[active].length < teamSize
          ? active
          : prev[active === "A" ? "B" : "A"].length < teamSize
            ? ((active === "A" ? "B" : "A") as Team)
            : null;
      if (!target) return prev;

      const next = { ...prev, [target]: [...prev[target], playerId] };
      const other: Team = target === "A" ? "B" : "A";
      if (next[target].length >= teamSize && next[other].length < teamSize) {
        setActive(other);
      }
      return next;
    });
  }

  function handleSubmit() {
    setError(null);
    if (!complete) {
      setError(`Completá los dos equipos (${teamSize} jugador(es) cada uno).`);
      return;
    }
    startTransition(async () => {
      try {
        await createTrucoGame(teamSize, teams.A, teams.B);
      } catch (err) {
        if (isRedirectError(err)) throw err;
        setError(err instanceof Error ? err.message : "Ocurrió un error");
      }
    });
  }

  const chosen = new Set([...teams.A, ...teams.B]);

  return (
    <div className="flex flex-col gap-5">
      <section className="flex flex-col gap-2">
        <p className="text-muted text-sm">Modalidad:</p>
        <div className="flex gap-2 flex-wrap">
          {TEAM_SIZES.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => changeSize(size)}
              className={`rounded-lg border-2 px-4 py-2 text-sm font-medium shadow-md shadow-black/30 transition-colors ${
                teamSize === size
                  ? "border-primary bg-primary/25 text-foreground"
                  : "border-border bg-card text-muted hover:border-primary/50"
              }`}
            >
              {TEAM_SIZE_SHORT[size]}
              <span className="block text-[10px] uppercase tracking-wider opacity-70">
                {TEAM_SIZE_NAME[size]}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-2">
        {(["A", "B"] as const).map((team, index) => (
          <button
            key={team}
            type="button"
            onClick={() => setActive(team)}
            className={`rounded-xl border-2 p-3 flex flex-col items-center gap-2 min-h-32 transition-colors ${
              active === team
                ? "border-primary bg-primary/15"
                : "border-border bg-card"
            }`}
          >
            <span className="text-xs uppercase tracking-widest text-muted">
              Equipo {index + 1}
              {active === team && " ←"}
            </span>
            <div className="flex flex-col gap-1.5 w-full">
              {Array.from({ length: teamSize }).map((_, slot) => {
                const player = byId.get(teams[team][slot] ?? "");
                return (
                  <span
                    key={slot}
                    className="flex items-center gap-2 min-w-0 w-full"
                  >
                    {player ? (
                      <>
                        <PlayerAvatar
                          name={player.name}
                          photoUrl={player.photoUrl}
                          size={28}
                        />
                        <span className="text-sm truncate">{player.name}</span>
                      </>
                    ) : (
                      <>
                        <span className="h-7 w-7 shrink-0 rounded-full border border-dashed border-border" />
                        <span className="text-sm text-muted">Vacío</span>
                      </>
                    )}
                  </span>
                );
              })}
            </div>
          </button>
        ))}
      </section>

      <section className="flex flex-col gap-2">
        <p className="text-muted text-sm">
          Tocá un jugador para mandarlo al equipo marcado; tocalo de nuevo para
          sacarlo.
        </p>
        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {players.map((player) => {
            const inTeam = teams.A.includes(player.id)
              ? 1
              : teams.B.includes(player.id)
                ? 2
                : null;
            return (
              <li key={player.id}>
                <button
                  type="button"
                  onClick={() => toggle(player.id)}
                  className={`w-full flex items-center gap-2 rounded-lg border-2 p-2 text-left shadow-md shadow-black/30 transition-colors ${
                    inTeam
                      ? "border-primary bg-primary/25"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  <PlayerAvatar
                    name={player.name}
                    photoUrl={player.photoUrl}
                    size={32}
                  />
                  <span className="text-sm font-medium truncate flex-1">
                    {player.name}
                  </span>
                  {inTeam && (
                    <span className="text-primary text-xs font-bold shrink-0">
                      E{inTeam}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
        {chosen.size > 0 && players.length < teamSize * 2 && (
          <p className="text-sm text-muted">
            Te faltan jugadores cargados para esta modalidad.
          </p>
        )}
      </section>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="button"
        disabled={isPending || !complete}
        onClick={handleSubmit}
        className="self-start bg-primary text-white rounded-md shadow-md shadow-primary/20 px-5 py-2 text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
      >
        {isPending ? "Creando..." : "Arrancar partida de truco"}
      </button>
    </div>
  );
}
