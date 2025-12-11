'use client'
import { useForm } from "@tanstack/react-form";
import { useMemo, useState, useEffect } from "react";
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
    formData,
  } = useUploadFormLogic();

  const form = useForm({
    defaultValues: {
      reportTitle: "",
      cliente: "",
      municipio: "",
      departamento: "",
      codigo: "",
      elaboradoPor: [{ nombre: "", cargo: "", empresa: "" }],
      revisadoPor: [{ nombre: "", cargo: "", empresa: "" }],
      aprobadoPor: [{ nombre: "", cargo: "", empresa: "" }],
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="w-full max-w-6xl mx-auto">
        {/* HEADER DEL STEPPER - SUPERIOR */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold mb-3 text-slate-900">Formulario Captura Datos Reporte Final</h1>
          <p className="text-gray-600 text-lg">Completa el formulario a través de nuestro proceso de 5 pasos</p>
        </div>

        {/* INDICADORES DE PASOS - HORIZONTAL */}
        <div className="mb-8">
          <StepIndicator
            stepLabels={stepLabels}
            currentStep={currentStep}
            completedSteps={completedSteps}
            onGoToStep={(step: number) => goToStep(step, form.state.values)}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6">
          {/* LEFT COLUMN - MULTI-STEP FORM */}
          <div className="w-full">
            <Card className="w-full shadow-lg border-0 rounded-xl">
              <CardContent className="p-8">
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
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN - ZIP UPLOAD (FIXED STICKY) */}
          <div className="lg:sticky lg:top-4 lg:h-fit">
            <Card className="shadow-lg border-0 rounded-xl">
              <CardContent className="p-6">
                {formData && Object.keys(formData).length > 0 ? (
                  <div className="mb-4 p-3 bg-green-50 border border-green-300 rounded-lg">
                    <p className="text-sm font-semibold text-green-700 flex items-center gap-2">
                      Formulario completado
                    </p>
                    <p className="text-xs text-green-600 mt-1">Los datos se guardarán junto con el archivo</p>
                  </div>
                ) : (
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-300 rounded-lg">
                    <p className="text-sm font-semibold text-amber-700 flex items-center gap-2">
                      Formulario incompleto
                    </p>
                    <p className="text-xs text-amber-600 mt-1">Completa el formulario antes de subir el archivo</p>
                  </div>
                )}
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
                  isFormCompleted={!!formData && Object.keys(formData).length > 0}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
