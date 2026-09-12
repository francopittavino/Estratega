"use client";

import { useState, useTransition } from "react";
import { claimGame } from "@/lib/actions/games";
import { claimTrucoGame } from "@/lib/actions/truco";

// Cartel que ven los espectadores: el marcador es de solo lectura, pero si
// alguien sabe la contraseña puede tomar el control (por si el que arrancó
// la partida perdió la cookie o le quiere pasar el anotador a otro).
export function ClaimControl({
  gameId,
  kind,
}: {
  gameId: string;
  kind: "estratega" | "truco";
}) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        if (kind === "truco") {
          await claimTrucoGame(gameId, password);
        } else {
          await claimGame(gameId, password);
        }
        setPassword("");
        setOpen(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo");
      }
    });
  }

  return (
    <div className="bg-card border border-border rounded-lg p-3 flex flex-col gap-2">
      <p className="text-sm text-muted">
        👀 Estás mirando. Solo el que inició la partida puede anotar.
      </p>

      {open ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <input
            type="password"
            autoFocus
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="bg-primary text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-60"
            >
              {isPending ? "..." : "Confirmar"}
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setError(null);
              }}
              className="border border-border text-muted rounded-md px-4 py-2 text-sm hover:text-foreground transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="self-start border border-primary text-primary rounded-md px-4 py-2 text-sm font-medium hover:bg-primary/10 transition-colors"
        >
          Tomar el control
        </button>
      )}
    </div>
  );
}
