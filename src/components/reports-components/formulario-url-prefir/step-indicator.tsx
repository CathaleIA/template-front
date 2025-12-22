import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft } from "lucide-react";

interface StepIndicatorProps {
  stepLabels: Array<{ number: number; title: string; description: string }>;
  currentStep: number;
  completedSteps: number[];
  onGoToStep: (step: number) => void;
}

export function StepIndicator({
  stepLabels,
  currentStep,
  completedSteps,
  onGoToStep,
}: StepIndicatorProps) {
  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-md sm:rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-3 sm:p-4 lg:p-6">
      {/* Vista móvil y tablet pequeño - Solo círculos con scroll */}
      <div className="lg:hidden">
        <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide snap-x snap-mandatory">
          {stepLabels.map((step, index) => (
            <div key={step.number} className="flex items-center flex-shrink-0 snap-center">
              <button
                type="button"
                onClick={() => onGoToStep(step.number)}
                className={`
                  w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold cursor-pointer transition-all
                  ${
                    currentStep === step.number
                      ? "bg-blue-600 text-white scale-110"
                      : completedSteps.includes(step.number)
                      ? "bg-green-500 text-white"
                      : "bg-slate-200 text-slate-500"
                  }
                `}
              >
                <span className="text-sm">{step.number}</span>
              </button>
              {/* Línea conectora pequeña */}
              {index < stepLabels.length - 1 && (
                <div
                  className={`h-0.5 w-6 mx-1 rounded-full flex-shrink-0 ${
                    completedSteps.includes(step.number) ? "bg-green-500" : "bg-slate-300"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        {/* Título del paso actual */}
        <div className="text-center mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{stepLabels[currentStep - 1]?.title}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{stepLabels[currentStep - 1]?.description}</p>
        </div>
      </div>

      {/* Vista desktop - Layout completo con texto */}
      <div className="hidden lg:flex justify-center items-center gap-2 xl:gap-3 overflow-x-auto scrollbar-hide">
        {stepLabels.map((step, index) => (
          <div key={step.number} className="flex items-center flex-shrink-0">
            {/* Botón y texto juntos */}
            <div className="flex items-center gap-2 xl:gap-3">
              {/* Círculo del número */}
              <button
                type="button"
                onClick={() => onGoToStep(step.number)}
                className={`
                  w-11 h-11 xl:w-12 xl:h-12 rounded-full flex items-center justify-center text-sm font-bold cursor-pointer flex-shrink-0 transition-all
                  ${
                    currentStep === step.number
                      ? "bg-blue-600 text-white"
                      : completedSteps.includes(step.number)
                      ? "bg-green-500 text-white hover:bg-green-600"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-600"
                  }
                `}
              >
                {step.number}
              </button>

              {/* Texto al lado del botón */}
              <div className="text-left min-w-0">
                <div
                  className={`text-xs xl:text-sm font-medium truncate max-w-[80px] xl:max-w-none ${
                    currentStep === step.number
                      ? "text-blue-600"
                      : completedSteps.includes(step.number)
                      ? "text-green-600 dark:text-green-400"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {step.title}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[100px] xl:max-w-none hidden xl:block">{step.description}</div>
              </div>
            </div>

            {/* Línea conectora (no en el último paso) */}
            {index < stepLabels.length - 1 && (
              <div
                className={`h-0.5 w-4 xl:w-8 mx-1 xl:mx-2 rounded-full transition-all flex-shrink-0 ${
                  completedSteps.includes(step.number) ? "bg-green-500" : "bg-slate-300"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface NavigationButtonsProps {
  currentStep: number;
  totalSteps: number;
  onPrev: () => void;
  onNext: () => void;
  onReset: () => void;
  onSubmit: () => void;
}

export function NavigationButtons({
  currentStep,
  totalSteps,
  onPrev,
  onNext,
  onReset,
  onSubmit,
}: NavigationButtonsProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-slate-200 dark:border-slate-700 mt-4 sm:mt-6">
      <Button 
        type="button" 
        variant="outline" 
        onClick={onPrev} 
        disabled={currentStep === 1}
        className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all w-full sm:w-auto order-1"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="text-sm sm:text-base">Anterior</span>
      </Button>

      {/* Indicador de paso */}
      <div className="flex items-center justify-center px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 order-3 sm:order-2 w-full sm:w-auto">
        <span className="text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-300">
          Paso {currentStep} de {totalSteps}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 order-2 sm:order-3 w-full sm:w-auto">
        {currentStep === totalSteps ? (
          <>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onReset}
              className="px-4 sm:px-6 py-2.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-all w-full sm:w-auto"
            >
              <span className="text-sm sm:text-base">Limpiar</span>
            </Button>
            <Button 
              type="submit" 
              className="px-6 sm:px-8 py-2.5 rounded-md bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-md transition-all w-full sm:w-auto" 
              onClick={onSubmit}
            >
              <span className="text-sm sm:text-base">Guardar Formulario</span>
            </Button>
          </>
        ) : (
          <Button 
            type="button" 
            onClick={onNext}
            className="px-6 sm:px-8 py-2.5 rounded-md bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-md transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <span className="text-sm sm:text-base">Siguiente</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
