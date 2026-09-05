"use client";

import { useState, useTransition } from "react";
import { EditablePlayerAvatar } from "@/components/editable-player-avatar";
import { deletePlayer, updatePlayerName } from "@/lib/actions/players";

type Player = {
  id: string;
  name: string;
  photoUrl: string | null;
  wins: number;
};

export function PlayerCard({ player }: { player: Player }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(player.name);
  const [isPending, startTransition] = useTransition();

  function saveName() {
    const trimmed = name.trim();
    if (!trimmed || trimmed === player.name) {
      setName(player.name);
      setEditing(false);
      return;
    }
    startTransition(async () => {
      try {
        await updatePlayerName(player.id, trimmed);
      } catch (err) {
        alert(err instanceof Error ? err.message : "No se pudo renombrar");
        setName(player.name);
      } finally {
        setEditing(false);
      }
    });
  }

  function handleDelete() {
    if (!confirm(`¿Eliminar a ${player.name}?`)) return;
    startTransition(async () => {
      try {
        await deletePlayer(player.id);
      } catch (err) {
        alert(err instanceof Error ? err.message : "No se pudo eliminar");
      }
    });
  }

  return (
    <li className="bg-card border border-border shadow-lg shadow-black/30 rounded-lg p-3 flex items-center gap-3">
      <EditablePlayerAvatar
        playerId={player.id}
        name={player.name}
        photoUrl={player.photoUrl}
        size={44}
      />
      <div className="min-w-0 flex-1">
        {editing ? (
          <input
            autoFocus
            value={name}
            disabled={isPending}
            onChange={(e) => setName(e.target.value)}
            onBlur={saveName}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveName();
              if (e.key === "Escape") {
                setName(player.name);
                setEditing(false);
              }
            }}
            className="w-full bg-background border border-border rounded px-1.5 py-0.5 text-sm font-medium"
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="font-medium truncate text-left hover:underline decoration-dotted"
            title="Editar nombre"
          >
            {player.name}
          </button>
        )}
        <p className="text-xs text-muted">
          {player.wins} {player.wins === 1 ? "victoria" : "victorias"}
        </p>
      </div>
      <button
        type="button"
        aria-label="Eliminar jugador"
        disabled={isPending}
        onClick={handleDelete}
        className="shrink-0 h-8 w-8 flex items-center justify-center rounded-md text-muted hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-60"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <path d="M3 6h18" />
          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <line x1="10" y1="11" x2="10" y2="17" />
          <line x1="14" y1="11" x2="14" y2="17" />
        </svg>
      </button>
    </li>
  );
}
