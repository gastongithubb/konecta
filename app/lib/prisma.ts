// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prismaClientSingleton = () => {
  if (!process.env.DATABASE_POSTGRES_PRISMA_URL) {
    throw new Error('DATABASE_POSTGRES_PRISMA_URL is not defined')
  }

  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_POSTGRES_PRISMA_URL
      }
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
  })
}

type GlobalWithPrisma = typeof globalThis & {
  prisma: PrismaClient | undefined
}

const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
  (globalThis as GlobalWithPrisma).prisma = prisma
}

export { prisma }