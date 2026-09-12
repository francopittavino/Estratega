"use client";

import { useRef } from "react";
import { PlayerAvatar } from "@/components/player-avatar";

// Solo abre el selector de archivo y avisa qué foto se eligió. La subida (y
// la contraseña que pide) las maneja PlayerCard, que es quien tiene lugar
// para mostrar el campo sin meter un formulario adentro de un <button>.
export function EditablePlayerAvatar({
  name,
  photoUrl,
  size = 44,
  disabled = false,
  onSelect,
}: {
  name: string;
  photoUrl: string | null;
  size?: number;
  disabled?: boolean;
  onSelect: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    // El input se limpia siempre: si no, volver a elegir la misma foto no
    // dispara el change y parece que no funciona.
    if (inputRef.current) inputRef.current.value = "";
    if (file) onSelect(file);
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      disabled={disabled}
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
