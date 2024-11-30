-- Migration SQL file
ALTER TABLE "Team" ADD COLUMN "grupoNovedades" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Team" ADD COLUMN "grupoGeneral" TEXT NOT NULL DEFAULT '';