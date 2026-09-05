import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { NewGameForm } from "@/components/new-game-form";

export const dynamic = "force-dynamic";

export default async function NuevaPartidaPage() {
  const players = await prisma.player.findMany({
    orderBy: { name: "asc" },
  });

  if (players.length < 2) {
    return (
      <div className="flex flex-col gap-3">
        <h1 className="text-xl font-bold">Nueva partida</h1>
        <p className="text-muted text-sm">
          Necesitás al menos 2 jugadores cargados para arrancar una partida.
        </p>
        <Link
          href="/jugadores"
          className="self-start bg-primary text-white rounded-md shadow-md shadow-primary/20 px-4 py-2 text-sm font-medium hover:bg-primary-dark transition-colors"
        >
          Cargar jugadores
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">Nueva partida</h1>
      <p className="text-muted text-sm">Elegí los participantes:</p>
      <NewGameForm players={players} />
    </div>
  );
}
