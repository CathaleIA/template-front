import { useState } from "react";
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

  const validateStep = async (step: number): Promise<boolean> => {
    const currentSchema = stepSchemas[step as keyof typeof stepSchemas];
    if (!currentSchema) return true;

    const validation = currentSchema.safeParse({
      reportTitle: "",
      codigo: "",
      fechaEjecucion: "",
      fechaEmision: "",
      cliente: "",
      municipio: "",
      departamento: "",
      primerNombre: "",
      segundoNombre: "",
      cargo: "",
      elaboradoPor: [""],
      revisadoPor: [""],
      aprobadoPor: [""],
      objetivo: "",
      alcance: "",
      activos: [{ nombre: "", pruebas: [""] }],
      personalPresente: [""],
      nombreDoc: "",
      desDoc: "",
      nombreEquipo: "",
    });

    if (!validation.success) {
      const errors = validation.error.issues;
      const errorMessages = errors
        .map((e: any) => {
          const fieldPath = Array.isArray(e.path) && e.path.length > 0 ? e.path.join(".") : "campo";
          return `${fieldPath}: ${e.message}`;
        })
        .join("\n");
      toast("❌ Por favor completa todos los campos requeridos", {
        description: errorMessages,
        position: "top-center",
      });
      return false;
    }
    return true;
  };

  const handleNextStep = async (formValues: Record<string, any>) => {
    const isValid = await validateStep(currentStep);
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
      const isValid = await validateStep(currentStep);
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
    const formData = new FormData();
    formData.append("file", fileToUpload);
    formData.append("presignedUrl", presignedUrl);
    const response = await fetch("/api/public/upload", {
      method: "PUT",
      body: formData,
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
    setLoading(true);
    setMessage("Obteniendo URL prefirmada...");
    try {
      const presignedUrl = await getPresignedUrl();
      setMessage("Subiendo archivo...");
      await uploadToS3(presignedUrl, file!);
      setMessage("✅ Archivo subido correctamente");
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
      setSavedValues(formValues);
      try {
        localStorage.setItem("formularioReporte", JSON.stringify(formValues));
      } catch (error) {
        console.error("Error al guardar en localStorage:", error);
      }
      toast("✅ Formulario completado exitosamente", {
        description: "Todos los datos han sido validados y guardados",
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
    handleNextStep,
    handlePrevStep,
    goToStep,
    handleUpload,
    handleFormSubmit,
    handleReset,
  };
}
