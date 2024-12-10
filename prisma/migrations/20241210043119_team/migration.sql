/*
  Warnings:

  - You are about to drop the column `date` on the `DailyMetrics` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `DailyMetrics` table. All the data in the column will be lost.
  - Added the required column `teamId` to the `CaseTracking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `CaseTracking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teamLeaderId` to the `DailyMetrics` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `TMOMetrics` table without a default value. This is not possible if the table is not empty.
  - Made the column `qLlAtendidas` on table `TMOMetrics` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tiempoACD` on table `TMOMetrics` required. This step will fail if there are existing NULL values in that column.
  - Made the column `acw` on table `TMOMetrics` required. This step will fail if there are existing NULL values in that column.
  - Made the column `hold` on table `TMOMetrics` required. This step will fail if there are existing NULL values in that column.
  - Made the column `ring` on table `TMOMetrics` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tmo` on table `TMOMetrics` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "DailyMetrics" DROP CONSTRAINT "DailyMetrics_userId_fkey";

-- DropForeignKey
ALTER TABLE "TMOMetrics" DROP CONSTRAINT "TMOMetrics_teamId_fkey";

-- AlterTable
ALTER TABLE "CaseTracking" ADD COLUMN     "teamId" INTEGER NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "DailyMetrics" DROP COLUMN "date",
DROP COLUMN "userId",
ADD COLUMN     "teamLeaderId" INTEGER NOT NULL,
ALTER COLUMN "nps" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "TMOMetrics" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "qLlAtendidas" SET NOT NULL,
ALTER COLUMN "teamId" DROP NOT NULL,
ALTER COLUMN "tiempoACD" SET NOT NULL,
ALTER COLUMN "tiempoACD" SET DEFAULT '00:00:00',
ALTER COLUMN "tiempoACD" SET DATA TYPE TEXT,
ALTER COLUMN "acw" SET NOT NULL,
ALTER COLUMN "acw" SET DEFAULT '00:00:00',
ALTER COLUMN "acw" SET DATA TYPE TEXT,
ALTER COLUMN "hold" SET NOT NULL,
ALTER COLUMN "hold" SET DEFAULT '00:00:00',
ALTER COLUMN "hold" SET DATA TYPE TEXT,
ALTER COLUMN "ring" SET NOT NULL,
ALTER COLUMN "ring" SET DEFAULT '00:00:00',
ALTER COLUMN "ring" SET DATA TYPE TEXT,
ALTER COLUMN "tmo" SET NOT NULL,
ALTER COLUMN "tmo" SET DEFAULT '00:00:00',
ALTER COLUMN "tmo" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "Incident" (
    "id" SERIAL NOT NULL,
    "system" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "ticketNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Incident_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Incident_ticketNumber_key" ON "Incident"("ticketNumber");

-- CreateIndex
CREATE INDEX "Incident_ticketNumber_idx" ON "Incident"("ticketNumber");

-- CreateIndex
CREATE INDEX "Incident_system_idx" ON "Incident"("system");

-- CreateIndex
CREATE INDEX "Incident_status_idx" ON "Incident"("status");

-- CreateIndex
CREATE INDEX "DailyMetrics_teamId_idx" ON "DailyMetrics"("teamId");

-- CreateIndex
CREATE INDEX "DailyMetrics_teamLeaderId_idx" ON "DailyMetrics"("teamLeaderId");

-- CreateIndex
CREATE INDEX "TMOMetrics_teamId_idx" ON "TMOMetrics"("teamId");

-- CreateIndex
CREATE INDEX "TMOMetrics_teamLeaderId_idx" ON "TMOMetrics"("teamLeaderId");

-- AddForeignKey
ALTER TABLE "DailyMetrics" ADD CONSTRAINT "DailyMetrics_teamLeaderId_fkey" FOREIGN KEY ("teamLeaderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TMOMetrics" ADD CONSTRAINT "TMOMetrics_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseTracking" ADD CONSTRAINT "CaseTracking_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseTracking" ADD CONSTRAINT "CaseTracking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
