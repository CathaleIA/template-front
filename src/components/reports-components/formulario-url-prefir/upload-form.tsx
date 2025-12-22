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
  } = useUploadFormLogic();

  const form = useForm({
    defaultValues: {
      // ⚠️ DATOS DE PRUEBA - RECORDAR BORRAR DESPUÉS ⚠️
      reportTitle: "Reporte de Inspección Técnica Motor Principal",
      cliente: "Empresa Industrial XYZ S.A.S.",
      municipio: "Medellín",
      departamento: "Antioquia",
      codigo: "RPT-2025-001",
      elaboradoPor: [{ 
        nombre: "Juan Carlos Pérez", 
        cargo: "Ingeniero Eléctrico", 
        empresa: "COPOWER S.A.S." 
      }],
      revisadoPor: [{ 
        nombre: "María Fernanda López", 
        cargo: "Ingeniera Senior", 
        empresa: "COPOWER S.A.S." 
      }],
      aprobadoPor: [{ 
        nombre: "Carlos Alberto Gómez", 
        cargo: "Director Técnico", 
        empresa: "COPOWER S.A.S." 
      }],
      fechaEjecucion: "2025-12-15",
      fechaEmision: "2025-12-19",
      primerNombre: "Roberto",
      segundoNombre: "Andrés",
      cargo: "Gerente de Mantenimiento",
      alcance: "Inspección completa del motor principal incluyendo análisis de vibración, termografía y análisis de aceite. Evaluación del estado general de los componentes críticos.",
      objetivo: "Determinar el estado actual del motor principal y recomendar acciones correctivas y preventivas para garantizar su operación segura y eficiente.",
      centroTransformacion: "12345",
      activos: [{ 
        nombre: "Motor Principal ABB 500HP", 
        pruebas: ["Análisis de Vibración", "Termografía Infrarroja", "Análisis de Aceite"] 
      }],
      equipos: [{
        marca: "Fluke",
        referencia: "810",
        numeroSerie: "FLK-810-001"
      }, {
        marca: "FLIR",
        referencia: "E75",
        numeroSerie: "E75-2025-123"
      }],
      personalPresente: ["Pedro Martínez - Operador de Planta", "Ana Jiménez - Coordinadora de Mantenimiento"] as string[],
      nombreDoc: "IEEE 43-2013",
      desDoc: "Práctica recomendada IEEE para la prueba de resistencia de aislamiento de maquinaria rotativa",
      nombreEquipo: "Analizador de vibración Fluke 810, Cámara termográfica FLIR E75, Kit de análisis de aceite",
      conclusiones: "",
      observaciones: "",
      recomendaciones: "",
      // ⚠️ FIN DATOS DE PRUEBA ⚠️
    },
    onSubmit: async ({ value }) => {
      handleFormSubmit(value);
    },
  });

  return (
    <div className="h-full w-full bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100 overflow-auto">
      {/* HEADER - Ocupa todo el ancho */}
      <div className="w-full bg-white border-b border-slate-200 shadow-sm">
        <div className="px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 mb-1 sm:mb-2">
              Sistema de Gestión de Reportes
            </h1>
            <p className="text-sm sm:text-base text-slate-600">
              Gestiona tus reportes a través de nuestro proceso de 6 fases
            </p>
          </div>
        </div>
      </div>

      {/* INDICADORES DE PASOS - Ocupa todo el ancho */}
      <div className="w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        <StepIndicator
          stepLabels={stepLabels}
          currentStep={currentStep}
          completedSteps={completedSteps}
          onGoToStep={(step: number) => goToStep(step, form.state.values)}
        />
      </div>

      {/* CONTENIDO - Centrado y más compacto */}
      <div className="w-full px-3 sm:px-6 lg:px-8 pb-6 sm:pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-4 sm:gap-6">
            {/* LEFT COLUMN - MULTI-STEP FORM */}
            <div className="w-full">
              <Card className="bg-white shadow-md border border-slate-200 rounded-md sm:rounded-lg">
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
            <div className="w-full">
              <Card className="bg-white shadow-md border border-slate-200 rounded-md sm:rounded-lg xl:sticky xl:top-6">
                <CardContent className="p-4 sm:p-6">
                {formData && Object.keys(formData).length > 0 ? (
                  <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-green-50 border border-green-300 rounded-md">
                    <p className="text-xs sm:text-sm font-semibold text-green-700 flex items-center gap-2">
                      Formulario completado
                    </p>
                    <p className="text-xs text-green-600 mt-1">Los datos se guardarán junto con el archivo</p>
                  </div>
                                ) : (
                  <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-amber-50 border border-amber-300 rounded-md">
                    <p className="text-xs sm:text-sm font-semibold text-amber-700 flex items-center gap-2">
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
    </div>
  );
}
