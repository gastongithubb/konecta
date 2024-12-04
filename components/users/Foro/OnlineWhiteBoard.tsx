'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { StickyNote, X, PinIcon, Save, CornerRightDown, Palette, Moon, Sun, Sticker } from 'lucide-react';

interface ButtonBaseProps {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  className?: string;
}

type NoteColor = {
  name: string;
  bgColor: string;
  darkBgColor: string;
  textColor: string;
  darkTextColor: string;
};

type NoteType = {
  id: string;
  text: string;
  x: number;
  y: number;
  isPinned: boolean;
  width: number;
  height: number;
  color: NoteColor;
};

type StickerType = {
  id: string;
  content: string;
  x: number;
  y: number;
};

const NOTE_COLORS: NoteColor[] = [
  { 
    name: 'Amarillo',
    bgColor: 'bg-yellow-200',
    darkBgColor: 'dark:bg-yellow-900',
    textColor: 'text-black',
    darkTextColor: 'dark:text-yellow-100'
  },
  {
    name: 'Rosa',
    bgColor: 'bg-pink-200',
    darkBgColor: 'dark:bg-pink-900',
    textColor: 'text-black',
    darkTextColor: 'dark:text-pink-100'
  },
  {
    name: 'Celeste',
    bgColor: 'bg-blue-200',
    darkBgColor: 'dark:bg-blue-900',
    textColor: 'text-black',
    darkTextColor: 'dark:text-blue-100'
  },
  {
    name: 'Verde',
    bgColor: 'bg-green-200',
    darkBgColor: 'dark:bg-green-900',
    textColor: 'text-black',
    darkTextColor: 'dark:text-green-100'
  },
  {
    name: 'Lavanda',
    bgColor: 'bg-purple-200',
    darkBgColor: 'dark:bg-purple-900',
    textColor: 'text-black',
    darkTextColor: 'dark:text-purple-100'
  }
];

// Emojis optimizados para compatibilidad multiplataforma
const STICKER_OPTIONS = [
  // Emociones básicas - alta compatibilidad
  '😊', '😄', '😃', '😉', '😍',
  // Objetos comunes
  '📝', '📌', '📎', '✏️', '📚',
  // Símbolos
  '❤️', '⭐', '✨', '☀️', '🌙',
  // Naturaleza
  '🌺', '🌸', '🍀', '🌿', '🌴',
  // Animales comunes
  '🐱', '🐶', '🐼', '🐨', '🦊',
  // Comida
  '🍎', '🍕', '☕', '🍰', '🍪',
  // Actividades
  '💻', '📱', '✉️', '📞', '🎮',
  // Tiempo y clima
  '⌚', '⏰', '☔', '⛅', '❄️',
  // Transportes
  '🚗', '✈️', '🚲', '🚌', '⛵',
  // Varios
  '💡', '🎵', '🎨', '🎯', '🎪'
];

const DEFAULT_NOTE_COLOR = NOTE_COLORS[0];

const OnlineWhiteboard = () => {
  const { theme, setTheme } = useTheme();
  const [notes, setNotes] = useState<NoteType[]>([]);
  const [stickers, setStickers] = useState<StickerType[]>([]);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [resizingNote, setResizingNote] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
  const whiteboardRef = useRef<HTMLDivElement>(null);

  const saveData = useCallback(() => {
    setSaveStatus('saving');
    try {
      localStorage.setItem('whiteboardNotes', JSON.stringify(notes));
      localStorage.setItem('whiteboardStickers', JSON.stringify(stickers));
      setSaveStatus('saved');
    } catch (error) {
      console.error('Error saving data:', error);
      setSaveStatus('error');
    }
  }, [notes, stickers]);

  useEffect(() => {
    const savedNotes = localStorage.getItem('whiteboardNotes');
    const savedStickers = localStorage.getItem('whiteboardStickers');
    
    if (savedNotes) {
      const parsedNotes = JSON.parse(savedNotes);
      const validatedNotes = parsedNotes.map((note: NoteType) => ({
        ...note,
        color: note.color || DEFAULT_NOTE_COLOR
      }));
      setNotes(validatedNotes);
    }
    if (savedStickers) setStickers(JSON.parse(savedStickers));
  }, []);

  useEffect(() => {
    const saveTimeout = setTimeout(saveData, 1000);
    return () => clearTimeout(saveTimeout);
  }, [notes, stickers, saveData]);

  const addNote = () => {
    const newNote: NoteType = {
      id: Date.now().toString(),
      text: 'Nueva nota',
      x: Math.random() * 80,
      y: Math.random() * 80,
      isPinned: false,
      width: 200,
      height: 200,
      color: DEFAULT_NOTE_COLOR,
    };
    setNotes([...notes, newNote]);
  };

  const addSticker = (content: string) => {
    const newSticker: StickerType = {
      id: Date.now().toString(),
      content,
      x: Math.random() * 80,
      y: Math.random() * 80,
    };
    setStickers([...stickers, newSticker]);
    setShowStickerPicker(false);
  };

  const updateNote = (id: string, newText: string) => {
    setNotes(notes.map(note => 
      note.id === id ? { ...note, text: newText } : note
    ));
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  const deleteSticker = (id: string) => {
    setStickers(stickers.filter(sticker => sticker.id !== id));
  };

  const togglePinNote = (id: string) => {
    setNotes(notes.map(note => 
      note.id === id ? { ...note, isPinned: !note.isPinned } : note
    ));
  };

  const changeNoteColor = (id: string, color: NoteColor) => {
    setNotes(notes.map(note => 
      note.id === id ? { ...note, color: color } : note
    ));
    setShowColorPicker(null);
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItem(id);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (!draggedItem || !whiteboardRef.current) return;

    const whiteboardRect = whiteboardRef.current.getBoundingClientRect();
    const x = ((e.clientX - whiteboardRect.left) / whiteboardRect.width) * 100;
    const y = ((e.clientY - whiteboardRect.top) / whiteboardRect.height) * 100;

    setNotes(notes.map(note => 
      note.id === draggedItem ? { ...note, x, y } : note
    ));

    setStickers(stickers.map(sticker => 
      sticker.id === draggedItem ? { ...sticker, x, y } : sticker
    ));

    setDraggedItem(null);
  };

  const handleResizeStart = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setResizingNote(id);
  };

  const handleResize = useCallback((e: MouseEvent) => {
    if (!resizingNote || !whiteboardRef.current) return;

    const whiteboardRect = whiteboardRef.current.getBoundingClientRect();
    setNotes(prevNotes => prevNotes.map(note => {
      if (note.id === resizingNote) {
        const newWidth = Math.max(200, e.clientX - whiteboardRect.left - (note.x / 100 * whiteboardRect.width));
        const newHeight = Math.max(200, e.clientY - whiteboardRect.top - (note.y / 100 * whiteboardRect.height));
        return { ...note, width: newWidth, height: newHeight };
      }
      return note;
    }));
  }, [resizingNote]);

  const handleResizeEnd = useCallback(() => {
    setResizingNote(null);
  }, []);

  useEffect(() => {
    if (resizingNote) {
      window.addEventListener('mousemove', handleResize);
      window.addEventListener('mouseup', handleResizeEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleResize);
      window.removeEventListener('mouseup', handleResizeEnd);
    };
  }, [resizingNote, handleResize, handleResizeEnd]);

  const ButtonBase: React.FC<ButtonBaseProps> = ({ onClick, children, className = "" }) => (
    <button
      onClick={onClick}
      className={`inline-flex items-center px-4 py-2 rounded-lg transition-all duration-200 
      font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
      hover:bg-opacity-90 hover:shadow-lg ${className}`}
    >
      {children}
    </button>
  );

  return (
    <div className="relative w-full h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden flex flex-col transition-colors duration-200">
      {/* Control Bar */}
      <div className="bg-white dark:bg-gray-800 shadow-md p-4 flex items-center justify-between transition-colors duration-200">
        <div className="flex space-x-3">
          <ButtonBase
            onClick={addNote}
            className="bg-blue-500 text-white hover:bg-blue-600"
          >
            <StickyNote className="mr-2 h-4 w-4" /> Añadir Nota
          </ButtonBase>
          
          <ButtonBase
            onClick={() => setShowStickerPicker(!showStickerPicker)}
            className="bg-green-500 text-white hover:bg-green-600"
          >
            <Sticker className="mr-2 h-4 w-4" /> Añadir Emoji
          </ButtonBase>
          
          <ButtonBase
            onClick={saveData}
            className="bg-purple-500 text-white hover:bg-purple-600"
          >
            <Save className="mr-2 h-4 w-4" /> Guardar
          </ButtonBase>
        </div>

        <div className="flex items-center space-x-4">
          <span className={`transition-colors duration-200 ${
            saveStatus === 'saved' ? 'text-green-500 dark:text-green-400' :
            saveStatus === 'saving' ? 'text-yellow-500 dark:text-yellow-400' :
            'text-red-500 dark:text-red-400'
          }`}>
            {saveStatus === 'saved' ? 'Guardado' :
             saveStatus === 'saving' ? 'Guardando...' :
             'Error al guardar'}
          </span>

          <ButtonBase
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </ButtonBase>
        </div>
      </div>

      {/* Whiteboard Area */}
      <div ref={whiteboardRef} className="flex-grow relative overflow-hidden">
        <div className="absolute inset-0 p-4">
          {/* Notes */}
          {notes.map((note) => (
            <div
              key={note.id}
              className={`absolute p-2 rounded-lg shadow-lg group transition-all duration-200
                ${note.color?.bgColor || DEFAULT_NOTE_COLOR.bgColor}
                ${note.color?.darkBgColor || DEFAULT_NOTE_COLOR.darkBgColor}
                ${note.color?.textColor || DEFAULT_NOTE_COLOR.textColor}
                ${note.color?.darkTextColor || DEFAULT_NOTE_COLOR.darkTextColor}
                ${note.isPinned ? 'cursor-default' : 'cursor-move'}
                hover:shadow-xl`}
              style={{
                left: `${note.x}%`,
                top: `${note.y}%`,
                width: `${note.width}px`,
                height: `${note.height}px`
              }}
              draggable={!note.isPinned}
              onDragStart={(e) => handleDragStart(e, note.id)}
              onDrag={handleDrag}
              onDragEnd={handleDragEnd}
            >
              <textarea
                className={`w-full h-full bg-transparent resize-none focus:outline-none transition-colors duration-200
                  ${note.color?.textColor || DEFAULT_NOTE_COLOR.textColor}
                  ${note.color?.darkTextColor || DEFAULT_NOTE_COLOR.darkTextColor}`}
                value={note.text}
                onChange={(e) => updateNote(note.id, e.target.value)}
              />
              
              {/* Note Controls */}
              <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={() => deleteNote(note.id)}
                  className="p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors duration-200"
                >
                  <X className="h-4 w-4" />
                </button>
                
                <button
                  onClick={() => togglePinNote(note.id)}
                  className={`p-1 rounded-full transition-colors duration-200 text-white
                    ${note.isPinned ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-500 hover:bg-gray-600'}`}
                >
                  <PinIcon className="h-4 w-4" />
                </button>
                
                <button
                  onClick={() => setShowColorPicker(note.id)}
                  className="p-1 rounded-full bg-gray-500 text-white hover:bg-gray-600 transition-colors duration-200"
                >
                  <Palette className="h-4 w-4" />
                </button>
              </div>

              {/* Resize Handle */}
              <div
                className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                onMouseDown={(e) => handleResizeStart(e, note.id)}
              >
                <CornerRightDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </div>

              {/* Color Picker */}
              {showColorPicker === note.id && (
                <div className="absolute top-12 left-2 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-xl z-10 grid grid-cols-5 gap-2 transition-colors duration-200">
                  {NOTE_COLORS.map((color) => (
                    <button
                      key={color.name}
                      className={`w-6 h-6 rounded-full transition-transform duration-200 hover:scale-110 
                        ${color.bgColor} ${color.darkBgColor}`}
                      onClick={() => changeNoteColor(note.id, color)}
                      title={color.name}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Stickers */}
          {stickers.map((sticker) => (
            <div
              key={sticker.id}
              className="absolute cursor-move group"
              style={{ 
                left: `${sticker.x}%`, 
                top: `${sticker.y}%`,
                fontSize: '2rem'
              }}
              draggable
              onDragStart={(e) => handleDragStart(e, sticker.id)}
              onDrag={handleDrag}
              onDragEnd={handleDragEnd}
            >
              <div className="relative group">
                <span className="select-none">{sticker.content}</span>
                <button
                  onClick={() => deleteSticker(sticker.id)}
                  className="absolute -top-2 -right-2 p-1 rounded-full bg-red-500 text-white 
                    hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-all duration-200 
                    transform scale-75 hover:scale-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Emoji Picker Modal */}
      {showStickerPicker && (
        <div className="absolute top-20 left-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl 
          max-w-2xl z-10 transition-colors duration-200 border dark:border-gray-700">
          <div className="grid grid-cols-10 gap-2">
            {STICKER_OPTIONS.map((emoji, index) => (
              <button
                key={index}
                onClick={() => addSticker(emoji)}
                className="text-2xl p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 
                  transition-colors duration-200 focus:outline-none focus:ring-2 
                  focus:ring-blue-500 focus:ring-opacity-50"
                title={`Emoji ${index + 1}`}
              >
                <span className="select-none">{emoji}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OnlineWhiteboard;