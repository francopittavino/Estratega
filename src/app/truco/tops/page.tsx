import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PlayerAvatar } from "@/components/player-avatar";
import { TEAM_SIZES, TEAM_SIZE_PLURAL, TEAM_SIZE_SHORT } from "@/lib/truco";

export const dynamic = "force-dynamic";

const MEDALS = ["🥇", "🥈", "🥉"];

type TeamRow = {
  key: string;
  teamSize: number;
  players: { id: string; name: string; photoUrl: string | null }[];
  wins: number;
};

export default async function TrucoTopsPage() {
  const games = await prisma.trucoGame.findMany({
    where: { status: "FINISHED" },
    include: { members: { include: { player: true } } },
  });

  // El ranking del truco es por equipo, no por jugador suelto: la clave es
  // la modalidad + los jugadores del equipo ordenados, así "Franco y Maru"
  // es siempre la misma dupla sin importar de qué lado del anotador
  // estuvieron. Se calcula acá y no se guarda en la base: son pocas
  // partidas y así borrar una la saca del ranking sin contadores que
  // corregir.
  const rows = new Map<string, TeamRow>();

  for (const game of games) {
    for (const team of ["A", "B"] as const) {
      const members = game.members.filter((m) => m.team === team);
      if (members.length === 0) continue;

      const key = `${game.teamSize}:${members
        .map((m) => m.playerId)
        .sort()
        .join("|")}`;

      let row = rows.get(key);
      if (!row) {
        row = {
          key,
          teamSize: game.teamSize,
          players: members
            .map((m) => m.player)
            .sort((a, b) => a.name.localeCompare(b.name, "es")),
          wins: 0,
        };
        rows.set(key, row);
      }
      if (game.winnerTeam === team) row.wins += 1;
    }
  }

  const all = [...rows.values()].sort(
    (a, b) =>
      b.wins - a.wins ||
      a.players[0].name.localeCompare(b.players[0].name, "es")
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-xl font-bold">Tops de truco</h1>
        <Link
          href="/truco"
          className="border border-border text-muted rounded-md px-4 py-2 text-sm font-medium hover:border-primary/50 hover:text-foreground transition-colors"
        >
          Partidas
        </Link>
      </div>
      <p className="text-muted text-sm">
        Ranking por equipo, aparte del de El Estratega. Se cuentan solo las
        partidas de truco finalizadas.
      </p>

      {TEAM_SIZES.map((size) => (
        <RankingSection
          key={size}
          title={TEAM_SIZE_PLURAL[size]}
          subtitle={TEAM_SIZE_SHORT[size]}
          rows={all.filter((r) => r.teamSize === size)}
        />
      ))}
    </div>
  );
}

function RankingSection({
  title,
  subtitle,
  rows,
}: {
  title: string;
  subtitle: string;
  rows: TeamRow[];
}) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="font-semibold text-lg">
        {title}{" "}
        <span className="text-xs uppercase tracking-widest text-muted font-normal">
          {subtitle}
        </span>
      </h2>
      {rows.length === 0 ? (
        <p className="text-muted text-sm">Todavía no hay partidas jugadas.</p>
      ) : (
        <ol className="flex flex-col gap-2">
          {rows.map((row, index) => (
            <li
              key={row.key}
              className="bg-card border border-border shadow-lg shadow-black/30 rounded-lg p-3 flex items-center gap-3"
            >
              <span className="w-7 text-center font-semibold text-muted shrink-0">
                {MEDALS[index] ?? index + 1}
              </span>
              <span className="flex -space-x-2 shrink-0">
                {row.players.map((p) => (
                  <PlayerAvatar
                    key={p.id}
                    name={p.name}
                    photoUrl={p.photoUrl}
                    size={36}
                  />
                ))}
              </span>
              <p className="flex-1 min-w-0 font-medium truncate">
                {row.players.map((p) => p.name).join(" y ")}
              </p>
              <p className="text-lg font-bold text-primary tabular-nums">
                {row.wins}
              </p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
