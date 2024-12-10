-- DropForeignKey
ALTER TABLE "DailyMetrics" DROP CONSTRAINT "DailyMetrics_teamId_fkey";

-- AlterTable
ALTER TABLE "DailyMetrics" ALTER COLUMN "teamId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "DailyMetrics" ADD CONSTRAINT "DailyMetrics_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
