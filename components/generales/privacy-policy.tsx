import { NextPage } from 'next';

const PrivacyPolicy: NextPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">Política de Privacidad</h1>

      <p className="mb-4">
        En <span className="font-semibold">Konecta Group Argentina</span>, nos
        comprometemos a proteger la privacidad y la seguridad de la información
        personal de nuestros clientes y usuarios. Esta política de privacidad
        describe cómo recopilamos, utilizamos, almacenamos y protegemos su
        información. Al utilizar nuestros servicios, usted acepta los términos
        descritos en esta política.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">Información que Recopilamos</h2>

      <h3 className="text-xl font-semibold mt-4 mb-2">1. Información Personal</h3>
      <p className="mb-4">
        Recopilamos información personal que usted proporciona voluntariamente
        cuando se comunica con nosotros, como:
      </p>
      <ul className="list-disc pl-8 mb-4">
        <li>Nombre completo</li>
        <li>Número de teléfono</li>
        <li>Dirección de correo electrónico</li>
        <li>Datos de facturación o pago, si corresponde</li>
      </ul>

      <h3 className="text-xl font-semibold mt-4 mb-2">2. Información Técnica</h3>
      <p className="mb-4">
        Cuando accede a nuestra web, automáticamente recopilamos ciertos datos
        técnicos, como:
      </p>
      <ul className="list-disc pl-8 mb-4">
        <li>Dirección IP</li>
        <li>Tipo de navegador</li>
        <li>Sistema operativo</li>
        <li>Información sobre cómo utiliza nuestro sitio web</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6 mb-2">Uso de la Información</h2>
      <p className="mb-4">
        La información que recopilamos se utiliza para los siguientes propósitos:
      </p>
      <ul className="list-disc pl-8 mb-4">
        <li>Proveer y mejorar nuestros servicios de atención al cliente.</li>
        <li>Comunicarnos con usted sobre solicitudes o servicios solicitados.</li>
        <li>Gestionar su cuenta, si aplica.</li>
        <li>Cumplir con requisitos legales o normativos.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6 mb-2">Compartir Información con Terceros</h2>
      <p className="mb-4">
        No vendemos, alquilamos ni compartimos su información personal con
        terceros, excepto en los siguientes casos:
      </p>
      <ul className="list-disc pl-8 mb-4">
        <li>
          Proveedores de servicios externos que nos asisten en la operación de
          nuestro sitio web o servicios.
        </li>
        <li>Autoridades legales cuando sea requerido por ley.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6 mb-2">Seguridad de los Datos</h2>
      <p className="mb-4">
        Implementamos medidas técnicas y organizativas adecuadas para proteger
        su información personal contra el acceso no autorizado.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">Sus Derechos</h2>
      <p className="mb-4">
        Usted tiene derecho a acceder, corregir o eliminar su información
        personal en cualquier momento. Puede contactarnos en{' '}
        <span className="font-semibold">[correo electrónico de contacto]</span>.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">Cookies</h2>
      <p className="mb-4">
        Utilizamos cookies para mejorar la experiencia del usuario en nuestro
        sitio web. Puede configurar su navegador para rechazar las cookies.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">Cambios en la Política de Privacidad</h2>
      <p className="mb-4">
        Nos reservamos el derecho de modificar esta política en cualquier
        momento. Le recomendamos revisar esta política periódicamente.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">Contacto</h2>
      <p className="mb-4">
        Si tiene alguna pregunta sobre esta política de privacidad, puede
        comunicarse con nosotros a través de{' '}
        <span className="font-semibold">gastonalvarez18@outlook.com</span> o{' '}
        <span className="font-semibold">+54 9 3572506949</span>.
      </p>
    </div>
  );
};

export default PrivacyPolicy;
