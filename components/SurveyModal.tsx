// components/SurveyModal.tsx
'use client';

import React, { useState } from 'react';
import { X, Smile, Frown, Meh } from 'lucide-react';
import type { SurveyData } from '@/types/survey';

interface SurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (surveyData: SurveyData) => Promise<void>;
}

interface EmotionButtonProps {
  value: number;
  selected: boolean;
  onClick: () => void;
  label: string;
}

const EmotionButton: React.FC<EmotionButtonProps> = ({ 
  value, 
  selected, 
  onClick, 
  label 
}) => {
  const getEmotionIcon = () => {
    if (value <= 2) return <Frown className="w-6 h-6" />;
    if (value === 3) return <Meh className="w-6 h-6" />;
    return <Smile className="w-6 h-6" />;
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center p-3 rounded-lg transition-all ${
        selected
          ? 'bg-blue-500 text-white scale-105'
          : 'bg-gray-100 hover:bg-gray-200'
      }`}
    >
      {getEmotionIcon()}
      <span className="text-sm mt-1">{label}</span>
    </button>
  );
};

export const SurveyModal: React.FC<SurveyModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [surveyData, setSurveyData] = useState<SurveyData>({
    moodRating: 0,
    workEnvironment: 0,
    personalWellbeing: 0,
    workLifeBalance: 0,
    stressLevel: 0,
    feedback: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(surveyData);
      onClose();
    } catch (error) {
      console.error('Error al enviar la encuesta:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateSurveyData = (field: keyof SurveyData, value: number | string) => {
    setSurveyData(prev => ({ ...prev, [field]: value }));
  };

  const renderQuestionStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">¿Cómo te sientes hoy?</h3>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <EmotionButton
                  key={value}
                  value={value}
                  selected={surveyData.moodRating === value}
                  onClick={() => updateSurveyData('moodRating', value)}
                  label={
                    value === 1 ? 'Muy mal' :
                    value === 2 ? 'Mal' :
                    value === 3 ? 'Regular' :
                    value === 4 ? 'Bien' :
                    'Muy bien'
                  }
                />
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Califica los siguientes aspectos</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block mb-2">Ambiente laboral</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => updateSurveyData('workEnvironment', value)}
                        className={`flex-1 py-2 rounded ${
                          surveyData.workEnvironment === value
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block mb-2">Bienestar personal</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => updateSurveyData('personalWellbeing', value)}
                        className={`flex-1 py-2 rounded ${
                          surveyData.personalWellbeing === value
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block mb-2">Balance trabajo-vida</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => updateSurveyData('workLifeBalance', value)}
                        className={`flex-1 py-2 rounded ${
                          surveyData.workLifeBalance === value
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block mb-2">Nivel de estrés</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => updateSurveyData('stressLevel', value)}
                        className={`flex-1 py-2 rounded ${
                          surveyData.stressLevel === value
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">¿Hay algo más que quieras compartir?</h3>
            <textarea
              value={surveyData.feedback}
              onChange={(e) => updateSurveyData('feedback', e.target.value)}
              className="w-full p-3 border rounded-lg resize-none h-32"
              placeholder="Cuéntanos más sobre cómo te sientes, qué te preocupa o qué podría mejorar tu bienestar..."
            />
          </div>
        );
    }
  };

  const canProceed = () => {
    if (currentStep === 1) return surveyData.moodRating > 0;
    if (currentStep === 2) {
      return (
        surveyData.workEnvironment > 0 &&
        surveyData.personalWellbeing > 0 &&
        surveyData.workLifeBalance > 0 &&
        surveyData.stressLevel > 0
      );
    }
    return true;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Encuesta de Bienestar</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Cerrar"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {renderQuestionStep()}

          <div className="flex justify-between mt-8">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="px-4 py-2 text-blue-500 hover:text-blue-600"
              >
                Anterior
              </button>
            )}
            
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev + 1)}
                disabled={!canProceed()}
                className="ml-auto px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="ml-auto px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Enviando...' : 'Enviar'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default SurveyModal;