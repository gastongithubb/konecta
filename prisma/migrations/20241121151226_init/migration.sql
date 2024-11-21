-- CreateTable
CREATE TABLE "CaseTracking" (
    "id" SERIAL NOT NULL,
    "caseNumber" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "area" TEXT,
    "reason" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CaseTracking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CaseTracking_caseNumber_key" ON "CaseTracking"("caseNumber");
