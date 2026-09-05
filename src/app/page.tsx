import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Podium } from "@/components/podium";

export const dynamic = "force-dynamic";

export default async function Home() {
  const topPlayers = await prisma.player.findMany({
    where: { wins: { gt: 0 } },
    orderBy: [{ wins: "desc" }, { name: "asc" }],
    take: 3,
  });

  return (
    <div className="flex flex-col items-center justify-center gap-6 min-h-[calc(100svh-5.5rem)] text-center">
      <div>
        <h1 className="hero-title text-5xl sm:text-6xl">EL ESTRATEGA</h1>
        <p className="text-muted tracking-widest text-sm uppercase mt-2">
          de la UTN
        </p>
      </div>

      <Link
        href="/partidas/nueva"
        className="bg-primary text-white rounded-full px-8 py-3 text-base font-semibold hover:bg-primary-dark transition-colors shadow-lg shadow-primary/30"
      >
        Iniciar partida
      </Link>

      <div className="w-full flex flex-col items-center gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
          Top 3 actual
        </h2>
        <Podium players={topPlayers} />
      </div>
    </div>
  );
}
