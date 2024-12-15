-- AlterTable
ALTER TABLE "User" ADD COLUMN     "resetToken" TEXT,
ADD COLUMN     "resetTokenAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "resetTokenExpiry" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "TeamWeeklyTracking" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "weekId" INTEGER NOT NULL,
    "callType" TEXT,
    "audio" TEXT,
    "score" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamWeeklyTracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeekConfiguration" (
    "id" SERIAL NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" INTEGER NOT NULL,

    CONSTRAINT "WeekConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TeamWeeklyTracking_userId_idx" ON "TeamWeeklyTracking"("userId");

-- CreateIndex
CREATE INDEX "TeamWeeklyTracking_weekId_idx" ON "TeamWeeklyTracking"("weekId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamWeeklyTracking_userId_weekId_key" ON "TeamWeeklyTracking"("userId", "weekId");

-- CreateIndex
CREATE INDEX "WeekConfiguration_createdBy_idx" ON "WeekConfiguration"("createdBy");

-- AddForeignKey
ALTER TABLE "TeamWeeklyTracking" ADD CONSTRAINT "TeamWeeklyTracking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeekConfiguration" ADD CONSTRAINT "WeekConfiguration_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
