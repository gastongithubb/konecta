-- CreateTable
CREATE TABLE "DailyMetrics" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "nsp" INTEGER NOT NULL,
    "q" INTEGER NOT NULL,
    "nps" INTEGER NOT NULL,
    "csat" DOUBLE PRECISION NOT NULL,
    "ces" DOUBLE PRECISION NOT NULL,
    "rd" DOUBLE PRECISION NOT NULL,
    "userId" INTEGER NOT NULL,
    "teamId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrimestralMetrics" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "qResp" INTEGER NOT NULL,
    "nps" INTEGER NOT NULL,
    "sat" DOUBLE PRECISION NOT NULL,
    "rd" DOUBLE PRECISION NOT NULL,
    "teamLeaderId" INTEGER NOT NULL,
    "teamId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrimestralMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SemanalMetrics" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "week" TEXT NOT NULL,
    "q" INTEGER NOT NULL,
    "nps" INTEGER NOT NULL,
    "csat" DOUBLE PRECISION NOT NULL,
    "teamLeaderId" INTEGER NOT NULL,
    "teamId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SemanalMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TMOMetrics" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "qLlAtendidas" INTEGER NOT NULL,
    "tiempoACD" TEXT NOT NULL,
    "acw" TEXT NOT NULL,
    "hold" TEXT NOT NULL,
    "ring" TEXT NOT NULL,
    "tmo" TEXT NOT NULL,
    "teamLeaderId" INTEGER NOT NULL,
    "teamId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TMOMetrics_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DailyMetrics" ADD CONSTRAINT "DailyMetrics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyMetrics" ADD CONSTRAINT "DailyMetrics_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrimestralMetrics" ADD CONSTRAINT "TrimestralMetrics_teamLeaderId_fkey" FOREIGN KEY ("teamLeaderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrimestralMetrics" ADD CONSTRAINT "TrimestralMetrics_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SemanalMetrics" ADD CONSTRAINT "SemanalMetrics_teamLeaderId_fkey" FOREIGN KEY ("teamLeaderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SemanalMetrics" ADD CONSTRAINT "SemanalMetrics_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TMOMetrics" ADD CONSTRAINT "TMOMetrics_teamLeaderId_fkey" FOREIGN KEY ("teamLeaderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TMOMetrics" ADD CONSTRAINT "TMOMetrics_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
