// app/team-monitoring/view/page.tsx
import { Suspense } from 'react';
import { getTeamMembers, getWeekConfigurations } from '@/app/actions/team-monitoring';
import { TeamMonitoringView } from '@/components/team_leader/TeamMonitoring/TeamMonitoringView';
import { getSession } from '@/app/lib/auth.server';
import { redirect } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { Loader2 } from 'lucide-react';

export default async function TeamMonitoringViewPage() {
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
          <TeamMonitoringView 
            members={members}
            userRole={session.role}
            weeks={weeks}
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
            {error instanceof Error ? error.message : 'Error al cargar los datos'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }
}