import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

type NewsEntry = {
  name: string;
  url: string;
  date: Date;
}

type NewsEntriesByMonth = {
  december: NewsEntry[];
  november: NewsEntry[];
  october: NewsEntry[];
  september: NewsEntry[];
  august: NewsEntry[];
  july: NewsEntry[];
  june: NewsEntry[];
  may: NewsEntry[];
  april: NewsEntry[];
  march: NewsEntry[];
  february: NewsEntry[];
  january: NewsEntry[];
}

async function main() {
    const newsEntries: NewsEntriesByMonth = {
    december: [
      {
        name: "Incidente sistémico en Laboratorios - Servicio afectado",
        url: "/novedades/Incidente-sistemico-en-Laboratorios-Servicio-afectado.pdf",
        date: new Date('2024-12-01')
      },
      {
        name: "Cambio de Grilla para asociados/as de stock",
        url: "/novedades/Cambio-de-Grilla-para-asociados-as-de-stock.pdf",
        date: new Date('2024-12-01')
      },
      {
        name: "Aportes y Contribuciones: Base imponible máxima y mínima - 12-2024",
        url: "/novedades/Aportes-y-Contribuciones-Base-imponible-maxima-y-minima-12-2024.pdf",
        date: new Date('2024-12-01')
      },
      {
        name: "Actualización del proceso de Autorizaciones con asistente",
        url: "/novedades/Actualizacion-del-proceso-de-Autorizaciones-con-asistente.pdf",
        date: new Date('2024-12-01')
      },
      {
        name: "Acceso a medicamentos de compra en farmacia: baja de vademécum",
        url: "/novedades/Acceso-a-medicamentos-de-compra-en-farmacia-baja-de-vademecum.pdf",
        date: new Date('2024-12-01')
      },
      {
        name: "Mista Seguros: Campaña de Actualización de datos personales de clientes",
        url: "/novedades/Mista-Seguros-Campana-de-Actualizacion-de-datos-personales-de-clientes.pdf",
        date: new Date('2024-12-01')
      },
      {
        name: "Inscripción AMSS como Agente de Seguro de Salud",
        url: "/novedades/Inscripcion-AMSS-como-Agente-de-Seguro-de-Salud.pdf",
        date: new Date('2024-12-01')
      },
      {
        name: "Eliminación de formulario Nro 60",
        url: "/novedades/Eliminacion-de-formulario-Nro-60.pdf",
        date: new Date('2024-12-01')
      },
      {
        name: "Aumento de valores de prestaciones de Discapacidad - Diciembre",
        url: "/novedades/Aumento-de-valores-de-prestaciones-de-Discapacidad-Diciembre.pdf",
        date: new Date('2024-12-01')
      }
    ],
    november: [
      {
        name: "Cambios en la cobertura de Vacunas del Calendario Nacional",
        url: "/novedades/Cambios-en-la-cobertura-de-Vacunas-del-Calendario-Nacional.pdf",
        date: new Date('2024-11-01')
      },
      {
        name: "Implementación Autogestor de Prestadores para Internaciones",
        url: "/novedades/Implementacion-Autogestor-de-Prestadores-para-Internaciones.pdf",
        date: new Date('2024-11-01')
      },
      {
        name: "Refuerzo: Gestión de Reintegros",
        url: "/novedades/Refuerzo-Gestion-de-Reintegros.pdf",
        date: new Date('2024-11-01')
      },
      {
        name: "Coseguros duplicados en liquidación Noviembre",
        url: "/novedades/Coseguros-duplicados-en-liquidacion-Noviembre.pdf",
        date: new Date('2024-11-01')
      },
      {
        name: "Manual de Discapacidad 2025",
        url: "/novedades/Manual-de-Discapacidad-2025.pdf",
        date: new Date('2024-11-01')
      },
      {
        name: "Incorporación de Sanatorio Boratti como prestador",
        url: "/novedades/Incorporacion-de-Sanatorio-Boratti-como-prestador.pdf",
        date: new Date('2024-11-01')
      },
      {
        name: "Derivaciones en Salesforce",
        url: "/novedades/Derivaciones-en-Salesforce.pdf",
        date: new Date('2024-11-01')
      },
      {
        name: "AAA 350303 - Autogestión Programa Materno Infantil",
        url: "/novedades/AAA-350303-Autogestion-Programa-Materno-Infantil.pdf",
        date: new Date('2024-11-01')
      },
      {
        name: "Mejoras en cobertura para el plan 800",
        url: "/novedades/Mejoras-en-cobertura-para-el-plan-800.docx.pdf",
        date: new Date('2024-11-01')
      },
      {
        name: "Carga de diagnóstico en formulario de autorización",
        url: "/novedades/Carga-de-diagnostico-en-formulario-de-autorizacion.pdf",
        date: new Date('2024-11-01')
      },
      {
        name: "Inhabilitación Asociados SanCor CUL",
        url: "/novedades/Inhabilitacion-Asociados-SanCor-CUL.pdf",
        date: new Date('2024-11-01')
      },
      {
        name: "Aumento de aportes en los servicios de salud Diciembre2024",
        url: "/novedades/Aumento-de-aportes-en-los-servicios-de-salud-Diciembre2024.pdf",
        date: new Date('2024-11-01')
      },
      {
        name: "Refuerzo - Alta de integrante con DNI en trámite",
        url: "/novedades/Refuerzo-Alta-de-integrante-con-DNI-en-tramite.pdf",
        date: new Date('2024-11-01')
      }
    ],
    october: [
      {
        name: "Nuevo Convenio OSPEGAP - SanCor Salud",
        url: "/novedades/Nuevo-Convenio-OSPEGAP-SanCor-Salud.pdf",
        date: new Date('2024-10-01')
      },
      {
        name: "Ajustes por coseguros no liquidados",
        url: "/novedades/Ajustes-por-coseguros-no-liquidados.pdf",
        date: new Date('2024-10-01')
      },
      {
        name: "Asesoramiento de deuda para Asociados/as dados de baja",
        url: "/novedades/Asesoramiento-de-deuda-para-Asociados-as-dados-de-baja.pdf",
        date: new Date('2024-10-01')
      },
      {
        name: "AAA-030103 Asesoramiento de deuda a asociados dados de baja",
        url: "/novedades/AAA-030103-Asesoramiento-de-deuda-a-asociados-dados-de-baja.pdf",
        date: new Date('2024-10-01')
      },
      {
        name: "Fluir: Calendario débitos TC-CBU y Estados débitos CBU",
        url: "/novedades/Fluir-Calendario-debitos-TC-CBU-y-Estados-debitos-CBU.pdf",
        date: new Date('2024-10-01')
      },
      {
        name: "Ajustes en liquidación a asociados/as - Convenio OSPEGAP Cuyo",
        url: "/novedades/Ajustes-en-liquidacion-a-asociados-as-Convenio-OSPEGAP-Cuyo.pdf",
        date: new Date('2024-10-01')
      },
      {
        name: "Aumento de aportes en los servicios de salud Noviembre 2024",
        url: "/novedades/Aumento-de-aportes-en-los-servicios-de-salud-Noviembre-2024.pdf",
        date: new Date('2024-10-01')
      },
      {
        name: "Cambios en las condiciones de reintegro por cobro de plus",
        url: "/novedades/Cambios-en-las-condiciones-de-reintegro-por-cobro-de-plus.pdf",
        date: new Date('2024-10-01')
      },
      {
        name: "Reintegro por corte de servicio",
        url: "/novedades/Reintegro-por-corte-de-servicio.pdf",
        date: new Date('2024-10-01')
      },
      {
        name: "Novedades del Cotizador en Fluir",
        url: "/novedades/Novedades-del-Cotizador-en-Fluir.pdf",
        date: new Date('2024-10-01')
      }
    ],
    september: [
      {
        name: "Modificaciones en el cotizador de Fluir",
        url: "/novedades/Modificaciones-en-el-cotizador-de-Fluir.pdf",
        date: new Date('2024-09-01')
      },
      {
        name: "Baja de convenios Linea Empresa",
        url: "/novedades/Baja-de-convenios-Linea-Empresa.pdf",
        date: new Date('2024-09-01')
      },
      {
        name: "Salesforce: Cambios en el asistente por asesoramiento cobertura de Plan",
        url: "/novedades/Salesforce-Cambios-en-el-asistente-por-asesoramiento-cobertura-de-Plan.pdf",
        date: new Date('2024-09-01')
      },
      {
        name: "Aportes en los servicios de salud septiembre 2024",
        url: "/novedades/Aportes-en-los-servicios-de-salud-septiembre-2024.pdf",
        date: new Date('2024-09-01')
      },
      {
        name: "Estimación de aportes de monotributo en la liquidación de Septiembre",
        url: "/novedades/Estimacion-de-aportes-de-monotributo-en-la-liquidacion-de-Septiembre.pdf",
        date: new Date('2024-09-01')
      },
      {
        name: "Aumento de valores de prestaciones de Discapacidad - Agosto",
        url: "/novedades/Aumento-de-valores-de-prestaciones-de-Discapacidad-Agosto.docx.pdf",
        date: new Date('2024-09-01')
      },
      {
        name: "Rechazos por validación on line",
        url: "/novedades/Rechazos-por-validacion-on-line.pdf",
        date: new Date('2024-09-01')
      }
    ],
    august: [
      {
        name: "Ajuste liquidación agosto asociados/as EX CONVENIO FEMA",
        url: "/novedades/Ajuste-liquidacion-agosto-asociados-as-EX-CONVENIO-FEMA.pdf",
        date: new Date('2024-08-01')
      },
      {
        name: "Liquidación agosto: Recepción de dos facturas para determinados/as asociados/as",
        url: "/novedades/Liquidacion-agosto-Recepcion-dos-facturas.pdf",
        date: new Date('2024-08-01')
      },
      {
        name: "Grupo de afinidad 556 - HIJOS DE OSME: Cambios en las condiciones para los/as asociados/as",
        url: "/novedades/Grupo-de-afinidad-556-HIJOS-DE-OSME-Cambios.pdf",
        date: new Date('2024-08-01')
      },
      {
        name: "Cambio en el porcentaje de cobertura en medicamentos para asociados/as de AMBA",
        url: "/novedades/Cambio-porcentaje-cobertura-medicamentos-AMBA.pdf",
        date: new Date('2024-08-01')
      },
      {
        name: "Nuevos Prestadores con token de seguridad en prestaciones de ambulatorio",
        url: "/novedades/Nuevos-Prestadores-token-seguridad-ambulatorio.pdf",
        date: new Date('2024-08-01')
      }
    ],
    july: [
      {
        name: "Novedades en la devolución del aumento de las prepagas",
        url: "/novedades/Novedades-devolucion-aumento-prepagas.pdf",
        date: new Date('2024-07-01')
      },
      {
        name: "Visualización y vencimiento de facturas del periodo julio 2024",
        url: "/novedades/Visualizacion-vencimiento-facturas-julio-2024.pdf",
        date: new Date('2024-07-01')
      },
      {
        name: "Santa Fe: Dispensa de medicamentos con receta electrónica",
        url: "/novedades/Santa-Fe-Dispensa-medicamentos-receta-electronica.pdf",
        date: new Date('2024-07-01')
      },
      {
        name: "Cambios en las condiciones de reintegro por cobro de plus",
        url: "/novedades/Cambios-condiciones-reintegro-cobro-plus.pdf",
        date: new Date('2024-07-01')
      },
      {
        name: "Consentimiento de contacto por Whatsapp",
        url: "/novedades/Consentimiento-contacto-Whatsapp.pdf",
        date: new Date('2024-07-01')
      }
    ],
    june: [
      {
        name: "Novedades sobre la implementación del token en Farmacias",
        url: "/novedades/Novedades-implementacion-token-Farmacias.pdf",
        date: new Date('2024-06-01')
      },
      {
        name: "Cobranzas: Integración Sistemas Colega y Salesforce",
        url: "/novedades/Cobranzas-Integracion-Sistemas-Colega-Salesforce.pdf",
        date: new Date('2024-06-01')
      },
      {
        name: "Nuevas zonas de comercialización Plan F800 Digital Flex",
        url: "/novedades/Nuevas-zonas-comercializacion-Plan-F800-Digital-Flex.pdf",
        date: new Date('2024-06-01')
      },
        {
          name: "Información sobre vacuna VSR (Virus Sincicial Respiratorio)",
          url: "/novedades/Informacion-vacuna-VSR.pdf",
          date: new Date('2024-06-01')
        },
        {
          name: "Baja Convenio AMOT",
          url: "/novedades/Baja-Convenio-AMOT.pdf",
          date: new Date('2024-06-01')
        },
        {
          name: "Novedades sobre el proceso de Autorizaciones",
          url: "/novedades/Novedades-proceso-Autorizaciones.pdf",
          date: new Date('2024-06-01')
        },
        {
          name: "Incremento de valores de coseguros Psiqué",
          url: "/novedades/Incremento-valores-coseguros-Psique.pdf",
          date: new Date('2024-06-01')
        },
        {
          name: "Aumento prepagas: Novedades sobre la devolución",
          url: "/novedades/Aumento-prepagas-Novedades-devolucion.pdf",
          date: new Date('2024-06-01')
        }
      ],
      may: [
        {
          name: "Aportes en los servicios de salud Mayo 2024",
          url: "/novedades/Aportes-servicios-salud-Mayo-2024.pdf",
          date: new Date('2024-05-01')
        },
        {
          name: "Emisión de facturas Mayo 2024",
          url: "/novedades/Emision-facturas-Mayo-2024.pdf",
          date: new Date('2024-05-01')
        },
        {
          name: "Novedades del Cotizador en Fluir",
          url: "/novedades/Novedades-Cotizador-Fluir.pdf",
          date: new Date('2024-05-01')
        },
        {
          name: "Novedades en la gestión de Medicamentos de Discapacidad",
          url: "/novedades/Novedades-gestion-Medicamentos-Discapacidad.pdf",
          date: new Date('2024-05-01')
        },
        {
          name: "Nueva política para autorizaciones de sesiones de kinesiología",
          url: "/novedades/Nueva-politica-autorizaciones-kinesiologia.pdf",
          date: new Date('2024-05-01')
        },
        {
          name: "Prestador/a solicita formulario de autorización por prestaciones de validación on line",
          url: "/novedades/Prestador-solicita-formulario-autorizacion.pdf",
          date: new Date('2024-05-01')
        }
      ],
      april: [
        {
          name: "Extensión de días de gracia para el pago de la deuda",
          url: "/novedades/Extension-dias-gracia-pago-deuda.pdf",
          date: new Date('2024-04-01')
        },
        {
          name: "Quita de Bonificaciones: Grupo Afinidad 544",
          url: "/novedades/Quita-Bonificaciones-Grupo-Afinidad-544.pdf",
          date: new Date('2024-04-01')
        },
        {
          name: "Actualización: Campaña de Vacunación Antigripal 2024",
          url: "/novedades/Actualizacion-Campana-Vacunacion-Antigripal-2024.pdf",
          date: new Date('2024-04-01')
        },
        {
          name: "Nuevos valores de Coseguros, Copagos y Reintegros",
          url: "/novedades/Nuevos-valores-Coseguros-Copagos-Reintegros.pdf",
          date: new Date('2024-04-01')
        },
        {
          name: "Pérdida de beneficios - Quita de Grupo de Afinidad/Grilla",
          url: "/novedades/Perdida-beneficios-Quita-Grupo-Afinidad-Grilla.pdf",
          date: new Date('2024-04-01')
        }
      ],
      march: [
        {
          name: "Conceptos de la liquidación con aumentos de Marzo",
          url: "/novedades/Conceptos-liquidacion-aumentos-Marzo.pdf",
          date: new Date('2024-03-01')
        },
        {
          name: "Cuentas excluidas de la visualización de la factura de Marzo",
          url: "/novedades/Cuentas-excluidas-visualizacion-factura-Marzo.pdf",
          date: new Date('2024-03-01')
        },
        {
          name: "Línea Empresa: Vacuna tetravalente contra el Dengue",
          url: "/novedades/Linea-Empresa-Vacuna-tetravalente-Dengue.pdf",
          date: new Date('2024-03-01')
        },
        {
          name: "Web Línea Empresa: Formas de pago",
          url: "/novedades/Web-Linea-Empresa-Formas-pago.pdf",
          date: new Date('2024-03-01')
        },
        {
          name: "Hisopado Covid19: Verificación de cobertura",
          url: "/novedades/Hisopado-Covid19-Verificacion-cobertura.pdf",
          date: new Date('2024-03-01')
        }
      ],
      february: [
        {
          name: "Nuevo producto de Mista Seguros: 'Más Salud'",
          url: "/novedades/Nuevo-producto-Mista-Seguros-Mas-Salud.pdf",
          date: new Date('2024-02-01')
        },
        {
          name: "Visualización de facturas del periodo febrero 2024 - Solucionado",
          url: "/novedades/Visualizacion-facturas-febrero-2024-Solucionado.pdf",
          date: new Date('2024-02-01')
        },
        {
          name: "Reintegros por ortodoncias: eliminación de formulario 8",
          url: "/novedades/Reintegros-ortodoncias-eliminacion-formulario-8.docx.pdf",
          date: new Date('2024-02-01')
        },
        {
          name: "Eliminación validador de odontología",
          url: "/novedades/Eliminacion-validador-odontologia.pdf",
          date: new Date('2024-02-01')
        }
      ],
      january: [
        {
          name: "Aumento retroactivo correspondiente a enero/2024 segmentado",
          url: "/novedades/Aumento-retroactivo-enero-2024-segmentado.pdf",
          date: new Date('2024-01-01')
        },
        {
          name: "Nuevos valores de aportes de monotributo a obras sociales por categoría",
          url: "/novedades/Nuevos-valores-aportes-monotributo-obras-sociales.pdf",
          date: new Date('2024-01-01')
        }
      ]
    } as const;

    // Create entries for each month
    for (const month of Object.keys(newsEntries) as Array<keyof NewsEntriesByMonth>) {
      for (const newsItem of newsEntries[month]) {
        const existingNews = await prisma.news.findFirst({
          where: {
            name: newsItem.name,
            date: newsItem.date,
          },
        });
  
        if (!existingNews) {
          await prisma.news.create({
            data: {
              ...newsItem,
              status: 'active',
              creatorId: 1
            },
          });
        }
      }
    }
  
    console.log('News seed completed successfully');
  }
  
  main()
    .catch((e) => {
      console.error(e)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })