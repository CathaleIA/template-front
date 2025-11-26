'use client'
import { useForm } from "@tanstack/react-form";
import { Card, CardContent } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { fullSchema } from "./validation-schemas";
import { StepIndicator, NavigationButtons } from "./step-indicator";
import { StepContent } from "./form-steps";
import { ZipUploadSection } from "./zip-upload-section";
import { useUploadFormLogic } from "./use-upload-form-logic";

const stepLabels = [
  { number: 1, title: "General", description: "Información general" },
  { number: 2, title: "Cliente", description: "Datos del cliente" },
  { number: 3, title: "Responsables", description: "Personas involucradas" },
  { number: 4, title: "Detalles", description: "Detalles del trabajo" },
  { number: 5, title: "Personal", description: "Personal y estándares" },
];

export function UploadForm() {
  const {
    currentStep,
    savedValues,
    completedSteps,
    file,
    setFile,
    tenantName,
    setTenantName,
    userPoolName,
    setUserPoolName,
    fileName,
    setFileName,
    progress,
    message,
    error,
    setError,
    loading,
    dragActive,
    setDragActive,
    validateFile,
    handleNextStep,
    handlePrevStep,
    goToStep,
    handleUpload,
    handleFormSubmit,
    handleReset,
  } = useUploadFormLogic();

  const form = useForm({
    defaultValues: {
      reportTitle: "",
      cliente: "",
      municipio: "",
      departamento: "",
      codigo: "",
      elaboradoPor: [""] as string[],
      revisadoPor: [""] as string[],
      aprobadoPor: [""] as string[],
      fechaEjecucion: "",
      fechaEmision: "",
      primerNombre: "",
      segundoNombre: "",
      cargo: "",
      alcance: "",
      objetivo: "",
      activos: [{ nombre: "", pruebas: [""] }],
      personalPresente: [""] as string[],
      nombreDoc: "",
      desDoc: "",
      nombreEquipo: "",
    },
    onSubmit: async ({ value }) => {
      handleFormSubmit(value);
    },
  });

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 py-4">
      {/* HEADER DEL STEPPER - SUPERIOR */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Formulario Captura Datos Reporte Final</h1>
        <p className="text-gray-600">Completa el formulario a través de nuestro proceso de 5 pasos</p>
      </div>

      {/* INDICADORES DE PASOS - HORIZONTAL */}
      <StepIndicator
        stepLabels={stepLabels}
        currentStep={currentStep}
        completedSteps={completedSteps}
        onGoToStep={(step: number) => goToStep(step, form.state.values)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4">
        {/* LEFT COLUMN - MULTI-STEP FORM */}
        <div className="w-full">
          <Card className="w-full">
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  form.handleSubmit();
                }}
                className="space-y-6"
              >
                {/* Contenido de los pasos */}
                <StepContent form={form} currentStep={currentStep} />

                {/* Botones de navegación */}
                <NavigationButtons
                  currentStep={currentStep}
                  totalSteps={5}
                  onPrev={handlePrevStep}
                  onNext={() => handleNextStep(form.state.values)}
                  onReset={() => handleReset(form.reset)}
                  onSubmit={() => form.handleSubmit()}
                />
              </form>

              {/* Resultado del formulario */}
              {savedValues && Object.keys(savedValues).length > 0 && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
                  <h3 className="font-semibold text-green-800 mb-2">
                    ✅ Formulario completado exitosamente:
                  </h3>
                  <pre className="text-sm text-green-700 overflow-auto max-h-60 bg-white p-3 rounded border border-green-200">
                    {JSON.stringify(savedValues, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN - ZIP UPLOAD (FIXED STATIC) */}
        <ZipUploadSection
          file={file}
          setFile={setFile}
          tenantName={tenantName}
          setTenantName={setTenantName}
          userPoolName={userPoolName}
          setUserPoolName={setUserPoolName}
          fileName={fileName}
          setFileName={setFileName}
          progress={progress}
          message={message}
          error={error}
          loading={loading}
          dragActive={dragActive}
          setDragActive={setDragActive}
          onUpload={handleUpload}
          validateFile={validateFile}
          setError={setError}
        />
      </div>
    </div>
  );
}
