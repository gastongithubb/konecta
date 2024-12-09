import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm">
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-lg bg-card p-8 shadow-lg">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div className="text-center">
              <h2 className="text-xl font-semibold text-foreground">Cargando...</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Verificando autenticación
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;