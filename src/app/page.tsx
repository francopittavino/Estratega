import Image from "next/image";
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
    <div className="flex flex-col items-center gap-10 py-6 sm:py-10">
      <div className="flex flex-col items-center gap-4 text-center">
        <Image
          src="/utn-logo.jpg"
          alt="Logo UTN"
          width={72}
          height={72}
          className="rounded-lg bg-white p-1"
          priority
        />
        <h1 className="hero-title text-5xl sm:text-6xl">EL ESTRATEGA</h1>
        <p className="text-muted tracking-widest text-sm uppercase">
          de la UTN
        </p>
      </div>

      <Link
        href="/partidas/nueva"
        className="bg-utn-blue text-white rounded-full px-8 py-3 text-base font-semibold hover:bg-utn-blue-dark transition-colors shadow-lg shadow-utn-blue/30"
      >
        Iniciar partida
      </Link>

      <div className="w-full flex flex-col items-center gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
          Top 3 actual
        </h2>
        <Podium players={topPlayers} />
      </div>
    </div>
  );
}
