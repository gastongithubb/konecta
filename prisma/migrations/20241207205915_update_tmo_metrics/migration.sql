/*
  Warnings:

  - The `tiempoACD` column on the `TMOMetrics` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `acw` column on the `TMOMetrics` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `hold` column on the `TMOMetrics` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `ring` column on the `TMOMetrics` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `tmo` column on the `TMOMetrics` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "TMOMetrics" ALTER COLUMN "qLlAtendidas" DROP NOT NULL,
DROP COLUMN "tiempoACD",
ADD COLUMN     "tiempoACD" INTEGER,
DROP COLUMN "acw",
ADD COLUMN     "acw" INTEGER,
DROP COLUMN "hold",
ADD COLUMN     "hold" INTEGER,
DROP COLUMN "ring",
ADD COLUMN     "ring" INTEGER,
DROP COLUMN "tmo",
ADD COLUMN     "tmo" INTEGER;
