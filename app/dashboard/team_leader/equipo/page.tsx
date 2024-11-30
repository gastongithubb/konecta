'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSession } from 'next-auth/react';
import { UserPlus, Save, X, AlertCircle, CheckCircle, Users, Trash2, Link } from 'lucide-react';

interface Team {
  id: number;
  name: string;
  grupoNovedades: string;
  grupoGeneral: string;
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

  // Fetch teams on component mount
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch('/api/teams');
        const data = await response.json();
        if (response.ok) {
          setTeams(data);
        } else {
          setError(data.error || 'Error al cargar los equipos');
        }
      } catch (err) {
        setError('Error al cargar los equipos');
      }
    };

    fetchTeams();
  }, []);

  // Fetch team members when session or team changes
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

  // Handle team selection
  const handleTeamSelect = (teamId: string) => {
    const team = teams.find(t => t.id === parseInt(teamId));
    setSelectedTeam(team || null);
    setNomina(prev => ({
      ...prev,
      teamId: parseInt(teamId)
    }));
  };

  // Update team links
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

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNomina((prev) => ({
      ...prev,
      [name]: name === 'teamId' ? parseInt(value) : value
    }));
  };

  // Submit new member
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!nomina.teamId) {
      setError('Por favor, selecciona un equipo válido.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/nomina', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...nomina,
          teamId: nomina.teamId,
          lider: session?.user?.name
        }),
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

  // Delete team member
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

  // Loading state
  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Card className="w-full max-w-7xl mx-auto shadow-lg">
        {/* Card Header */}
        <CardHeader className="bg-gray-50 border-b p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <UserPlus className="hidden sm:block w-8 h-8 text-primary" />
            <div>
              <CardTitle className="text-xl sm:text-2xl font-bold text-gray-800">
                Agregar Nuevo Miembro
              </CardTitle>
              <CardDescription className="text-sm text-gray-500">
                Complete todos los campos para registrar un nuevo miembro del equipo
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          {/* Team Group Links Section */}
          <Card className="mb-4">
            <CardHeader className="bg-gray-50 border-b p-4">
              <CardTitle className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center">
                <Link className="mr-2 w-6 h-6 text-primary" />
                Links del Equipo
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Seleccionar Equipo
                  </label>
                  <Select
                    onValueChange={handleTeamSelect}
                    value={selectedTeam?.id.toString() || ''}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar Equipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={team.id.toString()}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedTeam && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Grupo de Novedades
                      </label>
                      <Input
                        type="url"
                        placeholder="URL del grupo de novedades"
                        value={selectedTeam.grupoNovedades || ''}
                        onChange={(e) => setSelectedTeam(prev => prev ? { ...prev, grupoNovedades: e.target.value } : null)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Grupo General del Equipo
                      </label>
                      <Input
                        type="url"
                        placeholder="URL del grupo general del equipo"
                        value={selectedTeam.grupoGeneral || ''}
                        onChange={(e) => setSelectedTeam(prev => prev ? { ...prev, grupoGeneral: e.target.value } : null)}
                      />
                    </div>
                    <div className="col-span-full">
                      <Button
                        onClick={handleTeamLinkUpdate}
                        disabled={!selectedTeam}
                      >
                        Actualizar Links de Equipo
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                <Input
                  type="text"
                  name="apellidoYNombre"
                  value={nomina.apellidoYNombre}
                  onChange={handleChange}
                  placeholder="Apellido y Nombre"
                  required
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
                <Input
                  type="text"
                  name="cargo"
                  value={nomina.cargo}
                  onChange={handleChange}
                  placeholder="Cargo"
                  required
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Equipo</label>
                <Select
                  name="teamId"
                  value={nomina.teamId?.toString() || ''}
                  onValueChange={(value) => handleChange({
                    target: {
                      name: 'teamId',
                      value
                    }
                  } as React.ChangeEvent<HTMLSelectElement>)}
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar Equipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id.toString()}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Servicio</label>
                <Input
                  type="text"
                  name="servicio"
                  value={nomina.servicio}
                  onChange={handleChange}
                  placeholder="Servicio"
                  required
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Usuario Orion</label>
                <Input
                  type="text"
                  name="usuarioOrion"
                  value={nomina.usuarioOrion}
                  onChange={handleChange}
                  placeholder="Usuario Orion"
                  required
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Provincia</label>
                <Input
                  type="text"
                  name="provincia"
                  value={nomina.provincia}
                  onChange={handleChange}
                  placeholder="Provincia"
                  required
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado Actual</label>
                <Input
                  type="text"
                  name="estadoActual"
                  value={nomina.estadoActual}
                  onChange={handleChange}
                  placeholder="Estado Actual"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cuenta</label>
                <Input
                  type="text"
                  name="cuenta"
                  value={nomina.cuenta}
                  onChange={handleChange}
                  placeholder="Cuenta"
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sitio</label>
                <Input
                  type="text"
                  name="site"
                  value={nomina.site}
                  onChange={handleChange}
                  placeholder="Sitio"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Líder</label>
                <Input
                  type="text"
                  name="lider"
                  value={nomina.lider}
                  onChange={handleChange}
                  placeholder="Líder"
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Usuario Salesforce</label>
                <Input
                  type="text"
                  name="usuarioSalesforce"
                  value={nomina.usuarioSalesforce}
                  onChange={handleChange}
                  placeholder="Usuario Salesforce"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Modalidad</label>
                <Input
                  type="text"
                  name="modalidad"
                  value={nomina.modalidad}
                  onChange={handleChange}
                  placeholder="Modalidad"
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Ingreso</label>
                <Input
                  type="Time"
                  name="ingreso"
                  value={nomina.ingreso}
                  onChange={handleChange}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Egreso</label>
                <Input
                  type="Time"
                  name="egreso"
                  value={nomina.egreso}
                  onChange={handleChange}
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Box</label>
              <Input
                type="text"
                name="box"
                value={nomina.box}
                onChange={handleChange}
                placeholder="Box"
                className="w-full"
              />
            </div>


            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <Button
                type="submit"
                className="w-full sm:w-auto"
              >
                <Save className="mr-2 h-4 w-4" /> Guardar Miembro
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
              >
                <X className="mr-2 h-4 w-4" /> Cancelar
              </Button>
            </div>
          </form>

          {/* Team Members List */}
          <Card className="mt-4 sm:mt-6">
            <CardHeader className="bg-gray-50 border-b p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-6 h-6 text-primary" />
                <CardTitle className="text-lg sm:text-xl font-semibold text-gray-800">
                  Miembros del Equipo
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {teamMembers.length === 0 ? (
                <div className="text-center text-gray-500 text-sm sm:text-base">
                  No hay miembros en el equipo
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {teamMembers.map((member) => (
                    <Card key={member.id} className="shadow-md">
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-grow pr-2">
                            <p className="font-semibold text-sm sm:text-base text-gray-800 truncate">
                              {member.apellidoYNombre}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600 truncate">
                              {member.cargo} - {member.servicio}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {member.usuarioOrion}
                            </p>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteMember(member.id!)}
                            className="text-xs px-2 py-1"
                          >
                            <Trash2 className="w-3 h-3 mr-1" /> Eliminar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Error and Success Messages */}
          {error && (
            <div className="mt-3 sm:mt-4 flex items-center space-x-2 text-red-500 bg-red-50 p-2 sm:p-3 rounded-md">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="mt-4 flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-md">
              <CheckCircle className="w-5 h-5" />
              <span>{success}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AddMember;