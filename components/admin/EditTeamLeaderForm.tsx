// components/admin/EditTeamLeaderForm.tsx
'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface TeamLeader {
  id: number;
  name: string;
  email: string;
}

interface EditTeamLeaderFormProps {
  teamLeader: TeamLeader;
}

const EditTeamLeaderForm: React.FC<EditTeamLeaderFormProps> = ({ teamLeader }) => {
  const [name, setName] = useState(teamLeader.name);
  const [email, setEmail] = useState(teamLeader.email);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/team-leaders/${teamLeader.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email }),
      });
      if (response.ok) {
        router.push('/admin/team-leaders');
        router.refresh();
      } else {
        console.error('Failed to update team leader');
      }
    } catch (error) {
      console.error('Error updating team leader:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
      <div className="mb-4">
        <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
          Name
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
      >
        Update Team Leader
      </button>
    </form>
  );
};

export default EditTeamLeaderForm;