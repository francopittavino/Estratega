export type GameWithDetails = {
  id: string;
  status: "IN_PROGRESS" | "FINISHED";
  createdAt: Date;
  finishedAt: Date | null;
  participants: {
    id: string;
    playerId: string;
    totalPoints: number;
    isWinner: boolean;
    player: { id: string; name: string; photoUrl: string | null };
    roundScores: { roundId: string; points: number }[];
  }[];
  rounds: {
    id: string;
    number: number;
    closedAt: Date | null;
  }[];
};
