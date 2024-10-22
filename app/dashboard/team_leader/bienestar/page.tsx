// app/dashboard/team_leader/bienestar/page.tsx
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import SurveyDashboard from '@/components/SurveyDashboard';

export default async function TeamLeaderDashboard() {
    
  return <SurveyDashboard />;
}