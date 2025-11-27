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
    <div className="flex justify-between items-start gap-2 p-6 bg-white rounded-xl shadow-md border border-slate-200">
      {stepLabels.map((step, index) => (
        <div key={step.number} className="flex items-center flex-1">
          <div className="flex flex-col items-center w-full">
            {/* Círculo del número */}
            <div
              className={`
                w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold cursor-pointer flex-shrink-0 transition-all shadow-md
                ${
                  currentStep === step.number
                    ? "bg-blue-600 text-white scale-110"
                    : completedSteps.includes(step.number)
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-gray-300 text-gray-600 hover:bg-gray-400"
                }
              `}
              onClick={() => onGoToStep(step.number)}
            >
              {completedSteps.includes(step.number) && step.number < currentStep ? "✓" : step.number}
            </div>

            <div className="text-center mt-3">
              <div
                className={`text-sm font-semibold ${
                  currentStep === step.number
                    ? "text-blue-600"
                    : completedSteps.includes(step.number)
                    ? "text-green-600"
                    : "text-gray-600"
                }`}
              >
                {step.title}
              </div>
              <div className="text-xs text-gray-500 mt-1">{step.description}</div>
            </div>
          </div>

          {/* Línea conectora (no en el último paso) */}
          {index < stepLabels.length - 1 && (
            <div
              className={`h-1 flex-1 mx-2 self-start mt-6 rounded-full transition-all ${
                completedSteps.includes(step.number) ? "bg-green-600" : "bg-gray-300"
              }`}
            />
          )}
        </div>
      ))}
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
    <div className="flex justify-between gap-4 pt-8 border-t border-slate-200 mt-8">
      <Button 
        type="button" 
        variant="outline" 
        onClick={onPrev} 
        disabled={currentStep === 1}
        className="flex items-center gap-2 px-6 py-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        <ChevronLeft className="w-4 h-4" />
        Anterior
      </Button>

      <div className="flex gap-3 ml-auto">
        {currentStep === totalSteps ? (
          <>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onReset}
              className="px-6 py-2 rounded-lg hover:bg-slate-100 transition-all"
            >
              Limpiar
            </Button>
            <Button 
              type="submit" 
              className="px-8 py-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-md transition-all" 
              onClick={onSubmit}
            >
              ✓ Guardar Formulario
            </Button>
          </>
        ) : (
          <Button 
            type="button" 
            onClick={onNext}
            className="px-8 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-md transition-all flex items-center gap-2"
          >
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
