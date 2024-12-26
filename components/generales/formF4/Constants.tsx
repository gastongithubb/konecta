// constants.ts
export const AUTHORIZATION_TYPES = [
    { value: "Medicamentos", label: "Medicamentos" },
    { value: "Cirugías", label: "Cirugías" },
    { value: "leches", label: "Leches medicamentosas" },
    { value: "cirugias-pat-ba", label: "Cirugías Patagonia y Bs As" },
    { value: "cirugias-interior", label: "Cirugías Interior del país" },
    { value: "internaciones", label: "Internaciones" },
    { value: "auditoria", label: "Auditoría Médica" },
    { value: "protesis", label: "Prótesis" },
    { value: "control", label: "Puntos de control" },
    { value: "contrataciones", label: "Contrataciones" },
    { value: "fertilidad", label: "Fertilidad" },
    { value: "Otros", label: "Otros" }
  ];
  
  export const STATUS_STYLES = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500",
    "in-progress": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500",
    completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500"
  };