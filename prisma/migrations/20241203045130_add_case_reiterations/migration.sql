-- AlterTable
ALTER TABLE "Case" ADD COLUMN     "customType" TEXT,
ADD COLUMN     "reiteratedFrom" INTEGER;

-- CreateIndex
CREATE INDEX "Case_caseNumber_idx" ON "Case"("caseNumber");

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_reiteratedFrom_fkey" FOREIGN KEY ("reiteratedFrom") REFERENCES "Case"("id") ON DELETE SET NULL ON UPDATE CASCADE;
