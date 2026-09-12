"use client";

import { useState, useTransition } from "react";
import { EditablePlayerAvatar } from "@/components/editable-player-avatar";
import {
  deletePlayer,
  updatePlayerName,
  updatePlayerPhoto,
} from "@/lib/actions/players";

type Player = {
  id: string;
  name: string;
  photoUrl: string | null;
  wins: number;
};

// Las tres ediciones de un jugador piden la contraseña compartida. En vez de
// un window.prompt por cada una (que congela la pestaña), la tarjeta abre un
// campo abajo y desde ahí se confirma la que esté pendiente.
type Pending =
  | { kind: "rename"; name: string }
  | { kind: "delete" }
  | { kind: "photo"; file: File };

function pendingTitle(pending: Pending, player: Player) {
  switch (pending.kind) {
    case "rename":
      return `Contraseña para renombrar a “${pending.name}”`;
    case "delete":
      return `Contraseña para eliminar a ${player.name}`;
    case "photo":
      return `Contraseña para cambiarle la foto a ${player.name}`;
  }
}

export function PlayerCard({ player }: { player: Player }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(player.name);
  const [pending, setPending] = useState<Pending | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, startTransition] = useTransition();

  function askFor(next: Pending) {
    setPending(next);
    setPassword("");
    setError(null);
  }

  function cancel() {
    setPending(null);
    setPassword("");
    setError(null);
    setName(player.name);
    setEditing(false);
  }

  function finishEditingName() {
    const trimmed = name.trim();
    setEditing(false);
    if (!trimmed || trimmed === player.name) {
      setName(player.name);
      return;
    }
    askFor({ kind: "rename", name: trimmed });
  }

  function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    if (!pending) return;
    // Sin contraseña no se llama al server. Además de evitar un error al
    // pedo, tapa esto: el Enter con el que confirmás el nombre nuevo llega
    // al campo de contraseña recién montado (que tiene autoFocus) y
    // dispararía un submit vacío antes de que llegues a escribir nada.
    if (!password) return;
    setError(null);

    startTransition(async () => {
      try {
        if (pending.kind === "rename") {
          await updatePlayerName(player.id, pending.name, password);
        } else if (pending.kind === "delete") {
          await deletePlayer(player.id, password);
        } else {
          const formData = new FormData();
          formData.set("photo", pending.file);
          formData.set("password", password);
          await updatePlayerPhoto(player.id, formData);
        }
        setPending(null);
        setPassword("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo guardar");
      }
    });
  }

  return (
    <li className="bg-card border border-border shadow-lg shadow-black/30 rounded-lg p-3 flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <EditablePlayerAvatar
          name={player.name}
          photoUrl={player.photoUrl}
          size={44}
          disabled={isSaving}
          onSelect={(file) => askFor({ kind: "photo", file })}
        />
        <div className="min-w-0 flex-1">
          {editing ? (
            <input
              autoFocus
              value={name}
              disabled={isSaving}
              onChange={(e) => setName(e.target.value)}
              onBlur={finishEditingName}
              onKeyDown={(e) => {
                if (e.key === "Enter") finishEditingName();
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
          disabled={isSaving}
          onClick={() => askFor({ kind: "delete" })}
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
      </div>

      {pending && (
        <form
          onSubmit={handleConfirm}
          className="flex flex-col gap-1.5 border-t border-border pt-2"
        >
          <p className="text-xs text-muted">
            {pendingTitle(pending, player)}
          </p>
          <div className="flex items-center gap-1.5">
            <input
              type="password"
              autoFocus
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              className="flex-1 min-w-0 rounded-md border border-border bg-background px-2 py-1.5 text-sm outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={isSaving || !password}
              className="h-8 px-3 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {isSaving ? "..." : "Confirmar"}
            </button>
            <button
              type="button"
              aria-label="Cancelar"
              onClick={cancel}
              className="h-8 px-2 rounded-md text-muted text-sm hover:text-foreground transition-colors"
            >
              ✕
            </button>
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </form>
      )}
    </li>
  );
}
