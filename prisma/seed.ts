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

//   // Create teams and their members

//   await createTeam('Evelin Garay', 'eve-garay@sancor.konecta.ar', manager.id, [
//     { name: 'Alvarez Falco Franco Gabriel', email: 'franco.alvarez@sancor.konecta.ar' },
//     { name: 'Alvarez Gaston', email: 'gaston.alvarez@sancor.konecta.ar' },
//     { name: 'Aranda Karen Tamara', email: 'karen.aranda@sancor.konecta.ar' },
//     { name: 'BRITOS FLORES JEREMIAS ARIEL', email: 'jeremias.britos@sancor.konecta.ar' },
//     { name: 'BROCAL LAUTARO IVAN', email: 'lautaro.brocal@sancor.konecta.ar' },
//     { name: 'Chavez Karen Yamila', email: 'karen.chavez@sancor.konecta.ar' },
//     { name: 'Gomez Macarena', email: 'macarena.gomez@sancor.konecta.ar' },
//     { name: 'Heil Auca Matias', email: 'auca.heil@sancor.konecta.ar' },
//     { name: 'Iriarte Ismael Agustin Andres', email: 'ismael.iriarte@sancor.konecta.ar' },
//     { name: 'Juncos Milagros Anahi', email: 'milagros.juncos@sancor.konecta.ar' },
//     { name: 'MACAGNO LEONARDO NICOLAS', email: 'leonardo.macagno@sancor.konecta.ar' },
//     { name: 'Martinez Victoria', email: 'victoria.martinez@sancor.konecta.ar' },
//     { name: 'Mena Lerda Mauricio Emanuel', email: 'mauricio.mena@sancor.konecta.ar' },
//     { name: 'MONTENEGRO MARCOS JOEL', email: 'marcos.montenegro@sancor.konecta.ar' },
//     { name: 'POCCETTI ALDANA BELEN', email: 'aldana.poccetti@sancor.konecta.ar' },
//     { name: 'RODRIGUEZ ANGEL JAVIER', email: 'angel.rodriguez@sancor.konecta.ar' },
//     { name: 'SUAREZ PEDERNERA AGUSTIN EZEQUIEL', email: 'agustin.suarez@sancor.konecta.ar' },
//     { name: 'Veyga Hanigian Maria Abigail', email: 'maria.veyga@sancor.konecta.ar' },
//     { name: 'VIJARRA PABLO SEBASTIAN', email: 'pablo.vijarra@sancor.konecta.ar' },
//   ])

//   await createTeam('Carlos Eduardo Hayes', 'carlos.hayes@sancor.konecta.ar', manager.id, [
//     { name: 'Zaida Flavia Abregu', email: 'zaida.abregu@sancor.konecta.ar' },
//     { name: 'Maria Natasha Amaya', email: 'maria.amaya@sancor.konecta.ar' },
//     { name: 'Micaela Del Valle Cabrera', email: 'micaeladv.cabrera@sancor.konecta.ar' },
//     { name: 'MARIA LAURA CARRIZO TULA', email: 'maria.carrizo@sancor.konecta.ar' },
//     { name: 'BETTINA GABRIELA CERDA', email: 'bettina.cerda@sancor.konecta.ar' },
//     { name: 'Danna Deyse Cruz', email: 'danna.cruz@sancor.konecta.ar' },
//     { name: 'Veronica Sofia Guevara', email: 'veronica.guevara@sancor.konecta.ar' },
//     { name: 'Claudia Beatriz Guzman', email: 'claudia.guzman@sancor.konecta.ar' },
//     { name: 'Rosa Soledad Ludueña Rocha', email: 'rosa.luduena@sancor.konecta.ar' },
//     { name: 'Anabel Roxana Manozzo', email: 'anabel.manozzo@sancor.konecta.ar' },
//     { name: 'Maria Julia Martins', email: 'maria.martins@sancor.konecta.ar' },
//     { name: 'Romina Mariel Ochoa', email: 'romina.ochoa@sancor.konecta.ar' },
//     { name: 'Enzo David Oviedo', email: 'enzo.oviedo@sancor.konecta.ar' },
//     { name: 'Aylen Loreley Del Carmen Seco', email: 'aylen.seco@sancor.konecta.ar' },
//     { name: 'Lucrecia Belen Uran', email: 'lucrecia.uran@sancor.konecta.ar' },
//     { name: 'Silvia Soledad Vega', email: 'silvia.vega@sancor.konecta.ar' },
//     { name: 'Tomas Clavaguera', email: 'tomas.clavaguera@sancor.konecta.ar' },
//     { name: 'Santiago Eduardo Auzqui Chalhub', email: 'santiago.auzqui@sancor.konecta.ar' },
//   ])

//   await createTeam('CONTRERAS EMILCE JOHANNA', 'emilce.contreras@sancor.konecta.ar', manager.id, [
//     { name: 'LIENDO MARCOS EZEQUIEL', email: 'marcos.liendo@sancor.konecta.ar' },
//     { name: 'OTTONELLO ANABELLIA', email: 'anabellia.ottonello@sancor.konecta.ar' },
//     { name: 'ALVAREZ ANALIA MACARENA', email: 'analia.alvarez@sancor.konecta.ar' },
//     { name: 'ANDRADE ANTONELLA VERONICA', email: 'antonella.andrade@sancor.konecta.ar' },
//     { name: 'CLAVAGUERA TOMAS', email: 'tomas.clavaguera@sancor.konecta.ar' },
//     { name: 'MOLINA CLARA MARISA', email: 'clara.molina@sancor.konecta.ar' },
//     { name: 'ALVAREZ IGNACIO', email: 'ignacio.alvarez@sancor.konecta.ar' },
//     { name: 'GIGENA RISTA MATEO VALENTIN', email: 'mateo.gigena@sancor.konecta.ar' },
//     { name: 'ANZIL GARCIA SOFIA ANABELA', email: 'sofia.anzil@sancor.konecta.ar' },
//     { name: 'DE LA MORA MALEN', email: 'malen.delamora@sancor.konecta.ar' },
//     { name: 'ROMERO MARIANA BELEN', email: 'mariana.romero@sancor.konecta.ar' },
//     { name: 'HIGA FLORENCIA DENISE', email: 'fhigaflorencia.higa@sancor.konecta.ar' },
//     { name: 'JALILE GONZALO FEDERICO', email: 'gonzalo.jalile@sancor.konecta.ar' },
//     { name: 'MORON PRADO HEYNER MIGUEL', email: 'heyner.moron@sancor.konecta.ar' },
//     { name: 'OTERO CARRERAS GRISEL MAGALI', email: 'grisel.otero@sancor.konecta.ar' },
//     { name: 'SCHILMAN IVÁN MARCELO', email: 'ivan.schilman@sancor.konecta.ar' },
//     { name: 'ADELL MAIRA PAOLA', email: 'maira.adell@sancor.konecta.ar' },
//   ])

//   await createTeam('MARTINEZ LORENA MAGALI', 'lorena.martinez@sancor.konecta.ar', manager.id, [
//     { name: 'FERNANDEZ AYELEN GABRIELA', email: 'ayelen.fernandez@sancor.konecta.ar' },
//     { name: 'REYES MARIA CONSTANZA', email: 'maria.reyes@sancor.konecta.ar' },
//     { name: 'GOMEZ DANIELA ISABEL', email: 'daniela.gomez@sancor.konecta.ar' },
//     { name: 'SILVA AGUSTINA AYELEN', email: 'agustina.silva@sancor.konecta.ar' },
//     { name: 'BATTIATO RIVAS BIANCA CAMILA', email: 'bianca.battiato@sancor.konecta.ar' },
//     { name: 'LOPEZ YOHANA ANABEL', email: 'yohana.lopez@sancor.konecta.ar' },
//     { name: 'BANTI GUILLERMO EMANUEL', email: 'guillermo.banti@sancor.konecta.ar' },
//     { name: 'NICOLOPOLO ATENEAS ALEJANDRA', email: 'ateneas.nicolopolo@sancor.konecta.ar' },
//     { name: 'PRIETO SELENE AGOSTINA', email: 'selene.prieto@sancor.konecta.ar' },
//     { name: 'MONTENEGRO YOHANA VANESSA RUTH', email: 'yohana.montenegro@sancor.konecta.ar' },
//     { name: 'CARRERA MARIANO', email: 'mariano.carrera@sancor.konecta.ar' },
//     { name: 'GONZALEZ FABIANA AGUSTINA', email: 'fabiana.gonzalez@sancor.konecta.ar' },
//     { name: 'CASAS ANTONELLA', email: 'antonella.casas@sancor.konecta.ar' },
//     { name: 'GONGORA MELINA DEL VALLE', email: 'melina.gongora@sancor.konecta.ar' },
//     { name: 'PALACIOS MAILEN VICTORIA', email: 'mailen.palacios@sancor.konecta.ar' },
//     { name: 'ESPER FIGUEROA JOSE', email: 'jose.esper@sancor.konecta.ar' },
//     { name: 'ARGAÑARAZ BRAIAN ALEXIS', email: 'braian.arganaraz@sancor.konecta.ar' },
//     { name: 'DUTTO MIGUEL ANGEL', email: 'miguel.dutto@sancor.konecta.ar' },
//   ])

//   await createTeam('MARTINEZ ELIANA ANTONELLA', 'eliana.martinez@sancor.konecta.ar', manager.id, [
//     { name: 'GOMEZ DAIANA AILEN', email: 'daiana.gomez@sancor.konecta.ar' },
//     { name: 'OLIVA JULIAN ANTONIO', email: 'julian.oliva@sancor.konecta.ar' },
//     { name: 'AIBAR VALERIA ESTHER', email: 'valeria.aibar@sancor.konecta.ar' },
//     { name: 'DIAZ CANTEROS OSCAR EMMANUEL', email: 'oscar.diaz@sancor.konecta.ar' },
//     { name: 'SOLIS CECILIA ANDREA', email: 'cecilia.solis@sancor.konecta.ar' },
//     { name: 'CARDENA BAEZ IVANA SABRINA', email: 'ivana.cardena@sancor.konecta.ar' },
//     { name: 'MELGAREJO SABRINA MARIA LUZ', email: 'sabrina.melgarejo@sancor.konecta.ar' },
//     { name: 'THEODOROU MARIA DE LOS ANGELES', email: 'maria.theodorou@sancor.konecta.ar' },
//     { name: 'VARGAS SEBASTIAN ANTONIO', email: 'sebastian.vargas@sancor.konecta.ar' },
//     { name: 'VILLALBA RAMIREZ MARIA JOSE', email: 'maria.villalba@sancor.konecta.ar' },
//     { name: 'GOMEZ ROCIO VERONICA', email: 'rocio.gomez@sancor.konecta.ar' },
//     { name: 'ROMERO ANTONELA CLAUDIA MICAELA', email: 'antonela.romero@sancor.konecta.ar' },
//     { name: 'SENGHER CINTIA FERNANDA', email: 'cintia.sengher@sancor.konecta.ar' },
//     { name: 'TERUEL EVELYN ANABELLA', email: 'evelyn.teruel@sancor.konecta.ar' },
//     { name: 'VERA SANCHEZ MARINA GABRIELA', email: 'marina.vera@sancor.konecta.ar' },
//     { name: 'BARRIOS SEBASTIAN EDGARDO', email: 'sebastian.barrios@sancor.konecta.ar' },
//     { name: 'VIANA KARINA ELISABETH', email: 'karina.viana@sancor.konecta.ar' },
//     { name: 'MIÑO MILAGROS ZENAIDA SILVIA', email: 'milagros.mino@sancor.konecta.ar' },
//   ])

//   await createTeam('GUTIERREZ LAURA ITATI', 'laura.gutierrez@sancor.konecta.ar', manager.id, [
//     { name: 'BENITEZ LUDMILA PAMELA', email: 'ludmila.benitez@sancor.konecta.ar' },
//     { name: 'MARTINEZ MARCOS DANIEL', email: 'marcos.martinez@sancor.konecta.ar' },
//     { name: 'CABRERA MICAELA AYLEN', email: 'micaela.cabrera@sancor.konecta.ar' },
//     { name: 'CICIRELLI CARLA RITA ANTONELLA', email: 'carla.cicirelli@sancor.konecta.ar' },
//     { name: 'ESPINDOLA DINA ELIZABETH', email: 'deespindola@sancor.konecta.ar' },
//     { name: 'BENITEZ CECILIA GISELLA', email: 'cecilia.benitez@sancor.konecta.ar' },
//     { name: 'MEZA VERONICA CLAUDIA', email: 'veronica.meza@sancor.konecta.ar' },
//     { name: 'MIÑO LARA ERCILIA', email: 'lara.mino@sancor.konecta.ar' },
//     { name: 'RIOS TAMARA MAGALI', email: 'tamara.rios@sancor.konecta.ar' },
//     { name: 'SANCHEZ GIMENA BEATRIZ', email: 'gimena.sanchez@sancor.konecta.ar' },
//     { name: 'BERNACHEA CLAUDIO ANDRES', email: 'claudio.bernachea@sancor.konecta.ar' },
//     { name: 'COLMAN YANINA LORENA', email: 'yanina.colman@sancor.konecta.ar' },
//     { name: 'MARTINEZ JUAN ESTEBAN', email: 'juan.martinez@sancor.konecta.ar' },
//     { name: 'VOELKLI SILVINA MERCEDES', email: 'silvina.voelkli@sancor.konecta.ar' },
//     { name: 'MUÑOZ MARTA ELVIRA', email: 'marta.munoz@sancor.konecta.ar' },
//     { name: 'ROMERO RAMIRO OMAR', email: 'ramiro.romero@sancor.konecta.ar' },
//     { name: 'PARRAS MARIA SOLEDAD', email: 'maria.parras@sancor.konecta.ar' },
//     { name: 'SANCHEZ GOYA GUSTAVO ADOLFO', email: 'gustavo.sanchez@sancor.konecta.ar' },
//   ])

//   await createTeam('ROSSETTI MARIA ELISA', 'maria.rossetti@sancor.konecta.ar', manager.id, [
//     { name: 'JUAREZ CESTARE FLORENCIA ROCIO', email: 'florencia.juarez@sancor.konecta.ar' },
//     { name: 'GOMEZ MANSILLA JULIAN', email: 'julian.gomez@sancor.konecta.ar' },
//     { name: 'ROMAN CASADESUS TOMAS JAVIER', email: 'tomas.roman@sancor.konecta.ar' },
//     { name: 'SANDOVAL MARIA DEL ROSARIO', email: 'maria.sandoval@sancor.konecta.ar' },
//     { name: 'CARRETERO CECILIA LAURA', email: 'cecilia.carretero@sancor.konecta.ar' },
//     { name: 'MORRA PAOLA ALEJANDRA', email: 'paola.morra@sancor.konecta.ar' },
//     { name: 'ONTIVERO GABRIELA BEATRIZ', email: 'gabriela.ontivero@sancor.konecta.ar' },
//     { name: 'PERALTA NADIA SOLEDAD', email: 'nadia.peralta@sancor.konecta.ar' },
//     { name: 'CANO CELIA VANESA', email: 'celia.cano@sancor.konecta.ar' },
//     { name: 'FIUK SOFIA VICTORIA', email: 'sofia.fiuk@sancor.konecta.ar' },
//     { name: 'ARCE EUGENIA SOLEDAD', email: 'eugenia.arce@sancor.konecta.ar' },
//     { name: 'ALDECO CORVALAN NANCY ANTONELA', email: 'nancy.aldeco@sancor.konecta.ar' },
//     { name: 'CHARRAS HECTOR LEANDRO', email: 'hector.charras@sancor.konecta.ar' },
//     { name: 'GARRO BUSTOS YOHANA ALEXANDRA', email: 'yohana.garro@sancor.konecta.ar' },
//     { name: 'HERRERA ELIANA ABIGAIL', email: 'eliana.herrera@sancor.konecta.ar' },
//     { name: 'TISSERA MARIELA', email: 'mariela.tissera@sancor.konecta.ar' },
//     { name: 'ANDRADES NICOLAS LEONARDO', email: 'nicolas.andrades@sancor.konecta.ar' },
//     { name: 'CABANELAS MARIA ALEJANDRA', email: 'maria.cabanelas@sancor.konecta.ar' },
//   ])

//   await createTeam('GAMBARTE MARIANA PAMELA', 'mariana.gambarte@sancor.konecta.ar', manager.id, [
//     { name: 'AUZQUI CHALHUB SANTIAGO EDUARDO', email: 'santiago.auzqui@sancor.konecta.ar' },
//     { name: 'BAEZ JOSE FACUNDO', email: 'jose.baez@sancor.konecta.ar' },
//     { name: 'ALTAMIRANO LEANDRO GASTON', email: 'leandro.altamirano@sancor.konecta.ar' },
//     { name: 'ALVELDA CANDELA EDITH', email: 'candela.alvelda@sancor.konecta.ar' },
//     { name: 'BARGAS ANAHI SABRINA', email: 'anahi.bargas@sancor.konecta.ar' },
//     { name: 'CASTELLANO AGUSTINA BELEN', email: 'agustina.castellano@sancor.konecta.ar' },
//     { name: 'CRACCO BIANCA DE FATIMA', email: 'bianca.cracco@sancor.konecta.ar' },
//     { name: 'DITTLER ALEJO', email: 'alejo.dittler@sancor.konecta.ar' },
//     { name: 'FALAVIGNA ROMERO MARCO PABLO', email: 'marco.falavigna@sancor.konecta.ar' },
//     { name: 'FARIÑA JIMENA AILIN', email: 'jimena.farina@sancor.konecta.ar' },
//     { name: 'GALVALIZ ALEJANDRO GABRIEL', email: 'alejandro.galvaliz@sancor.konecta.ar' },
//     { name: 'JUAREZ SERGIO MANUEL', email: 'sergio.juarez@sancor.konecta.ar' },
//     { name: 'LUCERO FLORENCIA', email: 'florencia.lucero@sancor.konecta.ar' },
//     { name: 'MURUA ROCIO ALEJANDRA', email: 'rocio.murua@sancor.konecta.ar' },
//     { name: 'PEREYRA LUCAS OSCAR', email: 'lucas.pereyra@sancor.konecta.ar' },
//     { name: 'SEGOVIA CARDOZO ANA GABRIELA', email: 'ana.segovia@sancor.konecta.ar' },
//     { name: 'VILLARROEL AGUSTIN TOMAS', email: 'agustin.villarroel@sancor.konecta.ar' },
//     { name: 'RIOS PONCE CONSTANZA SOLEDAD', email: 'constanza.rios@sancor.konecta.ar' },
//   ])

//   await createTeam('QUIJIJE HIDALGO YAINETH ANDREINA', 'yaineth.quijije@sancor.konecta.ar', manager.id, [
//     { name: 'GONZALEZ ROCIO ARACELI', email: 'rocio.gonzalez@sancor.konecta.ar' },
//     { name: 'LOPEZ LEILA ROCIO', email: 'leila.lopez@sancor.konecta.ar' },
//     { name: 'SILVA CAREN PALOMA', email: 'caren.silva@sancor.konecta.ar' },
//     { name: 'JARA SOL GUADALUPE', email: 'sol.jara@sancor.konecta.ar' },
//     { name: 'AYALA LUCILA ANTONELLA', email: 'lucila.ayala@sancor.konecta.ar' },
//     { name: 'BAZZA FRANCO SANTIAGO', email: 'franco.bazza@sancor.konecta.ar' },
//     { name: 'CANTERO HECTOR EZEQUIEL', email: 'hector.cantero@sancor.konecta.ar' },
//     { name: 'DIAZ VALLEJOS JORGE RUBEN', email: 'jorge.diaz@sancor.konecta.ar' },
//     { name: 'GONZALEZ MATIAS ESTEBAN DAVID', email: 'matias.gonzalez@sancor.konecta.ar' },
//     { name: 'MONZON PAREDES CELESTE MARLEN', email: 'celeste.monzon@sancor.konecta.ar' },
//     { name: 'VARGAS LOURDES MICAELA', email: 'lourdes.vargas@sancor.konecta.ar' },
//     { name: 'GOMEZ ANGELES JOANA', email: 'angeles.gomez@sancor.konecta.ar' },
//     { name: 'AYALA ANTONIA SOLEDAD', email: 'antonia.ayala@sancor.konecta.ar' },
//     { name: 'MACIEL GONZALEZ MARIA GUADALUPE', email: 'mariagua.maciel@sancor.konecta.ar' },
//     { name: 'MORENO MARIELA SOLEDAD', email: 'mariela.moreno@sancor.konecta.ar' },
//     { name: 'QUIROS JESSICA ESTEFANIA', email: 'jessica.quiros@sancor.konecta.ar' },
//     { name: 'RAMIREZ GISELA VERONICA', email: 'gisela.ramirez@sancor.konecta.ar' },
//     { name: 'BIAK EMILCE NATALIA', email: 'emilce.biak@sancor.konecta.ar' },
//     { name: 'GIMENEZ PAULA MARCELA', email: 'paula.gimenez@sancor.konecta.ar' },
//     { name: 'MALDONADO GIULIANA GEORGINA', email: 'giuliana.maldonado@sancor.konecta.ar' },
//   ])

//   console.log('Seeding completed successfully')
// }

// async function createTeam(leaderName: string, leaderEmail: string, managerId: number, teamMembers: { name: string; email: string }[]) {
//   let teamLeader = await prisma.user.findUnique({
//     where: { email: leaderEmail },
//   })

//   if (!teamLeader) {
//     teamLeader = await prisma.user.create({
//       data: {
//         name: leaderName,
//         email: leaderEmail,
//         password: await bcrypt.hash(`${leaderName.split(' ')[0].toLowerCase()}123`, 10),
//         role: 'team_leader',
//       },
//     })
//   }

//   let team = await prisma.team.findFirst({
//     where: { name: `Team ${leaderName.split(' ')[0]}` },
//   })

//   if (!team) {
//     team = await prisma.team.create({
//       data: {
//         name: `Team ${leaderName.split(' ')[0]}`,
//         manager: { connect: { id: managerId } },
//         teamLeader: { connect: { id: teamLeader.id } },
//       },
//     })
//   }

//   for (const userData of teamMembers) {
//     const existingUser = await prisma.user.findUnique({
//       where: { email: userData.email },
//     })

//     if (!existingUser) {
//       const names = userData.name.split(' ')
//       const lastName = names[0].toLowerCase()
//       const firstName = names[names.length - 1].toLowerCase()
//       const password = `${firstName}${lastName}123`

//       await prisma.user.create({
//         data: {
//           name: userData.name,
//           email: userData.email,
//           password: await bcrypt.hash(password, 10),
//           role: 'user',
//           team: { connect: { id: team.id } },
//         },
//       })
//     }
//   }
// }
}
main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
