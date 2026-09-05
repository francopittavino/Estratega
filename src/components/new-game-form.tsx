"use client";

import { useState, useTransition } from "react";
import { createGame } from "@/lib/actions/games";
import { PlayerAvatar } from "@/components/player-avatar";

type Player = { id: string; name: string; photoUrl: string | null };

export function NewGameForm({ players }: { players: Player[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function handleSubmit() {
    setError(null);
    if (selected.length < 2) {
      setError("Elegí al menos 2 jugadores.");
      return;
    }
    startTransition(async () => {
      try {
        await createGame(selected);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ocurrió un error");
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {players.map((player) => {
          const active = selected.includes(player.id);
          return (
            <li key={player.id}>
              <button
                type="button"
                onClick={() => toggle(player.id)}
                className={`w-full flex items-center gap-2 rounded-lg border-2 p-2 text-left transition-colors ${
                  active
                    ? "border-utn-blue bg-utn-blue/25"
                    : "border-border bg-card hover:border-utn-blue/50"
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
                {active && (
                  <span className="text-utn-blue text-base leading-none">✓</span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="button"
        disabled={isPending}
        onClick={handleSubmit}
        className="self-start bg-utn-blue text-white rounded-md px-5 py-2 text-sm font-medium hover:bg-utn-blue-dark transition-colors disabled:opacity-60"
      >
        {isPending ? "Creando..." : `Arrancar partida (${selected.length})`}
      </button>
    </div>
  );
}
