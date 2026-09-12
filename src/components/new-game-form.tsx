"use client";

import { useState, useTransition } from "react";
import { createGame } from "@/lib/actions/games";
import { PlayerAvatar } from "@/components/player-avatar";
import { isRedirectError } from "@/lib/is-redirect-error";
import { OwnerPasswordField } from "@/components/owner-password-field";

type Player = { id: string; name: string; photoUrl: string | null };

export function NewGameForm({ players }: { players: Player[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [password, setPassword] = useState("");
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
        await createGame(selected, password);
      } catch (err) {
        if (isRedirectError(err)) throw err;
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
                className={`w-full flex items-center gap-2 rounded-lg border-2 p-2 text-left shadow-md shadow-black/30 transition-colors ${
                  active
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
                {active && (
                  <span className="text-primary text-base leading-none">✓</span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      <OwnerPasswordField value={password} onChange={setPassword} />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="button"
        disabled={isPending}
        onClick={handleSubmit}
        className="self-start bg-primary text-white rounded-md shadow-md shadow-primary/20 px-5 py-2 text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-60"
      >
        {isPending ? "Creando..." : `Arrancar partida (${selected.length})`}
      </button>
    </div>
  );
}
