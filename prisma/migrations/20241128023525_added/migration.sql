-- AlterTable
ALTER TABLE "NomencladorEquivalencia" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "NomencladorNM" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "NomencladorNU" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Survey" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "Nomina" (
    "id" SERIAL NOT NULL,
    "estadoActual" TEXT NOT NULL,
    "cuenta" TEXT NOT NULL,
    "servicio" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "provincia" TEXT NOT NULL,
    "site" TEXT NOT NULL,
    "lider" TEXT NOT NULL,
    "apellidoYNombre" TEXT NOT NULL,
    "usuarioOrion" TEXT NOT NULL,
    "usuarioSalesforce" TEXT NOT NULL,
    "modalidad" TEXT NOT NULL,
    "ingreso" TEXT NOT NULL,
    "egreso" TEXT NOT NULL,
    "box" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "teamLeaderId" INTEGER NOT NULL,
    "teamId" INTEGER NOT NULL,

    CONSTRAINT "Nomina_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Nomina" ADD CONSTRAINT "Nomina_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
