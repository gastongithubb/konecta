// components/admin/TeamLeaderItem.tsx
'use client'
import React from 'react';
import { useRouter } from 'next/navigation';

interface TeamLeader {
  id: number;
  name: string;
  email: string;
}

interface TeamLeaderItemProps {
  teamLeader: TeamLeader;
}

const TeamLeaderItem: React.FC<TeamLeaderItemProps> = ({ teamLeader }) => {
  const router = useRouter();

  const handleEdit = () => {
    router.push(`/admin/team-leaders/${teamLeader.id}/edit`);
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this team leader?')) {
      try {
        const response = await fetch(`/api/team-leaders/${teamLeader.id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          router.refresh();
        } else {
          console.error('Failed to delete team leader');
        }
      } catch (error) {
        console.error('Error deleting team leader:', error);
      }
    }
  };

  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap">{teamLeader.name}</td>
      <td className="px-6 py-4 whitespace-nowrap">{teamLeader.email}</td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button
          onClick={handleEdit}
          className="text-indigo-600 hover:text-indigo-900 mr-2"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="text-red-600 hover:text-red-900"
        >
          Delete
        </button>
      </td>
    </tr>
  );
};

export default TeamLeaderItem;