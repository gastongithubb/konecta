// components/admin/TeamLeaderForm.tsx
'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const TeamLeaderForm: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/team-leaders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, role: 'team_leader' }),
      });
      if (response.ok) {
        setName('');
        setEmail('');
        router.refresh();
      } else {
        console.error('Failed to create team leader');
      }
    } catch (error) {
      console.error('Error creating team leader:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Add New Team Leader</h2>
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
        Add Team Leader
      </button>
    </form>
  );
};

export default TeamLeaderForm;