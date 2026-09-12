"use client";

import { useState, useTransition } from "react";
import { deleteGame } from "@/lib/actions/games";
import { deleteTrucoGame } from "@/lib/actions/truco";

// Borrar una partida pide la contraseña compartida. El campo va dentro de
// la página y no en un window.prompt: el prompt nativo bloquea la pestaña
// entera mientras está abierto.
export function DeleteGameButton({
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
          await deleteTrucoGame(gameId, password);
        } else {
          await deleteGame(gameId, password);
        }
        setPassword("");
        setOpen(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo eliminar");
      }
    });
  }

  if (open) {
    return (
      <form
        onSubmit={handleSubmit}
        className="flex items-start gap-1.5 shrink-0"
      >
        <div className="flex flex-col gap-1">
          <input
            type="password"
            autoFocus
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            className="w-28 rounded-md border border-border bg-background px-2 py-1.5 text-sm outline-none focus:border-primary"
          />
          {error && <span className="text-xs text-red-400">{error}</span>}
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="h-9 px-2 rounded-md bg-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/30 transition-colors disabled:opacity-60"
        >
          Borrar
        </button>
        <button
          type="button"
          aria-label="Cancelar borrado"
          onClick={() => {
            setOpen(false);
            setError(null);
          }}
          className="h-9 px-2 rounded-md text-muted text-sm hover:text-foreground transition-colors"
        >
          ✕
        </button>
      </form>
    );
  }

  return (
    <button
      type="button"
      aria-label="Eliminar partida"
      onClick={() => setOpen(true)}
      className="shrink-0 h-9 w-9 flex items-center justify-center rounded-md text-muted hover:text-red-400 hover:bg-red-400/10 transition-colors"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <path d="M3 6h18" />
        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
      </svg>
    </button>
  );
}
