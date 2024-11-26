-- DropForeignKey
ALTER TABLE "Case" DROP CONSTRAINT "Case_teamId_fkey";

-- AlterTable
ALTER TABLE "Case" ALTER COLUMN "teamId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
