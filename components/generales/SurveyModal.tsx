import React, { useState } from 'react';
import { X, Smile, Frown, Meh } from 'lucide-react';
import type { SurveyData } from '@/types/survey';
import { useTheme } from "next-themes";

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

  const getBackgroundColor = () => {
    if (selected) return 'bg-blue-500 dark:bg-blue-600'; 
    
    switch(value) {
      case 1: return 'bg-red-100 hover:bg-red-200 dark:bg-red-900/50 dark:hover:bg-red-800/50';
      case 2: return 'bg-orange-100 hover:bg-orange-200 dark:bg-orange-900/50 dark:hover:bg-orange-800/50';
      case 3: return 'bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/50 dark:hover:bg-yellow-800/50';
      case 4: return 'bg-lime-100 hover:bg-lime-200 dark:bg-lime-900/50 dark:hover:bg-lime-800/50';
      case 5: return 'bg-green-100 hover:bg-green-200 dark:bg-green-900/50 dark:hover:bg-green-800/50';
      default: return 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700';
    }
  };

  const getIconColor = () => {
    if (selected) return 'text-white';
    
    switch(value) {
      case 1: return 'text-red-500 dark:text-red-400';
      case 2: return 'text-orange-500 dark:text-orange-400';
      case 3: return 'text-yellow-500 dark:text-yellow-400';
      case 4: return 'text-lime-500 dark:text-lime-400';
      case 5: return 'text-green-500 dark:text-green-400';
      default: return 'text-gray-500 dark:text-gray-400';
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center p-3 rounded-lg transition-all ${
        selected
          ? 'bg-blue-500 dark:bg-blue-600 text-white scale-105'
          : `${getBackgroundColor()} ${getIconColor()}`
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
  const [feedbackError, setFeedbackError] = useState('');
  const { theme } = useTheme();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!surveyData.feedback.trim()) {
      setFeedbackError('Por favor, comparte como te sientes antes de enviar la encuesta');
      return;
    }
    
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
    if (field === 'feedback') {
      setFeedbackError('');
    }
  };

  const renderQuestionStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              ¿Cómo te sientes hoy?
            </h3>
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
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Califica los siguientes aspectos
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Ambiente laboral', field: 'workEnvironment' },
                { label: 'Bienestar personal', field: 'personalWellbeing' },
                { label: 'Balance trabajo-vida', field: 'workLifeBalance' },
                { label: 'Nivel de estrés', field: 'stressLevel' }
              ].map(({ label, field }) => (
                <div key={field}>
                  <label className="block mb-2 text-gray-700 dark:text-gray-300">
                    {label}
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => updateSurveyData(field as keyof SurveyData, value)}
                        className={`flex-1 py-2 rounded transition-colors ${
                          surveyData[field as keyof SurveyData] === value
                            ? 'bg-blue-500 dark:bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Describi como te sentis en una sola palabra
            </h3>
            <div>
              <textarea
                value={surveyData.feedback}
                onChange={(e) => updateSurveyData('feedback', e.target.value)}
                className={`w-full p-3 border rounded-lg resize-none h-32 
                  bg-white dark:bg-gray-800 
                  text-gray-900 dark:text-gray-100
                  border-gray-300 dark:border-gray-700
                  focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                  placeholder-gray-500 dark:placeholder-gray-400
                  ${feedbackError ? 'border-red-500 dark:border-red-500' : ''}`}
                placeholder="Cuéntanos más sobre cómo te sientes..."
              />
              {feedbackError && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                  {feedbackError}
                </p>
              )}
            </div>
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
    return surveyData.feedback.trim().length > 0;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 dark:bg-black/70 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl transition-colors">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Encuesta de Bienestar
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            aria-label="Cerrar"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {renderQuestionStep()}

          <div className="flex justify-between mt-8">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="px-4 py-2 text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
              >
                Anterior
              </button>
            )}
            
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev + 1)}
                disabled={!canProceed()}
                className="ml-auto px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white 
                  rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 
                  disabled:bg-gray-300 dark:disabled:bg-gray-700 
                  disabled:cursor-not-allowed transition-colors"
              >
                Siguiente
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting || !canProceed()}
                className="ml-auto px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white 
                  rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 
                  disabled:bg-gray-300 dark:disabled:bg-gray-700 
                  disabled:cursor-not-allowed transition-colors"
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