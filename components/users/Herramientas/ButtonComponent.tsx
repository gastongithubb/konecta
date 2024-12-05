'use client'
import React from 'react';

const ButtonComponent = () => {
  const buttons = [
    { 
      name: "SalesForce - Sancor Salud", 
      color: "bg-[#003566]",
      hoverColor: "hover:bg-[#004580]",
      url: "https://sso.sancorsalud.com.ar/auth/realms/sancorsalud/protocol/saml?SAMLRequest=jZLtb6owFMb%2FFdLvvAwEtZkuKLixgUOBKX4xXa2IQqstoPvvx95uvPfDcps0aXOec54nJ7%2Fbu0tZSA3hImd0AG4UDUiEYrbJaTYASTyRe%2BBueCtQWehHaNfVjs7JqSaiktpGKuBXZQBqTiFDIheQopIIWGEY2YEPdUWDR84qhlkBJFsIwqvWasyoqEvCI8KbHJNk7g%2FArqqOAqqqQG0ALlBRb5TyTWkfRGwZx0TBrASS05rnFFWfgf%2F0CKZc97VKBXEVtYFVTlBRiuux6k8i9SM%2BkDxnANb62G7ParJqmiIKHPv87%2F0oy81IOIm7rwILW%2Byllx6688lplMZcf9094mWArfElcxOXb704dQpsPx3QY%2BHqydQ95oU%2F61qpsDN3HPUN7Rzc52%2B5s9g0VhmVs36n17E28d56Ef15XbqvWej4F6Z7%2Bn5ZZCuNHjZaUBv0obed9o716bwZyVts%2BRcvnlgTMjWcND2KYLf2LuNzrLn1YhHvwkXCTdc32OzejKzipij3ODEWQs%2Bjjrmum%2FnTOpBPy%2FXoKbWm1uwZZYeRufdF0g3Pl%2B4pDXEiL%2B3n%2FpufEe4ZU7vdlhA18aioEK0GQNf0jqx15Zt%2BrJnQ1KFpKL1uZwWk8HvJo5x%2B4fQbI69fIgEf4jiUw%2BcoBtLLD5atAHxDCD%2Fd%2BTV9vw9GP8iB4X8Bdqte%2Bwy%2Fv3%2BzP3wH&RelayState=%2Fvisualforce%2Fsession%3Furl%3Dhttps%253A%252F%252Fsancorsalud.lightning.force.com%252Fone%252Fone.app&SigAlg=http%3A%2F%2Fwww.w3.org%2F2001%2F04%2Fxmldsig-more%23rsa-sha256&Signature=h5fMqsAB4UOb2K1ILIsrkI7bJCwMiRC004VJ%2FZYfu7Ph4iyOSWBcciZvp9r%2BqqBSLaIosY3WjYW4c6aaLxWAnuvwPyQ6KE77eQ0hOBXxPlaqA4yuYhWI1tt%2B3RABUKursSpaMjidaJmti2ayPxOoCPks%2B6QURSIbOFKPFKzsoinZzSOGnXIoP0rdkkwjR0gPsNRbfXto5jWU%2F5RTT27uoIKdSUw5kAldCt1lmkG4U3sFZiX5eMEgVNsHLgC5n9qjtSU9o7UPhcRwyVQFrdYXgBBF8fHDmdLk0KSpwcyA2%2B2phLCSdnJfd%2BL6aKp16Ij3fLr3zClyeJjwZhbSZGsCVg%3D%3D"
    },
    { 
      name: "Orion", 
      color: "bg-[#003566]",
      hoverColor: "hover:bg-[#004580]",
      url: "http://p-oriondb-01:8080/ingresoInterno"
    },
    { 
      name: "Llamadas caidas", 
      color: "bg-[#003566]",
      hoverColor: "hover:bg-[#004580]",
      url: "https://docs.google.com/forms/d/e/1FAIpQLSdlS9SATMr0g9KW-7eGYJ7UF31_96wJd-1xpqQ8NlrfapzGbw/viewform"
    },
    { 
      name: "Plataforma de farmacias", 
      color: "bg-[#003566]",
      hoverColor: "hover:bg-[#004580]",
      url: "https://www.plataformacsf.com/login.xhtml"
    },
    { 
      name: "AMB prestadores", 
      color: "bg-[#003566]",
      hoverColor: "hover:bg-[#004580]",
      url: "http://prestadoresui.ams.red/#/prestador"
    },
    { 
      name: "Convenios UI", 
      color: "bg-[#003566]",
      hoverColor: "hover:bg-[#004580]",
      url: "https://convenios.sancorsalud.com.ar/#/convenio/Buscador"
    },
    { 
      name: "Planes OS", 
      color: "bg-[#20603d]",
      hoverColor: "hover:bg-[#2a7a4f]",
      url: "https://drive.google.com/file/d/1TuNbLZ4vgA5IDkMLrCfNeThVrtWtDX6k/view?usp=sharing"
    },
    { 
      name: "Beneficio de cada plan", 
      color: "bg-[#20603d]",
      hoverColor: "hover:bg-[#2a7a4f]",
      url: "https://docs.google.com/spreadsheets/d/1EBYTBtBba9NM8OtZoD2Ye0OSIH_-QUqe/edit?pli=1&gid=1972551366#gid=1972551366"
    },
    { 
      name: "Manual Farmaceutico", 
      color: "bg-[#20603d]",
      hoverColor: "hover:bg-[#2a7a4f]",
      url: "https://docs.google.com/spreadsheets/d/1GeHNHLQjdRnzl2uI6eMVy0J5a5dxqBxFQiDAvVrCIZA/edit?gid=1361535532#gid=1361535532"
    },
    { 
      name: "Planes Sancor Looker", 
      color: "bg-[#20603d]",
      hoverColor: "hover:bg-[#2a7a4f]",
      url: "https://lookerstudio.google.com/u/0/reporting/ba41a3f7-31e2-4d5b-9fec-77070e93da06/page/p_8pn1i7sx5c"
    },
    {
      name: "Condiciones SupraSalud",
      color: "bg-[#20603d]",
      hoverColor: "hover:bg-[#2a7a4f]",
      url: "https://repo.sancorsalud.com.ar/webinstitucional/assets/pdf/supra-salud/SUPRA-SALUD.pdf"
    },
    {
      name: "Ver Deslogueo Orion",
      color: "bg-[#20603d]",
      hoverColor: "hover:bg-[#2a7a4f]",
      url: "https://portaldedatos.grupokonecta.com.ar/?page_id=3298"
    },
    {
      name: "Tutorial CRM",
      color: "bg-[#588B8B]",
      hoverColor: "hover:bg-[#ffcd1a]",
      url: "https://sites.google.com/sancorsalud.com.ar/experienciatubibliotecavirtual/crm/antes-de-cargar-un-caso"
    },
    {
      name: "Configuracion Xlite",
      color: "bg-[#588B8B]",
      hoverColor: "hover:bg-[#ffcd1a]",
      url: "https://www.canva.com/design/DAGX3s_UmOw/PB9sHCLqmcKUZ4m6xpTcOQ/view?utm_content=DAGX3s_UmOw&utm_campaign=designshare&utm_medium=link&utm_source=editor"
    },
    {
      name: "Biblioteca Experiencia",
      color: "bg-[#588B8B]",
      hoverColor: "hover:bg-[#ffcd1a]",
      url: "https://sites.google.com/sancorsalud.com.ar/copiadeexperiencia-tubibliotec/home?authuser=0"
    },
  ];

  const handleClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="max-w-[1000px] mx-auto p-5 transition-all">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-blue-500/5 p-6 transition-all">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-gray-100">
          Links de Utilidad
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {buttons.map(({ name, color, url }) => (
            <button
              key={name}
              onClick={() => handleClick(url)}
              className={`
                ${color} dark:opacity-90
                px-4 py-3 rounded-lg
                text-white font-semibold
                flex justify-between items-center
                transition-all duration-300
                hover:shadow-lg dark:hover:shadow-blue-500/20
                hover:scale-[1.02] active:scale-[0.98]
                group relative overflow-hidden
                dark:hover:opacity-100
              `}
            >
              <span className="transition-transform group-hover:translate-x-[-4px]">
                {name}
              </span>
              <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                ➜
              </span>
              
              {/* Overlay para efecto hover */}
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity dark:group-hover:opacity-20" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ButtonComponent;