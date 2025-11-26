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
    <div className="flex justify-between items-start mb-8 bg-gray-50 p-4 rounded-lg">
      {stepLabels.map((step, index) => (
        <div key={step.number} className="flex items-center flex-1">
          <div className="flex items-center space-x-2 w-full">
            {/* Círculo del número */}
            <div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold cursor-pointer flex-shrink-0 transition-all
                ${
                  currentStep === step.number
                    ? "bg-blue-600 text-white"
                    : completedSteps.includes(step.number)
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-gray-300 text-gray-600 hover:bg-gray-400"
                }
              `}
              onClick={() => onGoToStep(step.number)}
            >
              {completedSteps.includes(step.number) && step.number < currentStep ? "✓" : step.number}
            </div>

            <div className="text-left hidden sm:block">
              <div
                className={`text-xs font-bold ${
                  currentStep === step.number
                    ? "text-blue-600"
                    : completedSteps.includes(step.number)
                    ? "text-green-600"
                    : "text-gray-600"
                }`}
              >
                {step.title}
              </div>
              <div className="text-xs text-gray-500">{step.description}</div>
            </div>
          </div>

          {/* Línea conectora (no en el último paso) */}
          {index < stepLabels.length - 1 && (
            <div className={`h-1 flex-1 mx-2 ${completedSteps.includes(step.number) ? "bg-green-600" : "bg-gray-300"}`} />
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
    <div className="flex justify-between gap-2 pt-4 border-t">
      <Button type="button" variant="outline" onClick={onPrev} disabled={currentStep === 1}>
        <ChevronLeft className="w-4 h-4 mr-2" />
        Anterior
      </Button>
      {currentStep === totalSteps ? (
        <>
          <Button type="button" variant="outline" onClick={onReset}>
            Limpiar
          </Button>
          <Button type="submit" className="bg-green-600 hover:bg-green-700" onClick={onSubmit}>
            Guardar Formulario Completo
          </Button>
        </>
      ) : (
        <Button type="button" onClick={onNext}>
          Siguiente
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      )}
    </div>
  );
}
