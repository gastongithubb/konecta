// app/admin/team-leaders/page.tsx
import React from 'react';
import { PrismaClient } from '@prisma/client';
import TeamLeaderList from '@/components/admin/TeamLeaderList';
import TeamLeaderForm from '@/components/admin/TeamLeaderForm';

const prisma = new PrismaClient();

export default async function TeamLeadersPage() {
  const teamLeaders = await prisma.user.findMany({
    where: { role: 'team_leader' },
    select: { id: true, name: true, email: true },
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Team Leaders Management</h1>
      <TeamLeaderList teamLeaders={teamLeaders} />
      <TeamLeaderForm />
    </div>
  );
}