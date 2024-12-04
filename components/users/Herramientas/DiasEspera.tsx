'use client'
import React, { useState } from 'react';
import { useTheme } from 'next-themes';
import { Edit2, Save, X } from 'lucide-react';

interface Practica {
  nombre: string;
  diasEspera: number;
}

const practicasIniciales: Practica[] = [
  { nombre: "Rehabilitación drogadependencia", diasEspera: 8 },
  { nombre: "Odontología - Ortodoncia", diasEspera: 5 },
  { nombre: "Odontología - Protesis Odontológicas", diasEspera: 5 },
  { nombre: "Fertilidad - Inicio de tratamiento", diasEspera: 20 },
  { nombre: "Fertilidad - Medicación (tratamiento iniciado)", diasEspera: 3 },
  { nombre: "Fertilidad - Medicación (tratamiento no iniciado)", diasEspera: 10 },
  { nombre: "Internación SIN Prótesis y SIN Presupuesto", diasEspera: 7 },
  { nombre: "Internación SIN Prótesis y CON Presupuesto", diasEspera: 10 },
  { nombre: "Internación CON Prótesis y SIN Presupuesto", diasEspera: 10 },
  { nombre: "Internación CON Prótesis y CON Presupuesto", diasEspera: 10 },
  { nombre: "Practica en ambulatorio CON Presupuesto y CON Protesis", diasEspera: 11 },
  { nombre: "Practica en ambulatorio CON Presupuesto y SIN Protesis", diasEspera: 8 },
  { nombre: "Practica en ambulatorio SIN Presupuesto y CON Protesis", diasEspera: 8 },
  { nombre: "Practica en ambulatorio SIN Presupuesto y SIN Protesis", diasEspera: 4 },
];

const PracticasEspera: React.FC = () => {
  const { theme } = useTheme();
  const [practicas, setPracticas] = useState<Practica[]>(practicasIniciales);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  const handleEdit = (index: number) => {
    setEditIndex(index);
    setEditValue(practicas[index].diasEspera.toString());
  };

  const handleSave = () => {
    if (editIndex !== null) {
      const newPracticas = [...practicas];
      newPracticas[editIndex].diasEspera = parseInt(editValue, 10);
      setPracticas(newPracticas);
      setEditIndex(null);
    }
  };

  const handleCancel = () => {
    setEditIndex(null);
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-colors duration-200">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-6 text-center pb-4 border-b border-blue-500">
          Tiempos de Espera - Prácticas Médicas
        </h1>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="px-6 py-4 bg-blue-500 text-white font-semibold text-left rounded-tl-lg">
                  Práctica
                </th>
                <th className="px-6 py-4 bg-blue-500 text-white font-semibold text-left w-32">
                  Días de Espera
                </th>
                <th className="px-6 py-4 bg-blue-500 text-white font-semibold text-left w-32 rounded-tr-lg">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {practicas.map((practica, index) => (
                <tr 
                  key={index}
                  className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                >
                  <td className="px-6 py-4 text-gray-800 dark:text-gray-200">
                    {practica.nombre}
                  </td>
                  <td className="px-6 py-4 text-gray-800 dark:text-gray-200">
                    {editIndex === index ? (
                      <input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-20 px-2 py-1 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      practica.diasEspera
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editIndex === index ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSave}
                          className="flex items-center px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors duration-150"
                        >
                          <Save className="w-4 h-4 mr-1" />
                          <span>Guardar</span>
                        </button>
                        <button
                          onClick={handleCancel}
                          className="flex items-center px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-150"
                        >
                          <X className="w-4 h-4 mr-1" />
                          <span>Cancelar</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEdit(index)}
                        className="flex items-center px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-150"
                      >
                        <Edit2 className="w-4 h-4 mr-1" />
                        <span>Editar</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PracticasEspera;