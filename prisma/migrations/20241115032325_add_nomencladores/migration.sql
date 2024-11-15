/*
  Warnings:

  - You are about to drop the column `agent` on the `Survey` table. All the data in the column will be lost.
  - You are about to drop the column `comment` on the `Survey` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `Survey` table. All the data in the column will be lost.
  - You are about to drop the column `score` on the `Survey` table. All the data in the column will be lost.
  - Added the required column `moodRating` to the `Survey` table without a default value. This is not possible if the table is not empty.
  - Added the required column `personalWellbeing` to the `Survey` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stressLevel` to the `Survey` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workEnvironment` to the `Survey` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workLifeBalance` to the `Survey` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Survey" DROP COLUMN "agent",
DROP COLUMN "comment",
DROP COLUMN "date",
DROP COLUMN "score",
ADD COLUMN     "feedback" TEXT,
ADD COLUMN     "moodRating" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "personalWellbeing" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "stressLevel" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "workEnvironment" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "workLifeBalance" DOUBLE PRECISION NOT NULL;

-- CreateTable
CREATE TABLE "NomencladorNM" (
    "id" SERIAL NOT NULL,
    "descripcion" TEXT NOT NULL,
    "comoPedirse" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "observaciones" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NomencladorNM_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NomencladorNU" (
    "id" SERIAL NOT NULL,
    "descripcion" TEXT NOT NULL,
    "comoPedirse" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nucodigo" TEXT NOT NULL,
    "observaciones" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NomencladorNU_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NomencladorEquivalencia" (
    "id" SERIAL NOT NULL,
    "nmId" INTEGER NOT NULL,
    "nuId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NomencladorEquivalencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NomencladorChange" (
    "id" SERIAL NOT NULL,
    "nomenclador" TEXT NOT NULL,
    "practiceId" INTEGER NOT NULL,
    "field" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedBy" INTEGER NOT NULL,

    CONSTRAINT "NomencladorChange_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NomencladorNM_codigo_key" ON "NomencladorNM"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "NomencladorNU_codigo_nucodigo_key" ON "NomencladorNU"("codigo", "nucodigo");

-- CreateIndex
CREATE UNIQUE INDEX "NomencladorEquivalencia_nmId_nuId_key" ON "NomencladorEquivalencia"("nmId", "nuId");

-- CreateIndex
CREATE INDEX "NomencladorChange_practiceId_idx" ON "NomencladorChange"("practiceId");

-- CreateIndex
CREATE INDEX "NomencladorChange_createdAt_idx" ON "NomencladorChange"("createdAt");

-- AddForeignKey
ALTER TABLE "NomencladorEquivalencia" ADD CONSTRAINT "NomencladorEquivalencia_nmId_fkey" FOREIGN KEY ("nmId") REFERENCES "NomencladorNM"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NomencladorEquivalencia" ADD CONSTRAINT "NomencladorEquivalencia_nuId_fkey" FOREIGN KEY ("nuId") REFERENCES "NomencladorNU"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NomencladorChange" ADD CONSTRAINT "NomencladorChange_modifiedBy_fkey" FOREIGN KEY ("modifiedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NomencladorChange" ADD CONSTRAINT "NomencladorChange_practiceId_nm_fkey" FOREIGN KEY ("practiceId") REFERENCES "NomencladorNM"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NomencladorChange" ADD CONSTRAINT "NomencladorChange_practiceId_nu_fkey" FOREIGN KEY ("practiceId") REFERENCES "NomencladorNU"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
