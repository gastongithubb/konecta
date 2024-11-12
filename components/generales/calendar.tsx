// app/dashboard/manager/calendario/CalendarComponent.tsx

'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, X } from "lucide-react";
import { Session } from "next-auth";

moment.locale('es');
const localizer = momentLocalizer(moment);

interface Event {
  id: number;
  title: string;
  start: Date;
  end: Date;
  creatorId: number;
  creatorName: string;
}

interface CalendarComponentProps {
  session: Session | null
}

const CalendarComponent: React.FC<CalendarComponentProps> = ({ session }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [newEvent, setNewEvent] = useState<Omit<Event, 'id' | 'creatorId' | 'creatorName'>>({
    title: '',
    start: new Date(),
    end: new Date(),
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      const response = await fetch('/api/events');
      if (response.ok) {
        const data = await response.json();
        setEvents(data.map((event: any) => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
        })));
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setNotification({ message: "No se pudieron cargar los eventos. Por favor, intenta de nuevo.", type: 'error' });
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    setNewEvent({
      title: '',
      start: slotInfo.start,
      end: slotInfo.end,
    });
    setIsDialogOpen(true);
  };

  const handleAddEvent = async () => {
    if (newEvent.title && session?.user?.id) {
      setIsLoading(true);
      try {
        const response = await fetch('/api/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...newEvent,
            creatorId: session.user.id,
          }),
        });

        if (response.ok) {
          const savedEvent = await response.json();
          setEvents([...events, savedEvent]);
          setNewEvent({ title: '', start: new Date(), end: new Date() });
          setIsDialogOpen(false);
          setNotification({ message: "El evento se ha guardado correctamente.", type: 'success' });
        } else {
          throw new Error('Failed to save event');
        }
      } catch (error) {
        console.error('Error adding event:', error);
        setNotification({ message: "No se pudo guardar el evento. Por favor, intenta de nuevo.", type: 'error' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const eventStyleGetter = (event: Event) => {
    const style = {
      backgroundColor: '#3498db',
      borderRadius: '8px',
      opacity: 0.8,
      color: 'white',
      border: 'none',
      display: 'block'
    };
    return {
      style: style
    };
  };

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  return (
    <div className="h-screen p-6 bg-gray-100">
      {notification && (
        <div className={`fixed top-4 right-4 p-4 rounded-md shadow-lg ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
          {notification.message}
        </div>
      )}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">Calendario de Reuniones</h1>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 'calc(100vh - 250px)' }}
          onSelectSlot={handleSelectSlot}
          selectable
          eventPropGetter={eventStyleGetter}
          formats={{
            eventTimeRangeFormat: () => '',
          }}
          views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
          className="rounded-lg overflow-hidden"
        />
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white rounded-lg shadow-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold mb-4">Agregar Nuevo Evento</DialogTitle>
          </DialogHeader>
          <button 
            onClick={() => setIsDialogOpen(false)}
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
            <Input
              type="datetime-local"
              value={moment(newEvent.start).format('YYYY-MM-DDTHH:mm')}
              onChange={(e) => setNewEvent({ ...newEvent, start: new Date(e.target.value) })}
              className="border-2 border-gray-300 rounded-md p-2"
            />
            <Input
              type="datetime-local"
              value={moment(newEvent.end).format('YYYY-MM-DDTHH:mm')}
              onChange={(e) => setNewEvent({ ...newEvent, end: new Date(e.target.value) })}
              className="border-2 border-gray-300 rounded-md p-2"
            />
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
    </div>
  );
};

export default CalendarComponent;