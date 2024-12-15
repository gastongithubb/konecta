// components/team_leader/TeamMonitoring/TeamMonitoringView.tsx
'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileAudio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface TeamMember {
  id: number;
  email: string;
  name: string;
  [key: string]: any;
}

interface WeekInfo {
  id: number;
  label: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

interface TeamMonitoringViewProps {
  members: TeamMember[];
  weeks: WeekInfo[];
  userRole: string;
}

export function TeamMonitoringView({ members, weeks, userRole }: TeamMonitoringViewProps) {
  const [audioDialogOpen, setAudioDialogOpen] = React.useState(false);
  const [selectedAudioUrl, setSelectedAudioUrl] = React.useState('');

  const getWeekData = (member: TeamMember, weekId: number) => {
    const weekKey = `week${weekId}`;
    if (weekKey in member) {
      return member[weekKey];
    }
    return undefined;
  };

  const handleAudioClick = (audioUrl: string) => {
    if (audioUrl) {
      setSelectedAudioUrl(audioUrl);
      setAudioDialogOpen(true);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Vista de Seguimiento de Equipo</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Mail</TableHead>
                <TableHead className="w-[200px]">Nombre y Apellido</TableHead>
                {weeks.map((week) => (
                  <TableHead key={week.id} className="w-[300px] text-center">
                    <div className="font-medium">{week.label}</div>
                    <div className="text-sm font-normal">
                      {week.startDate} - {week.endDate}
                    </div>
                    <div className="flex justify-around mt-2 text-sm font-normal">
                      <span>Llamada</span>
                      <span>Audio</span>
                      <span>Nota</span>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.email}</TableCell>
                  <TableCell>{member.name}</TableCell>
                  {weeks.map((week) => {
                    const weekData = getWeekData(member, week.id);
                    return (
                      <TableCell key={week.id} className="p-2">
                        <div className="flex justify-between items-center gap-2">
                          <div className="w-1/3 text-center">
                            {weekData?.callType || '-'}
                          </div>
                          <div className="w-1/3 flex justify-center">
                            {weekData?.audio ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleAudioClick(weekData.audio!)}
                              >
                                <FileAudio className="h-4 w-4 text-green-600" />
                              </Button>
                            ) : (
                              <FileAudio className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                          <div className="w-1/3 text-center">
                            {weekData?.score?.toFixed(1) || '-'}
                          </div>
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Dialog open={audioDialogOpen} onOpenChange={setAudioDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <audio controls className="w-full mt-2">
              <source src={selectedAudioUrl} type="audio/mpeg" />
              Tu navegador no soporta el elemento de audio.
            </audio>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}