import { useState, useCallback } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { stepSchemas, fullSchema } from "./validation-schemas";

const MAX_FILE_SIZE = 500 * 1024 * 1024;
const ALLOWED_EXTENSIONS = [".zip"];

export function useUploadFormLogic() {
  const [currentStep, setCurrentStep] = useState(1);
  const [savedValues, setSavedValues] = useState({});
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [tenantName, setTenantName] = useState("COPOWER");
  const [userPoolName, setUserPoolName] = useState("David-Gomez");
  const [fileName, setFileName] = useState("");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [formData, setFormData] = useState<Record<string, any> | null>(null);

  const validateFile = (file: File): string | null => {
    if (!file) return "Selecciona un archivo";
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return `Extensión no permitida. Usa: ${ALLOWED_EXTENSIONS.join(", ")}`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `Archivo muy grande. Máximo: 500MB`;
    }
    return null;
  };

  const isStepValid = (step: number, formValues: Record<string, any>): boolean => {
    const currentSchema = stepSchemas[step as keyof typeof stepSchemas];
    if (!currentSchema) return true;

    const validation = currentSchema.safeParse(formValues);
    return validation.success;
  };

  const validateStep = async (step: number, formValues: Record<string, any>): Promise<boolean> => {
    const currentSchema = stepSchemas[step as keyof typeof stepSchemas];
    if (!currentSchema) return true;

    const validation = currentSchema.safeParse(formValues);

    if (!validation.success) {
      const errors = validation.error.issues;
      
      // Map de etiquetas amigables para los campos
      const fieldLabels: Record<string, string> = {
        reportTitle: "Título del Reporte",
        codigo: "Código",
        fechaEjecucion: "Fecha de Ejecución",
        fechaEmision: "Fecha de Emisión",
        cliente: "Cliente",
        municipio: "Municipio",
        departamento: "Departamento",
        primerNombre: "Primer Nombre",
        segundoNombre: "Segundo Nombre",
        cargo: "Cargo",
        elaboradoPor: "Elaborado Por",
        revisadoPor: "Revisado Por",
        aprobadoPor: "Aprobado Por",
        objetivo: "Objetivo",
        alcance: "Alcance",
        activos: "Activos",
        personalPresente: "Personal Presente",
        nombreDoc: "Nombre Estándar",
        desDoc: "Descripción Estándar",
        nombreEquipo: "Equipos Utilizados",
      };

      const errorMessages = errors
        .map((e: any) => {
          let fieldName = "campo desconocido";
          
          if (Array.isArray(e.path) && e.path.length > 0) {
            const firstPath = e.path[0]?.toString() || "";
            fieldName = fieldLabels[firstPath] || firstPath;
          }
          
          return `• ${fieldName}: ${e.message}`;
        })
        .join("\n");

      // Mostrar alerta nativa
      alert(`⚠️ CAMPOS REQUERIDOS\n\n${errorMessages}`);
      
      // También mostrar toast como respaldo
      toast("⚠️ Campos Requeridos", {
        description: errorMessages,
        position: "top-center",
      });
      
      return false;
    }
    return true;
  };

  const handleNextStep = async (formValues: Record<string, any>) => {
    const isValid = await validateStep(currentStep, formValues);
    if (isValid) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      if (currentStep < 5) setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const goToStep = async (step: number, formValues: Record<string, any>) => {
    if (step < currentStep) {
      setCurrentStep(step);
    } else if (step > currentStep) {
      const isValid = await validateStep(currentStep, formValues);
      if (isValid) {
        if (!completedSteps.includes(currentStep)) {
          setCompletedSteps([...completedSteps, currentStep]);
        }
        setCurrentStep(step);
      }
    }
  };

  const getPresignedUrl = async () => {
    if (!tenantName.trim() || !userPoolName.trim() || !fileName.trim()) {
      throw new Error("Tenant, User Pool y Nombre de Archivo son requeridos");
    }
    
    // Si hay formData, enviar todo al backend para que genere la URL
    if (formData) {
      try {
        console.log("📤 Enviando formulario al backend para obtener URL prefirmada...");
        const response = await fetch("/api/public/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tenantName,
            userPoolName,
            fileName,
            formulario: formData,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Error ${response.status}`);
        }

        const data = await response.json();
        console.log("✅ Respuesta del backend:", data);

        // Extraer URL prefirmada de la respuesta
        let presignedUrl = data.url || data.presignedUrl || data.presigned_url;
        
        // Si viene en el campo 'message' (como en tu prueba de Postman)
        if (!presignedUrl && data.message && typeof data.message === "string") {
          const urlMatch = data.message.match(/https?:\/\/[^\s\)]+/);
          presignedUrl = urlMatch ? urlMatch[0] : null;
        }

        if (!presignedUrl) {
          throw new Error("No se encontró URL prefirmada en la respuesta del backend");
        }

        return presignedUrl;
      } catch (error: any) {
        console.error("❌ Error obteniendo URL prefirmada con formulario:", error);
        throw error;
      }
    }

    // Fallback: obtener URL sin formulario (solo tenant/userPool/fileName)
    const url = `/api/public/upload?tenantName=${encodeURIComponent(
      tenantName
    )}&userPoolName=${encodeURIComponent(userPoolName)}&fileName=${encodeURIComponent(fileName)}`;
    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error ${response.status}`);
    }
    const data = await response.json();
    if (!data.url) throw new Error("No se encontró URL prefirmada");
    return data.url;
  };

  const uploadToS3 = async (presignedUrl: string, fileToUpload: File) => {
    const formDataToSend = new FormData();
    formDataToSend.append("file", fileToUpload);
    formDataToSend.append("presignedUrl", presignedUrl);
    
    const response = await fetch("/api/public/upload", {
      method: "PUT",
      body: formDataToSend,
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error ${response.status}: ${errorData.error}`);
    }
    setProgress(100);
  };

  const handleUpload = async () => {
    setError("");
    setMessage("");
    const validationError = validateFile(file!);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    if (!formData) {
      setError("Debe completar y enviar el formulario antes de subir el archivo");
      return;
    }
    
    setLoading(true);
    setMessage("Obteniendo URL prefirmada...");
    try {
      const presignedUrl = await getPresignedUrl();
      setMessage("Subiendo archivo ZIP...");
      await uploadToS3(presignedUrl, file!);
      setMessage("✅ Archivo subido correctamente junto con el formulario");
      setFile(null);
      setProgress(0);
    } catch (err: any) {
      setError(err.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (formValues: Record<string, any>) => {
    try {
      const validation = fullSchema.safeParse(formValues);
      if (!validation.success) {
        const errors = validation.error?.issues || [];
        const errorMessages = errors
          .map((e: any) => {
            const fieldPath = Array.isArray(e.path) && e.path.length > 0 ? e.path.join(".") : "campo";
            return `${fieldPath}: ${e.message}`;
          })
          .join("\n");
        toast("❌ Errores de validación", {
          description: errorMessages,
          position: "top-center",
        });
        return;
      }
      
      // Guardar datos del formulario en estado
      setFormData(formValues);
      setSavedValues(formValues);
      
      try {
        localStorage.setItem("formularioReporte", JSON.stringify(formValues));
      } catch (error) {
        console.error("Error al guardar en localStorage:", error);
      }
      toast("✅ Formulario completado exitosamente", {
        description: "Ahora puedes subir el archivo ZIP",
        position: "top-center",
      });
    } catch (error) {
      console.error("Error inesperado:", error);
      toast("❌ Error al procesar el formulario", {
        description: "Ocurrió un error inesperado",
        position: "top-center",
      });
    }
  };

  const handleReset = (formReset: () => void) => {
    formReset();
    setSavedValues({});
    setCurrentStep(1);
    setCompletedSteps([]);
  };

  return {
    currentStep,
    setCurrentStep,
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
    isStepValid,
    handleNextStep,
    handlePrevStep,
    goToStep,
    handleUpload,
    handleFormSubmit,
    handleReset,
    formData,
  };
}
