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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const stepLabels = [
  { number: 1, title: "General", description: "Información general" },
  { number: 2, title: "Cliente", description: "Datos del cliente" },
  { number: 3, title: "Responsables", description: "Personas involucradas" },
  { number: 4, title: "Personal", description: "Personal y estándares" },
  { number: 5, title: "Detalles", description: "Detalles del trabajo" },
  { number: 6, title: "Resultados", description: "Conclusiones y observaciones" },
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
    uploadSuccess,
    handleUploadAnother,
    uploadedFiles,
    handleNewReport,
    formHasChanges,
    handleFormChange,
  } = useUploadFormLogic();

  const [showSaveWarning, setShowSaveWarning] = useState(false);

  const form = useForm({
    defaultValues: {
      reportTitle: "",
      cliente: "",
      municipio: "",
      departamento: "",
      codigo: "",
      elaboradoPor: [{ nombre: "", cargo: "", empresa: "Copower" }],
      revisadoPor: [{ nombre: "", cargo: "", empresa: "Copower" }],
      aprobadoPor: [{ nombre: "", cargo: "", empresa: "Copower" }],
      fechaEjecucion: "",
      fechaEmision: "",
      personalPresenteCliente: [{ nombre: "", cargo: "" }],
      objetivo: "",
      centroTransformacion: "",
      activos: [{ nombre: "", pruebas: [] }],
      equipos: [{ marca: "", referencia: "", numeroSerie: "" }],
      personalPresente: [{ nombre: "", cargo: "" }],
      nombreDoc: "",
      desDoc: "",
      conclusiones: [""],
      observaciones: [""],
      recomendaciones: [""],
    },
    onSubmit: async ({ value }) => {
      handleFormSubmit(value);
    },
  });

  // Detectar cambios en el formulario después de subir archivos
  useEffect(() => {
    if (uploadedFiles.length > 0 && formData) {
      const hasChanges = JSON.stringify(form.state.values) !== JSON.stringify(formData);
      handleFormChange(hasChanges);
    }
  }, [form.state.values, formData, uploadedFiles.length]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
      {/* HEADER - Ocupa todo el ancho */}
      <div className="w-full bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-12 py-3 sm:py-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-1">
              Sistema de Gestión de Reportes
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Gestiona tus reportes a través de nuestro proceso de 6 fases
            </p>
          </div>
        </div>
      </div>

      {/* Contenedor con límite de ancho para el contenido */}
      <div className="flex-1 flex flex-col max-w-[95rem] mx-auto w-full">
        {/* INDICADORES DE PASOS */}
        <div className="w-full px-4 sm:px-6 lg:px-12 py-4 sm:py-6">
          <StepIndicator
            stepLabels={stepLabels}
            currentStep={currentStep}
            completedSteps={completedSteps}
            onGoToStep={(step: number) => goToStep(step, form.state.values)}
          />
        </div>

        {/* CONTENIDO */}
        <div className="flex-1 w-full px-4 sm:px-6 lg:px-12 pb-6 sm:pb-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-4 sm:gap-6">
              {/* LEFT COLUMN - MULTI-STEP FORM */}
              <div className="w-full">
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-md border border-slate-200 dark:border-slate-700 rounded-md sm:rounded-lg">
                  <CardContent className="p-4 sm:p-6 lg:p-8">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      form.handleSubmit();
                    }}
                    className="space-y-4 sm:space-y-6"
                  >
                    {/* Contenido de los pasos */}
                    <StepContent form={form} currentStep={currentStep} />
                  </form>

                  {/* Botones de navegación fuera del formulario */}
                  <NavigationButtons
                    currentStep={currentStep}
                    totalSteps={6}
                    onPrev={handlePrevStep}
                    onNext={() => handleNextStep(form.state.values)}
                    onReset={() => handleReset(form.reset)}
                    onSubmit={() => form.handleSubmit()}
                  />
                </CardContent>
              </Card>
            </div>

              {/* RIGHT COLUMN - ZIP UPLOAD */}
              <div className="w-full space-y-4">
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-md border border-slate-200 dark:border-slate-700 rounded-md sm:rounded-lg xl:sticky xl:top-6">
                  <CardContent className="p-4 sm:p-6">
                  {formData && Object.keys(formData).length > 0 ? (
                    <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-md">
                      <p className="text-xs sm:text-sm font-semibold text-green-700 dark:text-green-400 flex items-center gap-2">
                        Formulario completado
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-500 mt-1">Los datos se guardarán junto con el archivo</p>
                    </div>
                  ) : (
                    <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-md">
                      <p className="text-xs sm:text-sm font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-2">
                        Formulario incompleto
                      </p>
                      <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">Completa el formulario antes de subir el archivo</p>
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
                    uploadSuccess={uploadSuccess}
                    onUploadAnother={handleUploadAnother}
                    uploadedFiles={uploadedFiles}
                    onNewReport={() => handleNewReport(form.reset)}
                    formHasChanges={formHasChanges}
                    onShowSaveWarning={() => setShowSaveWarning(true)}
                  />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de advertencia para guardar formulario */}
      <AlertDialog open={showSaveWarning} onOpenChange={setShowSaveWarning}>
        <AlertDialogContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-slate-100">
              ⚠️ Formulario no guardado
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
              Has realizado cambios en el formulario que aún no se han guardado. 
              Debes guardar el formulario (hacer clic en &quot;Guardar&quot; en el paso 6) antes de subir otro archivo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-600">
              Entendido
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                setShowSaveWarning(false);
                goToStep(6, form.state.values);
              }}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Ir a guardar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
