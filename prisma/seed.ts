import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create or find manager
  let manager = await prisma.user.findUnique({
    where: { email: 'carla.chavez@konecta-group.com' },
  })

  if (!manager) {
    manager = await prisma.user.create({
      data: {
        name: 'Carla Chavez',
        email: 'carla.chavez@konecta-group.com',
        password: await bcrypt.hash('GerenciaSancor-Konecta', 10),
        role: 'manager',
      },
    })
  }
}
main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
