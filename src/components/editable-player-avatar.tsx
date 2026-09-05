"use client";

import { useRef, useTransition } from "react";
import { PlayerAvatar } from "@/components/player-avatar";
import { updatePlayerPhoto } from "@/lib/actions/players";

export function EditablePlayerAvatar({
  playerId,
  name,
  photoUrl,
  size = 44,
}: {
  playerId: string;
  name: string;
  photoUrl: string | null;
  size?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.set("photo", file);
    startTransition(async () => {
      try {
        await updatePlayerPhoto(playerId, formData);
      } catch (err) {
        alert(err instanceof Error ? err.message : "No se pudo cambiar la foto");
      } finally {
        if (inputRef.current) inputRef.current.value = "";
      }
    });
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      disabled={isPending}
      title="Cambiar foto"
      className="relative shrink-0 rounded-full disabled:opacity-60"
      style={{ width: size, height: size }}
    >
      <PlayerAvatar name={name} photoUrl={photoUrl} size={size} />
      <span className="absolute inset-0 rounded-full bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center text-transparent hover:text-white text-xs">
        ✎
      </span>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
    </button>
  );
}
