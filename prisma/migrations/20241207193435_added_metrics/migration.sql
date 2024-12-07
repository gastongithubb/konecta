/*
  Warnings:

  - You are about to drop the column `nsp` on the `DailyMetrics` table. All the data in the column will be lost.
  - Added the required column `name` to the `DailyMetrics` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DailyMetrics" DROP COLUMN "nsp",
ADD COLUMN     "name" TEXT NOT NULL;
