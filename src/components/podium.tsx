import { PlayerAvatar } from "@/components/player-avatar";

type TopPlayer = { id: string; name: string; photoUrl: string | null; wins: number };

const HEIGHTS = [88, 64, 46];
const MEDALS = ["🥇", "🥈", "🥉"];
const ORDER = [1, 0, 2];

export function Podium({ players }: { players: TopPlayer[] }) {
  if (players.length === 0) {
    return (
      <p className="text-center text-muted text-sm">
        Todavía no hay partidas ganadas.
      </p>
    );
  }

  return (
    <div className="flex items-end justify-center gap-4 sm:gap-6">
      {ORDER.filter((i) => players[i]).map((i) => {
        const player = players[i];
        return (
          <div
            key={player.id}
            className="podium-column flex flex-col items-center gap-2"
            style={{ animationDelay: `${0.15 + i * 0.12}s` }}
          >
            <span className="text-2xl">{MEDALS[i]}</span>
            <PlayerAvatar name={player.name} photoUrl={player.photoUrl} size={44} />
            <p className="text-sm font-semibold text-center max-w-[6rem] truncate">
              {player.name}
            </p>
            <p className="text-xs text-muted">
              {player.wins} {player.wins === 1 ? "victoria" : "victorias"}
            </p>
            <div
              className="w-20 sm:w-24 rounded-t-lg bg-gradient-to-t from-primary-dark to-primary shadow-lg shadow-black/50 border border-white/10"
              style={{ height: HEIGHTS[i] }}
            />
          </div>
        );
      })}
    </div>
  );
}
