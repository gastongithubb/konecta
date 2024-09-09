'use client'
import React, { useState } from 'react';
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
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = () => {
    router.push(`/admin/team-leaders/${teamLeader.id}/edit`);
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this team leader?')) {
      setIsDeleting(true);
      try {
        const response = await fetch(`/api/team-leaders/${teamLeader.id}`, {
          method: 'DELETE',
          credentials: 'include', // Esto asegura que las cookies se envíen con la solicitud
        });
        
        if (response.ok) {
          router.refresh();
        } else {
          const errorData = await response.json();
          console.error('Failed to delete team leader:', errorData.error);
          alert(`Failed to delete team leader: ${errorData.error}`);
        }
      } catch (error) {
        console.error('Error deleting team leader:', error);
        alert('An unexpected error occurred while deleting the team leader.');
      } finally {
        setIsDeleting(false);
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
          disabled={isDeleting}
          className={`text-red-600 hover:text-red-900 ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </td>
    </tr>
  );
};

export default TeamLeaderItem;