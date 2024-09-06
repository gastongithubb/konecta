import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create manager
  const manager = await prisma.user.create({
    data: {
      name: 'Carla Chavez',
      email: 'carla.chavez@konecta-group.com',
      password: await bcrypt.hash('GerenciaSancor-Konecta', 10),
      role: 'manager',
    },
  })

  // Create team leader Evelin Garay and her team
  const teamLeaderEvelin = await prisma.user.create({
    data: {
      name: 'Evelin Garay',
      email: 'eve-garay@sancor.konecta.ar',
      password: await bcrypt.hash('EvelinGaray123', 10),
      role: 'team_leader',
    },
  })

  const teamEvelin = await prisma.team.create({
    data: {
      name: 'Team Evelin',
      manager: { connect: { id: manager.id } },
      teamLeader: { connect: { id: teamLeaderEvelin.id } },
    },
  })

  const evelinTeamUsers = [
    { name: 'Alvarez Falco Franco Gabriel', email: 'franco.alvarez@sancor.konecta.ar' },
    { name: 'Aranda Karen Tamara', email: 'karen.aranda@sancor.konecta.ar' },
    { name: 'BRITOS FLORES JEREMIAS ARIEL', email: 'jeremias.britos@sancor.konecta.ar' },
    { name: 'BROCAL LAUTARO IVAN', email: 'lautaro.brocal@sancor.konecta.ar' },
    { name: 'Chavez Karen Yamila', email: 'karen.chavez@sancor.konecta.ar' },
    { name: 'Gomez Macarena', email: 'macarena.gomez@sancor.konecta.ar' },
    { name: 'Heil Auca Matias', email: 'auca.heil@sancor.konecta.ar' },
    { name: 'Iriarte Ismael Agustin Andres', email: 'ismael.iriarte@sancor.konecta.ar' },
    { name: 'Juncos Milagros Anahi', email: 'milagros.juncos@sancor.konecta.ar' },
    { name: 'MACAGNO LEONARDO NICOLAS', email: 'leonardo.macagno@sancor.konecta.ar' },
    { name: 'Martinez Victoria', email: 'victoria.martinez@sancor.konecta.ar' },
    { name: 'Mena Lerda Mauricio Emanuel', email: 'mauricio.mena@sancor.konecta.ar' },
    { name: 'MONTENEGRO MARCOS JOEL', email: 'marcos.montenegro@sancor.konecta.ar' },
    { name: 'POCCETTI ALDANA BELEN', email: 'aldana.poccetti@sancor.konecta.ar' },
    { name: 'RODRIGUEZ ANGEL JAVIER', email: 'angel.rodriguez@sancor.konecta.ar' },
    { name: 'SUAREZ PEDERNERA AGUSTIN EZEQUIEL', email: 'agustin.suarez@sancor.konecta.ar' },
    { name: 'Veyga Hanigian Maria Abigail', email: 'maria.veyga@sancor.konecta.ar' },
    { name: 'VIJARRA PABLO SEBASTIAN', email: 'pablo.vijarra@sancor.konecta.ar' },
  ]

  for (const userData of evelinTeamUsers) {
    const names = userData.name.split(' ')
    const lastName = names[0].toLowerCase()
    const firstName = names[names.length - 1].toLowerCase()
    const password = `${firstName}${lastName}123`

    await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password: await bcrypt.hash(password, 10),
        role: 'user',
        team: { connect: { id: teamEvelin.id } },
      },
    })
  }

  console.log('Seeding completed successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })