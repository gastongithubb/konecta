// app/team-monitoring/page.tsx
import { Suspense } from 'react';
import { TeamMonitoringTable } from '@/components/team_leader/TeamMonitoring/TeamMonitoringTable';
import { getTeamMembers, updateWeekData, getWeekConfigurations, updateWeekConfigurations } from '@/app/actions/team-monitoring';
import { Loader2 } from 'lucide-react';
import { getSession } from '@/app/lib/auth.server';
import { redirect } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

export default async function TeamMonitoringPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  try {
    const [members, weeks] = await Promise.all([
      getTeamMembers(),
      getWeekConfigurations()
    ]);

    if (!members || members.length === 0) {
      return (
        <div className="container mx-auto py-8">
          <Alert variant="destructive">
            <ExclamationTriangleIcon className="h-4 w-4" />
            <AlertTitle>Sin miembros</AlertTitle>
            <AlertDescription>
              No hay miembros registrados en este equipo.
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return (
      <div className="container mx-auto py-8">
        <Suspense fallback={
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        }>
          <TeamMonitoringTable 
            members={members}
            userRole={session.role}
            onUpdateData={updateWeekData}
            onUpdateWeeks={updateWeekConfigurations}
            initialWeeks={weeks}
          />
        </Suspense>
      </div>
    );
  } catch (error) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'Error al cargar los miembros del equipo'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }
}