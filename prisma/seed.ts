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

  // Create users from the list
  const users = [
    { name: 'Giselle Aguirre', email: 'giselle.aguirre@sancor.konecta.ar' },
    { name: 'Ignacio Álvarez', email: 'ignacio.alvarez@sancor.konecta.ar' },
    { name: 'Macarena Álvarez', email: 'analia.alvarez@sancor.konecta.ar' },
    { name: 'José Báez', email: 'jose.baez@sancor.konecta.ar' },
    { name: 'Tula Carrizo', email: 'maria.carrizo@sancor.konecta.ar' },
    { name: 'Antonella Casas', email: 'antonella.casas@sancor.konecta.ar' },
    { name: 'Tomás Clavaguera', email: 'tomas.clavaguera@sancor.konecta.ar' },
    { name: 'Malen De la Mora', email: 'malen.delamora@sancor.konecta.ar' },
    { name: 'Mateo Gigena', email: 'mateo.gigena@sancor.konecta.ar' },
    { name: 'Daniela Gómez', email: 'daniela.gomez@sancor.konecta.ar' },
    { name: 'Verónica Guevara', email: 'veronica.guevara@sancor.konecta.ar' },
    { name: 'Florencia Higa', email: 'florencia.higa@sancor.konecta.ar' },
    { name: 'Clara Molina', email: 'clara.molina@sancor.konecta.ar' },
    { name: 'Heyner Morón', email: 'heyner.moron@sancor.konecta.ar' },
    { name: 'Mailen Palacios', email: 'mailen.palacios@sancor.konecta.ar' },
    { name: 'Romina Ochoa', email: 'romina.ochoa@sancor.konecta.ar' },
    { name: 'Grisel Otero', email: 'grisel.otero@sancor.konecta.ar' },
    { name: 'Anabellia Ottonello', email: 'anabellia.ottonello@sancor.konecta.ar' },
    { name: 'Iván Schilman', email: 'ivan.schilman@sancor.konecta.ar' },
    { name: 'Aylen Seco', email: 'aylen.seco@sancor.konecta.ar' },
    { name: 'Silvia Vega', email: 'silvia.vega@sancor.konecta.ar' },
    { name: 'Franco Alvarez', email: 'franco.alvarez@sancor.konecta.ar' },
    { name: 'Gastón Alvarez', email: 'gaston.alvarez@sancor.konecta.ar' },
    { name: 'Karen Aranda', email: 'karen.aranda@sancor.konecta.ar' },
    { name: 'Jeremías Britos', email: 'jeremias.britos@sancor.konecta.ar' },
    { name: 'Lautaro Brocal', email: 'lautaro.brocal@sancor.konecta.ar' },
    { name: 'Karen Chávez', email: 'karen.chavez@sancor.konecta.ar' },
    { name: 'Macarena Gómez', email: 'macarena.gomez@sancor.konecta.ar' },
    { name: 'Matías Heil', email: 'auca.heil@sancor.konecta.ar' },
    { name: 'Milagros Juncos', email: 'milagros.juncos@sancor.konecta.ar' },
    { name: 'Leonardo Macagno', email: 'leonardo.macagno@sancor.konecta.ar' },
    { name: 'Aldana Poccetti', email: 'aldana.poccetti@sancor.konecta.ar' },
    { name: 'Hanigian Veyga', email: 'maria.veyga@sancor.konecta.ar' },
    { name: 'Agustin Suarez', email: 'agustin.suarez@sancor.konecta.ar' },
    { name: 'Marcos Montenegro', email: 'marcos.montenegro@sancor.konecta.ar' },
    { name: 'Guillermo Banti', email: 'guillermo.banti@sancor.konecta.ar' },
    { name: 'Yohana López', email: 'yohana.lopez@sancor.konecta.ar' },
    { name: 'Tamara Vera', email: 'tamara.vera@sancor.konecta.ar' },
    { name: 'Anahí Bargas', email: 'anahi.bargas@sancor.konecta.ar' },
    { name: 'Agustina Castellano', email: 'agustina.castellano@sancor.konecta.ar' },
    { name: 'Alejo Dittler', email: 'alejo.dittler@sancor.konecta.ar' },
    { name: 'Santiago Auzqui', email: 'santiago.auzqui@sancor.konecta.ar' },
    { name: 'Marcos Liendo', email: 'marcos.liendo@sancor.konecta.ar' },
    { name: 'Atenea Nicolopolo', email: 'ateneas.nicolopolo@sancor.konecta.ar' },
    { name: 'Cecilia Benitez', email: 'cecilia.benitez@sancor.konecta.ar' },
    { name: 'Dina Espindola', email: 'deespindola@sancor.konecta.ar' },
    { name: 'Juan Martínez', email: 'juan.martinez@sancor.konecta.ar' },
    { name: 'Tamara Rios', email: 'tamara.rios@sancor.konecta.ar' },
    { name: 'Gimena Sánchez', email: 'gimena.sanchez@sancor.konecta.ar' },
    { name: 'Yanina Colman', email: 'yanina.colman@sancor.konecta.ar' },
    { name: 'Micaela Cabrera', email: 'micaela.cabrera@sancor.konecta.ar' },
    { name: 'Verónica Meza', email: 'veronica.meza@sancor.konecta.ar' },
    { name: 'Ramiro Romero', email: 'ramiro.romero@sancor.konecta.ar' },
    { name: 'Silvina Voelklí', email: 'silvina.voelkli@sancor.konecta.ar' },
    { name: 'Claudio Bernachea', email: 'claudio.bernachea@sancor.konecta.ar' },
    { name: 'Valeria Aibar', email: 'valeria.aibar@sancor.konecta.ar' },
    { name: 'Cecilia Solis', email: 'cecilia.solis@sancor.konecta.ar' },
    { name: 'María Theodorou', email: 'maria.theodorou@sancor.konecta.ar' },
    { name: 'Marina Vera', email: 'marina.vera@sancor.konecta.ar' },
    { name: 'Caren Silva', email: 'caren.silva@sancor.konecta.ar' },
    { name: 'Andrea Ocampo', email: 'andrea.ocampo@sancor.konecta.ar' },
    { name: 'Carla Cicirelli', email: 'carla.cicirelli@sancor.konecta.ar' },
    { name: 'Mariano Carrera', email: 'mariano.carrera@sancor.konecta.ar' },
    { name: 'Agustina Silva', email: 'agustina.silva@sancor.konecta.ar' },
    { name: 'Goya Sánchez', email: 'gustavo.sanchez@sancor.konecta.ar' },
    { name: 'Ivana Cárdena', email: 'ivana.cardena@sancor.konecta.ar' },
    { name: 'Rocío Gómez', email: 'rocio.gomez@sancor.konecta.ar' },
    { name: 'Milagros Miño', email: 'milagros.mino@sancor.konecta.ar' },
    { name: 'Antonela Romero', email: 'antonela.romero@sancor.konecta.ar' },
    { name: 'Evelyn Teruel', email: 'evelyn.teruel@sancor.konecta.ar' },
    { name: 'Karina Viana', email: 'karina.viana@sancor.konecta.ar' },
    { name: 'Antonia Ayala', email: 'antonia.ayala@sancor.konecta.ar' },
    { name: 'Emilce Biak', email: 'emilce.biak@sancor.konecta.ar' },
    { name: 'Paula Giménez', email: 'paula.gimenez@sancor.konecta.ar' },
    { name: 'Rocío González', email: 'rocio.gonzalez@sancor.konecta.ar' },
    { name: 'Leila López', email: 'leila.lopez@sancor.konecta.ar' },
    { name: 'María Maciel', email: 'mariagua.maciel@sancor.konecta.ar' },
    { name: 'Giuliana Maldonado', email: 'giuliana.maldonado@sancor.konecta.ar' },
    { name: 'Celeste Monzón', email: 'celeste.monzon@sancor.konecta.ar' },
    { name: 'Mariela Moreno', email: 'mariela.moreno@sancor.konecta.ar' },
    { name: 'Gisela Ramírez', email: 'gisela.ramirez@sancor.konecta.ar' },
    { name: 'Julián Oliva', email: 'julian.oliva@sancor.konecta.ar' },
    { name: 'Jessica Quiros', email: 'jessica.quiros@sancor.konecta.ar' },
    { name: 'María Amaya', email: 'maria.amaya@sancor.konecta.ar' },
    { name: 'Micaela Cabrera', email: 'micaeladv.cabrera@sancor.konecta.ar' },
    { name: 'Rosa Ludueña', email: 'rosa.luduena@sancor.konecta.ar' },
    { name: 'Florencia Luna', email: 'florencia.luna@sancor.konecta.ar' },
    { name: 'Andrés Mamani', email: 'andres.mamani@sancor.konecta.ar' },
    { name: 'María Martins', email: 'maria.martins@sancor.konecta.ar' },
    { name: 'Enzo Oviedo', email: 'enzo.oviedo@sancor.konecta.ar' },
    { name: 'Nicolás Andrades', email: 'nicolas.andrades@sancor.konecta.ar' },
    { name: 'María Cabanelas', email: 'maria.cabanelas@sancor.konecta.ar' },
    { name: 'Cecilia Carretero', email: 'cecilia.carretero@sancor.konecta.ar' },
    { name: 'Eliana Herrera', email: 'eliana.herrera@sancor.konecta.ar' },
    { name: 'Florencia Juarez', email: 'florencia.juarez@sancor.konecta.ar' },
    { name: 'Paola Morra', email: 'paola.morra@sancor.konecta.ar' },
    { name: 'Gabriela Ontiveros', email: 'gabriela.ontivero@sancor.konecta.ar' },
    { name: 'Nadia Peralta', email: 'nadia.peralta@sancor.konecta.ar' },
    { name: 'Mariela Tissera', email: 'mariela.tissera@sancor.konecta.ar' },
    { name: 'Yohana Garro Bustos', email: 'yohana.garro@sancro.konecta.sancor.ar' },
    { name: 'Nancy Aldeco', email: 'nancy.aldeco@sancor.konecta.ar' },
    { name: 'Héctor Charras', email: 'hector.charras@sancor.konecta.ar' },
    { name: 'Julian Gómez', email: 'julian.gomez@sancor.konecta.ar' }
  ];

  // Create users
  for (const userData of users) {
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (!existingUser) {
      await prisma.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          password: await bcrypt.hash('Sancor123', 10),
          role: 'user',
        },
      });
    }
  }

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
