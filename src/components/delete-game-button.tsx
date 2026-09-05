"use client";

import { useTransition } from "react";
import { deleteGame } from "@/lib/actions/games";

export function DeleteGameButton({ gameId }: { gameId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const password = window.prompt("Contraseña para eliminar la partida:");
    if (password === null) return;
    startTransition(async () => {
      try {
        await deleteGame(gameId, password);
      } catch (err) {
        alert(err instanceof Error ? err.message : "No se pudo eliminar");
      }
    });
  }

  return (
    <button
      type="button"
      aria-label="Eliminar partida"
      disabled={isPending}
      onClick={handleClick}
      className="shrink-0 h-9 w-9 flex items-center justify-center rounded-md text-muted hover:text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-60"
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
