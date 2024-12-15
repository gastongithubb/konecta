'use client';

import React, { useState, useEffect, useCallback, memo } from 'react';
import { useTheme } from 'next-themes';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FileAudio, Loader2, Plus, X, Moon, Sun, Save, ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { updateWeekConfigurations } from '@/app/actions/team-monitoring';

interface TeamMember {
  id: number;
  email: string;
  name: string;
  [key: string]: any;
}

interface WeekData {
  callType?: string;
  audio?: string;
  score?: number;
}

interface WeekInfo {
  id: number;
  label: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

interface TeamMonitoringTableProps {
  members: TeamMember[];
  userRole: string;
  onUpdateData: (userId: number, weekId: number, data: Partial<WeekData>) => Promise<void>;
  onUpdateWeeks?: (weeks: WeekInfo[]) => void;
  initialWeeks?: WeekInfo[];
}

interface LoadingStates {
  notes: { [key: string]: boolean };
  audio: { [key: string]: boolean };
  calls: { [key: string]: boolean };
}

const CALL_TYPES = [
  'Primera llamada',
  'Segunda llamada',
  'Tercer llamada',
  'Cuarta llamada',
  'Quinta llamada',
  'Sexta llamada',
  'Septima llamada',
  'Octava llamada',
  'Novena llamada',
  'Ultima llamada',
  'Llamada nº10'
];

const STORAGE_KEY = 'team-monitoring-weeks';
const ITEMS_PER_PAGE = 10;

// Fixed AudioDialog component with display name
const AudioDialog = memo(function AudioDialog({ 
  open, 
  onOpenChange, 
  onSubmit, 
  currentUrl 
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (url: string) => void;
  currentUrl?: string;
}) {
  const [audioUrl, setAudioUrl] = useState(currentUrl || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(audioUrl);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>URL del Audio</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="audioUrl" className="text-right">URL</Label>
              <Input
                id="audioUrl"
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
                placeholder="https://..."
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Guardar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
});

// Fixed WeekForm component with display name
const WeekForm = memo(function WeekForm({ 
  week, 
  onUpdate, 
  onDelete 
}: {
  week: WeekInfo;
  onUpdate: (updatedWeek: WeekInfo) => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-2 p-2 border rounded">
      <Input
        value={week.label}
        onChange={(e) => onUpdate({ ...week, label: e.target.value })}
        className="w-24"
        placeholder="Semana X"
      />
      <Input
        value={week.startDate}
        onChange={(e) => onUpdate({ ...week, startDate: e.target.value })}
        className="w-24"
        placeholder="Inicio"
        type="date"
      />
      <Input
        value={week.endDate}
        onChange={(e) => onUpdate({ ...week, endDate: e.target.value })}
        className="w-24"
        placeholder="Fin"
        type="date"
      />
      <Button 
        variant="ghost" 
        size="icon"
        onClick={onDelete}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
});

// Fixed TableRow component with display name and proper typing
const TableRowMemoized = memo(function TableRowMemoized({ 
  member,
  weeks,
  loadingStates,
  handleUpdate,
  getWeekData,
  setAudioDialogOpen,
  setSelectedMemberWeek,
  localNotes,
  setLocalNotes,
  error
}: {
  member: TeamMember;
  weeks: WeekInfo[];
  loadingStates: LoadingStates;
  handleUpdate: (memberId: number, weekId: number, data: Partial<WeekData>) => Promise<void>;
  getWeekData: (member: TeamMember, weekId: number) => WeekData | undefined;
  setAudioDialogOpen: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
  setSelectedMemberWeek: React.Dispatch<React.SetStateAction<{ memberId?: number; weekId?: number }>>;
  localNotes: { [key: string]: string };
  setLocalNotes: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  error: { [key: string]: string };
}) {
  return (
    <TableRow>
      <TableCell className="font-medium">{member.email}</TableCell>
      <TableCell>{member.name}</TableCell>
      {weeks.map((week: WeekInfo) => {
        const weekData = getWeekData(member, week.id);
        const loadingKey = `${member.id}-${week.id}`;

        return (
          <TableCell key={week.id} className="p-2">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center gap-2">
                <Select
                  value={weekData?.callType}
                  onValueChange={(value) =>
                    handleUpdate(member.id, week.id, { callType: value })
                  }
                  disabled={loadingStates.calls[loadingKey]}
                >
                  <SelectTrigger className="w-1/3">
                    <SelectValue placeholder="Tipo de llamada" />
                  </SelectTrigger>
                  <SelectContent>
                    {CALL_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2 w-1/3 justify-center">
                  {loadingStates.audio[loadingKey] ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setSelectedMemberWeek({ memberId: member.id, weekId: week.id });
                        setAudioDialogOpen(prev => ({
                          ...prev,
                          [`${member.id}-${week.id}`]: true
                        }));
                      }}
                      disabled={loadingStates.audio[loadingKey]}
                    >
                      <FileAudio
                        className={`h-4 w-4 ${weekData?.audio ? 'text-green-600' : 'text-gray-400'}`}
                      />
                    </Button>
                  )}
                </div>
                <Input
                  type="number"
                  placeholder="Nota"
                  value={localNotes[loadingKey] ?? weekData?.score ?? ''}
                  className="w-1/3 text-sm"
                  step="0.1"
                  min="0"
                  max="100"
                  onChange={(e) => {
                    const value = e.target.value;
                    setLocalNotes(prev => ({
                      ...prev,
                      [loadingKey]: value
                    }));
                  }}
                  onBlur={() => {
                    const value = localNotes[loadingKey];
                    if (value !== undefined) {
                      const numberValue = parseFloat(value);
                      if (!isNaN(numberValue)) {
                        handleUpdate(member.id, week.id, {
                          score: numberValue
                        });
                        setLocalNotes(prev => {
                          const newNotes = { ...prev };
                          delete newNotes[loadingKey];
                          return newNotes;
                        });
                      }
                    }
                  }}
                  disabled={loadingStates.notes[loadingKey]}
                />
              </div>
              {error[loadingKey] && (
                <div className="text-xs text-red-500">
                  {error[loadingKey]}
                </div>
              )}
            </div>
          </TableCell>
        );
      })}
    </TableRow>
  );
});

export function TeamMonitoringTable({ 
  members, 
  userRole, 
  onUpdateData,
  onUpdateWeeks,
  initialWeeks = [] 
}: TeamMonitoringTableProps) {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const [weeks, setWeeks] = useState<WeekInfo[]>(initialWeeks);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingStates, setLoadingStates] = useState<{
    notes: { [key: string]: boolean };
    audio: { [key: string]: boolean };
    calls: { [key: string]: boolean };
  }>({
    notes: {},
    audio: {},
    calls: {}
  });
  const [error, setError] = useState<{ [key: string]: string }>({});
  const [audioDialogOpen, setAudioDialogOpen] = useState<{ [key: string]: boolean }>({});
  const [selectedMemberWeek, setSelectedMemberWeek] = useState<{ memberId?: number; weekId?: number }>({});
  const [localNotes, setLocalNotes] = useState<{ [key: string]: string }>({});
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalPages = Math.ceil(members.length / ITEMS_PER_PAGE);
  const paginatedMembers = members.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleWeeksChange = useCallback((newWeeks: WeekInfo[]) => {
    setWeeks(newWeeks);
  }, []);

  const saveWeeks = useCallback(async () => {
    try {
      // Remove localStorage operation as we're now saving to the database
      if (onUpdateWeeks) {
        await updateWeekConfigurations(weeks);
        await onUpdateWeeks(weeks);
      }
      toast({
        title: "Éxito",
        description: "Semanas guardadas correctamente",
      });
    } catch (e) {
      console.error('Error saving weeks:', e);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron guardar las semanas",
      });
    }
  }, [weeks, onUpdateWeeks, toast]);

  const handleUpdate = useCallback(async (
    memberId: number,
    weekId: number,
    data: Partial<WeekData>
  ) => {
    const loadingKey = `${memberId}-${weekId}`;
    
    setLoadingStates(prev => ({
      ...prev,
      notes: { ...prev.notes, [loadingKey]: 'score' in data },
      audio: { ...prev.audio, [loadingKey]: 'audio' in data },
      calls: { ...prev.calls, [loadingKey]: 'callType' in data }
    }));

    try {
      await onUpdateData(memberId, weekId, data);
      toast({
        title: "Éxito",
        description: "Datos actualizados correctamente",
      });
    } catch (error) {
      console.error('Error updating data:', error);
      setError(prev => ({
        ...prev,
        [loadingKey]: 'Error al actualizar los datos'
      }));
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron actualizar los datos",
      });
    } finally {
      setLoadingStates(prev => ({
        ...prev,
        notes: { ...prev.notes, [loadingKey]: false },
        audio: { ...prev.audio, [loadingKey]: false },
        calls: { ...prev.calls, [loadingKey]: false }
      }));
    }
  }, [onUpdateData, toast]);

  const getWeekData = useCallback((member: TeamMember, weekId: number): WeekData | undefined => {
    const weekKey = `week${weekId}`;
    if (weekKey in member) {
      return member[weekKey];
    }
    return undefined;
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold">Seguimiento de Equipo</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              onClick={saveWeeks}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Guardar Semanas
            </Button>
          </div>
        </div>
        <div className="mt-4">
          <div className="mb-4 flex flex-wrap gap-2">
            {weeks.map((week) => (
              <WeekForm
                key={week.id}
                week={week}
                onUpdate={(updatedWeek) => handleWeeksChange(
                  weeks.map(w => w.id === week.id ? updatedWeek : w)
                )}
                onDelete={() => handleWeeksChange(
                  weeks.filter(w => w.id !== week.id)
                )}
              />
            ))}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                const newId = Math.max(...weeks.map(w => w.id), 0) + 1;
                handleWeeksChange([
                  ...weeks,
                  {
                    id: newId,
                    label: `Semana ${newId}`,
                    startDate: '',
                    endDate: '',
                    isActive: true
                  }
                ]);
              }}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Agregar Semana
            </Button>
          </div>
        </div>
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
              {paginatedMembers.map((member) => (
                <TableRowMemoized
                  key={member.id}
                  member={member}
                  weeks={weeks}
                  loadingStates={loadingStates}
                  handleUpdate={handleUpdate}
                  getWeekData={getWeekData}
                  setAudioDialogOpen={setAudioDialogOpen}
                  setSelectedMemberWeek={setSelectedMemberWeek}
                  localNotes={localNotes}
                  setLocalNotes={setLocalNotes}
                  error={error}
                />
              ))}
            </TableBody>
          </Table>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-sm">
                Página {currentPage} de {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {selectedMemberWeek.memberId && selectedMemberWeek.weekId && (
          <AudioDialog
            open={audioDialogOpen[`${selectedMemberWeek.memberId}-${selectedMemberWeek.weekId}`] || false}
            onOpenChange={(open) => {
              setAudioDialogOpen(prev => ({
                ...prev,
                [`${selectedMemberWeek.memberId}-${selectedMemberWeek.weekId}`]: open
              }));
              if (!open) {
                setSelectedMemberWeek({});
              }
            }}
            onSubmit={(url) => {
              handleUpdate(
                selectedMemberWeek.memberId!,
                selectedMemberWeek.weekId!,
                { audio: url }
              );
            }}
            currentUrl={getWeekData(
              members.find(m => m.id === selectedMemberWeek.memberId)!,
              selectedMemberWeek.weekId!
            )?.audio}
          />
        )}
      </CardContent>
    </Card>
  );
}