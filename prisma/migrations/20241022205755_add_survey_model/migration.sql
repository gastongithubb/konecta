-- CreateTable
CREATE TABLE "News" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "creatorId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "News_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Survey" (
    "id" SERIAL NOT NULL,
    "comment" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "agent" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Survey_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "News" ADD CONSTRAINT "News_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
