'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, X, Trash2, Edit } from "lucide-react";
import { Session } from "next-auth";
import { useToast } from "@/hooks/use-toast";

moment.locale('es');
const localizer = momentLocalizer(moment);

interface Event {
  id: number;
  title: string;
  description: string;
  start: Date;
  end: Date;
  creatorId: number;
  creatorName: string;
  color: string;
}

interface CalendarComponentProps {
  session: Session | null;
}

const CalendarComponent: React.FC<CalendarComponentProps> = ({ session }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const { toast } = useToast();

  const [newEvent, setNewEvent] = useState<Omit<Event, 'id' | 'creatorId' | 'creatorName'>>({
    title: '',
    description: '',
    start: new Date(),
    end: new Date(),
    color: '#3498db'
  });

  const fetchEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/events');
      if (!response.ok) throw new Error('Error al cargar eventos');
      const data = await response.json();
      setEvents(data.map((event: any) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
      })));
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los eventos",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleEventSelect = (event: Event) => {
    setSelectedEvent(event);
    setIsViewDialogOpen(true);
  };

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    setNewEvent({
      title: '',
      description: '',
      start: slotInfo.start,
      end: slotInfo.end,
      color: '#3498db'
    });
    setIsAddDialogOpen(true);
  };

  const handleAddEvent = async () => {
    if (!newEvent.title || !session?.user?.id) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newEvent,
          creatorId: session.user.id,
        }),
      });

      if (!response.ok) throw new Error('Error al guardar evento');
      
      const savedEvent = await response.json();
      setEvents([...events, savedEvent]);
      setIsAddDialogOpen(false);
      toast({
        title: "Éxito",
        description: "Evento guardado correctamente"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar el evento",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateEvent = async () => {
    if (!selectedEvent) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/events/${selectedEvent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedEvent),
      });

      if (!response.ok) throw new Error('Error al actualizar evento');

      const updatedEvent = await response.json();
      setEvents(events.map(event => 
        event.id === updatedEvent.id ? updatedEvent : event
      ));
      setIsViewDialogOpen(false);
      setIsEditMode(false);
      toast({
        title: "Éxito",
        description: "Evento actualizado correctamente"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el evento",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/events/${selectedEvent.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Error al eliminar evento');

      setEvents(events.filter(event => event.id !== selectedEvent.id));
      setIsViewDialogOpen(false);
      toast({
        title: "Éxito",
        description: "Evento eliminado correctamente"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el evento",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const eventStyleGetter = (event: Event) => ({
    style: {
      backgroundColor: event.color,
      borderRadius: '8px',
      opacity: 0.8,
      color: 'white',
      border: 'none',
      display: 'block'
    }
  });

  return (
    <div className="h-screen p-6 bg-gray-100">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">Calendario de Reuniones</h1>
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-50">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        )}
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 'calc(100vh - 250px)' }}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleEventSelect}
          selectable
          eventPropGetter={eventStyleGetter}
          views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
          className="rounded-lg overflow-hidden"
          messages={{
            today: 'Hoy',
            previous: 'Anterior',
            next: 'Siguiente',
            month: 'Mes',
            week: 'Semana',
            day: 'Día',
            agenda: 'Agenda',
          }}
        />
      </div>

      {/* Add Event Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-white rounded-lg shadow-xl p-6 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold mb-4">Agregar Nuevo Evento</DialogTitle>
          </DialogHeader>
          <button 
            onClick={() => setIsAddDialogOpen(false)}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="Título del evento"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              className="border-2 border-gray-300 rounded-md p-2"
            />
            <Textarea
              placeholder="Descripción del evento"
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              className="border-2 border-gray-300 rounded-md p-2"
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Inicio</label>
                <Input
                  type="datetime-local"
                  value={moment(newEvent.start).format('YYYY-MM-DDTHH:mm')}
                  onChange={(e) => setNewEvent({ ...newEvent, start: new Date(e.target.value) })}
                  className="border-2 border-gray-300 rounded-md p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fin</label>
                <Input
                  type="datetime-local"
                  value={moment(newEvent.end).format('YYYY-MM-DDTHH:mm')}
                  onChange={(e) => setNewEvent({ ...newEvent, end: new Date(e.target.value) })}
                  className="border-2 border-gray-300 rounded-md p-2"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <Input
                type="color"
                value={newEvent.color}
                onChange={(e) => setNewEvent({ ...newEvent, color: e.target.value })}
                className="h-10 p-1"
              />
            </div>
            <Button 
              onClick={handleAddEvent} 
              disabled={isLoading}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Guardar Evento
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View/Edit Event Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="bg-white rounded-lg shadow-xl p-6 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold mb-4">
              {isEditMode ? 'Editar Evento' : 'Detalles del Evento'}
            </DialogTitle>
          </DialogHeader>
          <button 
            onClick={() => {
              setIsViewDialogOpen(false);
              setIsEditMode(false);
            }}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
          {selectedEvent && (
            <div className="grid gap-4 py-4">
              {isEditMode ? (
                <>
                  <Input
                    value={selectedEvent.title}
                    onChange={(e) => setSelectedEvent({ ...selectedEvent, title: e.target.value })}
                    className="border-2 border-gray-300 rounded-md p-2"
                  />
                  <Textarea
                    value={selectedEvent.description}
                    onChange={(e) => setSelectedEvent({ ...selectedEvent, description: e.target.value })}
                    className="border-2 border-gray-300 rounded-md p-2"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="datetime-local"
                      value={moment(selectedEvent.start).format('YYYY-MM-DDTHH:mm')}
                      onChange={(e) => setSelectedEvent({ ...selectedEvent, start: new Date(e.target.value) })}
                      className="border-2 border-gray-300 rounded-md p-2"
                    />
                    <Input
                      type="datetime-local"
                      value={moment(selectedEvent.end).format('YYYY-MM-DDTHH:mm')}
                      onChange={(e) => setSelectedEvent({ ...selectedEvent, end: new Date(e.target.value) })}
                      className="border-2 border-gray-300 rounded-md p-2"
                    />
                  </div>
                  <Input
                    type="color"
                    value={selectedEvent.color}
                    onChange={(e) => setSelectedEvent({ ...selectedEvent, color: e.target.value })}
                    className="h-10 p-1"
                  />
                </>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">{selectedEvent.title}</h3>
                  <p className="text-gray-600">{selectedEvent.description}</p>
                  <div className="text-sm text-gray-500">
                    <p>Inicio: {moment(selectedEvent.start).format('DD/MM/YYYY HH:mm')}</p>
                    <p>Fin: {moment(selectedEvent.end).format('DD/MM/YYYY HH:mm')}</p>
                    <p>Creado por: {selectedEvent.creatorName}</p>
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-2 mt-4">
                {session?.user?.id === selectedEvent.creatorId && (
                  <>
                    {isEditMode ? (
                      <Button
                        onClick={handleUpdateEvent}
                        disabled={isLoading}
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Guardando...
                          </>
                        ) : (
                          'Guardar Cambios'
                        )}
                      </Button>
                    ) : (
                      <>
                        <Button
                          onClick={() => setIsEditMode(true)}
                          className="bg-gray-500 hover:bg-gray-600 text-white"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </Button>
                        <Button
                          onClick={handleDeleteEvent}
                          disabled={isLoading}
                          className="bg-red-500 hover:bg-red-600 text-white"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </Button>
                      </>
                    )}
                  </>
                )}
                {isEditMode && (
                  <Button
                    onClick={() => setIsEditMode(false)}
                    className="bg-gray-500 hover:bg-gray-500 text-white"
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarComponent;