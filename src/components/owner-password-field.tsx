"use client";

// Campo opcional que aparece al crear una partida: la contraseña con la que
// el dueño recupera el control si se le cae la página. Se explica ahí mismo
// porque si no, no se entiende para qué sirve.
export function OwnerPasswordField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5 max-w-sm">
      <span className="text-sm font-medium">
        Contraseña de la partida{" "}
        <span className="text-muted font-normal">(opcional)</span>
      </span>
      <input
        type="password"
        autoComplete="new-password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Dejala vacía si no te hace falta"
        className="rounded-md border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
      />
      <span className="text-xs text-muted leading-snug">
        Solo vos vas a poder anotar; el resto ve el marcador en vivo. Si se te
        cierra la página o cambiás de celular, con esta contraseña recuperás el
        control.
      </span>
    </label>
  );
}
