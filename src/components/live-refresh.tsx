"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Mantiene el marcador al día para los que solo miran: cada pocos segundos
// vuelve a pedirle la página al server (todas las páginas que leen de la
// base son force-dynamic, así que trae los puntos frescos).
//
// No usa websockets ni SSE a propósito: en Vercel cada request cae en una
// instancia distinta, así que una conexión abierta tampoco se enteraría de
// un cambio hecho en otra instancia sin ir igual a la base. Para un anotador
// que miran tres o cuatro personas, preguntar cada pocos segundos es más
// simple y se comporta igual.
export function LiveRefresh({
  enabled = true,
  intervalMs = 4000,
}: {
  enabled?: boolean;
  intervalMs?: number;
}) {
  const router = useRouter();

  useEffect(() => {
    if (!enabled) return;

    // Con la pestaña en segundo plano no tiene sentido gastar batería ni
    // requests; al volver se actualiza de una.
    function refreshIfVisible() {
      if (document.visibilityState === "visible") router.refresh();
    }

    const timer = setInterval(refreshIfVisible, intervalMs);
    document.addEventListener("visibilitychange", refreshIfVisible);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", refreshIfVisible);
    };
  }, [router, enabled, intervalMs]);

  return null;
}

// Cartelito de "esto se actualiza solo", para que el espectador no se quede
// esperando con la duda de si tiene que refrescar a mano.
export function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted">
      <span className="relative flex h-2 w-2">
        <span className="live-dot absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
      </span>
      En vivo
    </span>
  );
}
