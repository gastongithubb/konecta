import { NextPage } from 'next';

const TermsOfService: NextPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">Condiciones del Servicio</h1>

      <p className="mb-4">
        Bienvenido a <span className="font-semibold">[Nombre del Call Center]</span>. Al utilizar nuestros
        servicios, aceptas las siguientes condiciones. Te recomendamos que las leas detenidamente.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">Uso de Nuestros Servicios</h2>
      <p className="mb-4">
        El uso de nuestros servicios implica tu aceptación de cumplir con todas las leyes y regulaciones aplicables, 
        y te comprometes a no utilizar los servicios para fines ilegales o no autorizados.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">Propiedad Intelectual</h2>
      <p className="mb-4">
        Todos los derechos sobre el contenido, diseño, y código fuente de este sitio web son propiedad de 
        <span className="font-semibold"> [Nombre del Call Center] </span>. Está prohibida la reproducción, distribución 
        o modificación no autorizada de cualquier parte del sitio.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">Limitación de Responsabilidad</h2>
      <p className="mb-4">
        <span className="font-semibold">[Nombre del Call Center]</span> no será responsable por daños directos o indirectos
        derivados del uso o la imposibilidad de uso de los servicios proporcionados.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">Modificaciones</h2>
      <p className="mb-4">
        Nos reservamos el derecho de modificar estas condiciones en cualquier momento. Los cambios serán efectivos 
        desde el momento de su publicación en esta página.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">Contacto</h2>
      <p className="mb-4">
        Si tienes alguna pregunta sobre estas condiciones, puedes contactarnos en{' '}
        <span className="font-semibold">[correo electrónico de contacto]</span>.
      </p>
    </div>
  );
};

export default TermsOfService;
