'use client'

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { MoonIcon, SunIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

interface SpeechVersion {
  formal?: string;
  directa?: string;
  amigable?: string;
}

interface SpeechCardProps extends SpeechVersion {
  title: string;
}

const SpeechCard: React.FC<SpeechCardProps> = ({ title, formal, directa, amigable }) => {
  return (
    <Card className="w-full h-full border dark:border-gray-800 transition-colors duration-200">
      <CardHeader className="dark:bg-gray-800/50">
        <CardTitle className="text-lg font-bold dark:text-gray-100">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="dark:bg-gray-800/30">
        <Accordion type="single" collapsible className="w-full">
          {formal && (
            <AccordionItem value="formal" className="border-b dark:border-gray-700">
              <AccordionTrigger className="hover:text-primary dark:text-gray-200 dark:hover:text-primary">
                Versión Formal
              </AccordionTrigger>
              <AccordionContent className="dark:text-gray-300">
                <div className="text-sm italic bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
                  {formal}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
          {directa && (
            <AccordionItem value="directa" className="border-b dark:border-gray-700">
              <AccordionTrigger className="hover:text-primary dark:text-gray-200 dark:hover:text-primary">
                Versión Directa
              </AccordionTrigger>
              <AccordionContent className="dark:text-gray-300">
                <div className="text-sm italic bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
                  {directa}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
          {amigable && (
            <AccordionItem value="amigable" className="border-b dark:border-gray-700">
              <AccordionTrigger className="hover:text-primary dark:text-gray-200 dark:hover:text-primary">
                Versión Amigable
              </AccordionTrigger>
              <AccordionContent className="dark:text-gray-300">
                <div className="text-sm italic bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
                  {amigable}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </CardContent>
    </Card>
  );
};

const speeches: SpeechCardProps[] = [
  {
    title: "Cuando el asociado se pone Agresivo/insulta",
    formal: "Entiendo que esta situación le genera malestar, pero para poder ayudarle, necesito que mantengamos un diálogo respetuoso. Si esta agresividad continúa, me veré obligado(a) a finalizar la llamada. ¿Podemos continuar de manera calmada?",
    directa: "Lamento que se sienta así, pero no puedo continuar la conversación si persiste el tono agresivo. Voy a colgar la llamada ahora. Le sugiero que nos contacte más tarde cuando esté en condiciones de dialogar calmadamente."
  },
  {
    title: "Cuando no Hay Más Información Disponible",
    formal: "Lamento no poder brindarle más información en este momento. Toda la información disponible ya ha sido proporcionada. Si necesita asistencia adicional en el futuro, no dude en contactarnos. Gracias por su comprensión y que tenga un buen día.",
    amigable: "Entiendo su necesidad de más detalles, pero en este momento no tengo más información para ofrecer. Si en el futuro hay algo más que podamos hacer, estamos a su disposición. Gracias por su llamada y que tenga un excelente día."
  },
  {
    title: "Cuando No Puede Ser Resuelto por Teléfono",
    formal: "Este tema requiere una revisión por parte de un área interna especializada. Ellos ya están trabajando en su caso y se pondrán en contacto con usted a la brevedad, ya sea por correo electrónico o por teléfono. Agradezco su paciencia y comprensión.",
    amigable: "Entiendo la importancia de este asunto, pero necesita ser revisado por un equipo interno. Ellos están revisando su caso y se comunicarán con usted pronto, ya sea por correo electrónico o por teléfono. Gracias por su paciencia."
  }
];

const SpeechCards: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-background transition-colors duration-200">
      <div className="flex-grow px-4 sm:px-6 md:px-8 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-center mb-6 mt-8">
          <h1 className="text-2xl font-bold dark:text-gray-100">Speechs de Cortes</h1>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="ml-auto dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            {theme === 'dark' ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {speeches.map((speech, index) => (
            <SpeechCard key={index} {...speech} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SpeechCards;