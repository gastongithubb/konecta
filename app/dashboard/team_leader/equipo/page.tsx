'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSession } from 'next-auth/react';
import { 
  UserPlus, 
  Save, 
  X, 
  AlertCircle, 
  CheckCircle, 
  Users, 
  Trash2, 
  Link, 
  Loader2,
  Calendar,
  Building2,
  User,
  MapPin,
  Briefcase,
  Clock
} from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface ApiResponse<T> {
  data: T;
  error?: string;
}

interface Team {
  id: number;
  name: string;
  grupoNovedades: string;
  grupoGeneral: string;
  manager: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  teamLeader: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  members: Array<{
    id: number;
    name: string;
    email: string;
    role: string;
  }>;
}

interface Nomina {
  id?: number;
  estadoActual: string;
  cuenta: string;
  servicio: string;
  cargo: string;
  provincia: string;
  site: string;
  lider: string;
  apellidoYNombre: string;
  usuarioOrion: string;
  usuarioSalesforce: string;
  modalidad: string;
  ingreso: string;
  egreso: string;
  box: string;
  teamId: number | null;
}

const AddMember: React.FC = () => {
  const { data: session, status } = useSession();
  const [nomina, setNomina] = useState<Nomina>({
    estadoActual: '',
    cuenta: '',
    servicio: '',
    cargo: '',
    provincia: '',
    site: '',
    lider: session?.user?.name || '',
    apellidoYNombre: '',
    usuarioOrion: '',
    usuarioSalesforce: '',
    modalidad: '',
    ingreso: '',
    egreso: '',
    box: '',
    teamId: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamMembers, setTeamMembers] = useState<Nomina[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isLoadingTeams, setIsLoadingTeams] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      setIsLoadingTeams(true);
      setError(null);
      
      try {
        const response = await fetch('/api/teams');
        const result: ApiResponse<Team[]> = await response.json();
        
        if (response.ok && result.data) {
          setTeams(result.data);
        } else {
          setTeams([]);
          setError(result.error || 'Error al cargar los equipos');
        }
      } catch (err) {
        console.error('Error fetching teams:', err);
        setTeams([]);
        setError('Error al cargar los equipos');
      } finally {
        setIsLoadingTeams(false);
      }
    };

    fetchTeams();
  }, []);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (session?.user?.teamId) {
        try {
          const response = await fetch(`/api/nomina?teamId=${session.user.teamId}`);
          const data = await response.json();
          if (response.ok) {
            setTeamMembers(data);
          } else {
            setError(data.error || 'Error al cargar los miembros del equipo');
          }
        } catch (err) {
          setError('Error al cargar los miembros del equipo');
        }
      }
    };

    fetchTeamMembers();
  }, [session]);

  const handleTeamSelect = (teamId: string) => {
    const team = teams.find(t => t.id === parseInt(teamId));
    setSelectedTeam(team || null);
    setNomina(prev => ({
      ...prev,
      teamId: parseInt(teamId)
    }));
  };

  const handleTeamLinkUpdate = async () => {
    if (!selectedTeam) return;

    try {
      const response = await fetch(`/api/teams/${selectedTeam.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grupoNovedades: selectedTeam.grupoNovedades,
          grupoGeneral: selectedTeam.grupoGeneral
        }),
      });

      if (response.ok) {
        setSuccess('Links de equipo actualizados exitosamente');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al actualizar los links del equipo');
      }
    } catch (err) {
      setError('Error al actualizar los links del equipo');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNomina((prev) => ({
      ...prev,
      [name]: name === 'teamId' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/nomina', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nomina),
      });

      if (response.ok) {
        const newMember = await response.json();
        setSuccess('Miembro agregado exitosamente');
        setTeamMembers(prev => [...prev, newMember]);
        
        // Reset form
        setNomina({
          estadoActual: '',
          cuenta: '',
          servicio: '',
          cargo: '',
          provincia: '',
          site: '',
          lider: session?.user?.name || '',
          apellidoYNombre: '',
          usuarioOrion: '',
          usuarioSalesforce: '',
          modalidad: '',
          ingreso: '',
          egreso: '',
          box: '',
          teamId: nomina.teamId,
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al agregar el miembro');
      }
    } catch (err) {
      setError('Error al agregar el miembro');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMember = async (memberId: number) => {
    try {
      const response = await fetch(`/api/nomina/${memberId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTeamMembers(prev => prev.filter(member => member.id !== memberId));
        setSuccess('Miembro eliminado exitosamente');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al eliminar el miembro');
      }
    } catch (err) {
      setError('Error al eliminar el miembro');
    }
  };

  const FormField = ({ 
    label, 
    name, 
    value, 
    onChange, 
    placeholder, 
    type = "text",
    required = false,
    icon: Icon
  }: {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    type?: string;
    required?: boolean;
    icon?: React.ComponentType<any>;
  }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <Input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 ${
            Icon ? 'pl-10' : ''
          }`}
        />
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <Card className="w-full max-w-7xl mx-auto shadow-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <CardHeader className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-4">
            <div className="p-2 rounded-full bg-blue-100/80 dark:bg-blue-900/30">
              <UserPlus className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Agregar Nuevo Miembro
              </CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400 mt-1">
                Complete todos los campos para registrar un nuevo miembro del equipo
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Links del Equipo */}
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardHeader className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center space-x-3">
                <Link className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Links del Equipo
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Seleccionar Equipo
                  </label>
                  <Select
                    onValueChange={handleTeamSelect}
                    value={selectedTeam?.id.toString() || ''}
                  >
                    <SelectTrigger className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                      <SelectValue placeholder={isLoadingTeams ? "Cargando equipos..." : "Seleccionar Equipo"} />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingTeams ? (
                        <SelectItem value="loading" disabled>
                          Cargando...
                        </SelectItem>
                      ) : teams.length > 0 ? (
                        teams.map((team) => (
                          <SelectItem key={team.id} value={team.id.toString()}>
                            {team.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-teams" disabled>
                          No hay equipos disponibles
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {selectedTeam && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Grupo de Novedades
                      </label>
                      <Input
                        type="url"
                        value={selectedTeam.grupoNovedades || ''}
                        onChange={(e) => setSelectedTeam(prev => 
                          prev ? { ...prev, grupoNovedades: e.target.value } : null
                        )}
                        placeholder="URL del grupo de novedades"
                        className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Grupo General
                      </label>
                      <Input
                        type="url"
                        value={selectedTeam.grupoGeneral || ''}
                        onChange={(e) => setSelectedTeam(prev => 
                          prev ? { ...prev, grupoGeneral: e.target.value } : null
                        )}
                        placeholder="URL del grupo general"
                        className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                      />
                    </div>
                    <div className="col-span-full">
                      <Button
                        onClick={handleTeamLinkUpdate}
                        className="w-full sm:w-auto"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Actualizar Links de Equipo
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Formulario Principal */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información Personal */}
            <Card className="border border-gray-200 dark:border-gray-700">
              <CardHeader className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Información Personal
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  label="Nombre Completo"
                  name="apellidoYNombre"
                  value={nomina.apellidoYNombre}
                  onChange={handleChange}
                  placeholder="Apellido y Nombre"
                  required
                  icon={User}
                />
                <FormField
                  label="Cargo"
                  name="cargo"
                  value={nomina.cargo}
                  onChange={handleChange}
                  placeholder="Cargo"
                  required
                  icon={Briefcase}
                />
                <FormField
                  label="Usuario Orion"
                  name="usuarioOrion"
                  value={nomina.usuarioOrion}
                  onChange={handleChange}
                  placeholder="Usuario Orion"
                  required
                />
                <FormField
                  label="Usuario Salesforce"
                  name="usuarioSalesforce"
                  value={nomina.usuarioSalesforce}
                  onChange={handleChange}
                  placeholder="Usuario Salesforce"
                />
              </CardContent>
            </Card>

            {/* Información Laboral */}
            <Card className="border border-gray-200 dark:border-gray-700">
              <CardHeader className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center space-x-3">
                  <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Información Laboral
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  label="Estado Actual"
                  name="estadoActual"
                  value={nomina.estadoActual}
                  onChange={handleChange}
                  placeholder="Estado Actual"
                />
                <FormField
                  label="Cuenta"
                  name="cuenta"
                  value={nomina.cuenta}
                  onChange={handleChange}
                  placeholder="Cuenta"
                />
                <FormField
                  label="Servicio"
                  name="servicio"
                  value={nomina.servicio}
                  onChange={handleChange}
                  placeholder="Servicio"
                  required
                />
                <FormField
                  label="Modalidad"
                  name="modalidad"
                  value={nomina.modalidad}
                  onChange={handleChange}
                  placeholder="Modalidad"
                />
                <FormField
                  label="Box"
                  name="box"
                  value={nomina.box}
                  onChange={handleChange}
                  placeholder="Box"
                />
                <FormField
                  label="Líder"
                  name="lider"
                  value={nomina.lider}
                  onChange={handleChange}
                  placeholder="Líder"
                  required
                />
              </CardContent>
            </Card>

            {/* Ubicación */}
            <Card className="border border-gray-200 dark:border-gray-700">
              <CardHeader className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Ubicación
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  label="Provincia"
                  name="provincia"
                  value={nomina.provincia}
                  onChange={handleChange}
                  placeholder="Provincia"
                  required
                />
                <FormField
                  label="Site"
                  name="site"
                  value={nomina.site}
                  onChange={handleChange}
                  placeholder="Site"
                />
              </CardContent>
            </Card>

            {/* Horarios */}
            <Card className="border border-gray-200 dark:border-gray-700">
              <CardHeader className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Horarios
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  label="Horario de Ingreso"
                  name="ingreso"
                  value={nomina.ingreso}
                  onChange={handleChange}
                  type="time"
                  placeholder="HH:MM"
                />
                <FormField
                  label="Horario de Egreso"
                  name="egreso"
                  value={nomina.egreso}
                  onChange={handleChange}
                  type="time"
                  placeholder="HH:MM"
                />
              </CardContent>
            </Card>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 sm:flex-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Miembro
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1 sm:flex-none"
                onClick={() => {
                  setNomina({
                    estadoActual: '',
                    cuenta: '',
                    servicio: '',
                    cargo: '',
                    provincia: '',
                    site: '',
                    lider: session?.user?.name || '',
                    apellidoYNombre: '',
                    usuarioOrion: '',
                    usuarioSalesforce: '',
                    modalidad: '',
                    ingreso: '',
                    egreso: '',
                    box: '',
                    teamId: nomina.teamId,
                  });
                }}
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </form>

          {/* Lista de Miembros */}
          {teamMembers.length > 0 && (
            <Card className="border border-gray-200 dark:border-gray-700">
              <CardHeader className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Miembros del Equipo
                    </CardTitle>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Total: {teamMembers.length}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <ScrollArea className="h-[300px]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {teamMembers.map((member) => (
                      <Card 
                        key={member.id} 
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                                {member.apellidoYNombre}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-300 truncate mt-1">
                                {member.cargo} - {member.servicio}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                {member.usuarioOrion}
                              </p>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteMember(member.id!)}
                              className="shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Mensajes de error y éxito */}
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="mt-4 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800">
              <CheckCircle className="w-4 h-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AddMember;