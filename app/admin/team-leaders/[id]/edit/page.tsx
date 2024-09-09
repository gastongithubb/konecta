// app/admin/team-leaders/[id]/edit/page.tsx
import React from 'react';
import { PrismaClient } from '@prisma/client';
import EditTeamLeaderForm from '@/components/admin/EditTeamLeaderForm';

const prisma = new PrismaClient();

interface EditTeamLeaderPageProps {
  params: { id: string };
}

export default async function EditTeamLeaderPage({ params }: EditTeamLeaderPageProps) {
  const teamLeader = await prisma.user.findUnique({
    where: { id: parseInt(params.id) },
    select: { id: true, name: true, email: true },
  });

  if (!teamLeader) {
    return <div>Team Leader not found</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Team Leader</h1>
      <EditTeamLeaderForm teamLeader={teamLeader} />
    </div>
  );
}