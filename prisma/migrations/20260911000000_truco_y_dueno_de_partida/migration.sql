-- CreateEnum
CREATE TYPE "TrucoTeam" AS ENUM ('A', 'B');

-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "ownerKey" TEXT;

-- CreateTable
CREATE TABLE "TrucoGame" (
    "id" TEXT NOT NULL,
    "teamSize" INTEGER NOT NULL,
    "status" "GameStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "pointsA" INTEGER NOT NULL DEFAULT 0,
    "pointsB" INTEGER NOT NULL DEFAULT 0,
    "winnerTeam" "TrucoTeam",
    "ownerKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "TrucoGame_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrucoMember" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "team" "TrucoTeam" NOT NULL,

    CONSTRAINT "TrucoMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TrucoMember_gameId_idx" ON "TrucoMember"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "TrucoMember_gameId_playerId_key" ON "TrucoMember"("gameId", "playerId");

-- AddForeignKey
ALTER TABLE "TrucoMember" ADD CONSTRAINT "TrucoMember_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "TrucoGame"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrucoMember" ADD CONSTRAINT "TrucoMember_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

