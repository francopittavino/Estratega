-- CreateTable
CREATE TABLE "TrucoScoreEvent" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "team" "TrucoTeam" NOT NULL,
    "delta" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrucoScoreEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TrucoScoreEvent_gameId_createdAt_idx" ON "TrucoScoreEvent"("gameId", "createdAt");

-- AddForeignKey
ALTER TABLE "TrucoScoreEvent" ADD CONSTRAINT "TrucoScoreEvent_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "TrucoGame"("id") ON DELETE CASCADE ON UPDATE CASCADE;
