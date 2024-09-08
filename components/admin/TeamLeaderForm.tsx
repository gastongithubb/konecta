'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Dirección de correo electrónico inválida"),
});

const TeamLeaderForm: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      schema.parse({ name, email });

      const response = await fetch('/api/team-leaders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}` // Asegúrate de enviar el token de autenticación
        },
        body: JSON.stringify({ name, email, role: 'team_leader' }),
      });

      if (response.ok) {
        setName('');
        setEmail('');
        router.refresh();
      } else {
        const data = await response.json();
        setError(data.error || 'Error al crear el líder de equipo');
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        setError(error.errors[0].message);
      } else {
        setError('Error inesperado. Por favor, inténtelo de nuevo.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Agregar Nuevo Líder</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="mb-4">
        <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
          Nombre
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>
      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Agregando...' : 'Añadir Líder'}
      </button>
    </form>
  );
};

export default TeamLeaderForm;