import { useState, useCallback, useEffect } from "react";
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
  const [tenantName, setTenantName] = useState("");
  const [userPoolName, setUserPoolName] = useState("");
  const [fileName, setFileName] = useState("");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [formData, setFormData] = useState<Record<string, any> | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; timestamp: Date }>>([]);
  const [formHasChanges, setFormHasChanges] = useState(false);
  const [logoCliente, setLogoCliente] = useState<{ name: string; size: number; type: string; data: string } | null>(null);

  // Cargar tenantName y userPoolName desde cookies
  useEffect(() => {
    async function fetchTenantData() {
      try {
        const res = await fetch("/api/auth/tenantget");
        const data = await res.json();
        
        if (data?.userPoolDomain && data?.username) {
          setTenantName(data.userPoolDomain);
          setUserPoolName(data.username);
          console.log("Datos de tenant cargados:", { 
            tenantName: data.userPoolDomain, 
            userPoolName: data.username 
          });
        } else {
          console.error("No se encontraron datos de tenant en cookies");
          toast.error("Error", {
            description: "No se encontraron datos de tenant. Intenta recargar la página.",
            position: "top-center",
          });
        }
      } catch (err) {
        console.error("Error obteniendo tenant:", err);
        toast.error("Error", {
          description: "Error al cargar datos de tenant",
          position: "top-center",
        });
      }
    }
    
    fetchTenantData();
  }, []);

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
        conclusiones: "Conclusiones",
        observaciones: "Observaciones",
        recomendaciones: "Recomendaciones",
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
      alert(`CAMPOS REQUERIDOS\n\n${errorMessages}`);
      
      // También mostrar toast como respaldo
      toast("Campos Requeridos", {
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
      if (currentStep < 6) setCurrentStep(currentStep + 1);
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
        console.log("Enviando formulario al backend para obtener URL prefirmada...");
        
        // Asegurar que el logoCliente siempre esté incluido en el formulario
        const formularioConLogo = {
          ...formData,
          logoCliente: formData.logoCliente || logoCliente,
        };
        
        console.log("LogoCliente incluido en el envío:", !!formularioConLogo.logoCliente);
        
        const response = await fetch("/api/public/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tenantName,
            userPoolName,
            fileName,
            formulario: formularioConLogo,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Error ${response.status}`);
        }

        const data = await response.json();
        console.log("Respuesta del backend:", data);

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
        console.error("Error obteniendo URL prefirmada con formulario:", error);
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
  const response = await fetch(presignedUrl, {
    method: "PUT",
    headers: {
      "Content-Type": "application/zip",
    },
    body: fileToUpload,
  });

  if (!response.ok) {
    throw new Error(`Error subiendo a S3: ${response.status}`);
  }

  setProgress(100);
};

  const handleUpload = async () => {
    setError("");
    setMessage("");
    
    // Verificar si el formulario tiene cambios sin guardar
    if (formHasChanges) {
      setError("Debes guardar el formulario antes de subir el archivo");
      toast.error("Formulario modificado", {
        description: "Guarda el formulario nuevamente antes de subir el archivo",
        position: "top-center",
      });
      return;
    }
    
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
      
      // Agregar al historial
      setUploadedFiles(prev => [...prev, { name: file!.name, timestamp: new Date() }]);
      
      // Auto-reset para el siguiente archivo
      setMessage(`${file!.name} subido correctamente`);
      setTimeout(() => {
        setFile(null);
        setFileName("");
        setProgress(0);
        setMessage("");
      }, 2000);
      
      setUploadSuccess(true);
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
        toast("Errores de validación", {
          description: errorMessages,
          position: "top-center",
        });
        return;
      }
      
      // Asegurar que logoCliente esté en el formulario
      const formValuesWithLogo = {
        ...formValues,
        logoCliente: formValues.logoCliente || logoCliente,
      };
      
      // Guardar datos del formulario en estado (solo en memoria, no en localStorage)
      setFormData(formValuesWithLogo);
      setSavedValues(formValuesWithLogo);
      setFormHasChanges(false);
      toast("Formulario completado exitosamente", {
        description: "Ahora puedes subir el archivo ZIP",
        position: "top-center",
      });
    } catch (error) {
      console.error("Error inesperado:", error);
      toast("Error al procesar el formulario", {
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
    setFormData(null);
    setUploadedFiles([]);
    setLogoCliente(null);
  };

  const handleUploadAnother = () => {
    setFile(null);
    setFileName("");
    setProgress(0);
    setMessage("");
    setError("");
    setUploadSuccess(false);
  };

  const handleNewReport = (formReset: () => void) => {
    handleReset(formReset);
    setFile(null);
    setFileName("");
    setProgress(0);
    setMessage("");
    setError("");
    setUploadSuccess(false);
    setLogoCliente(null);
    toast("Formulario reiniciado", {
      description: "Puedes comenzar un nuevo reporte",
      position: "top-center",
    });
  };

  const handleFormChange = (hasChanges: boolean) => {
    setFormHasChanges(hasChanges);
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
    uploadSuccess,
    handleUploadAnother,
    uploadedFiles,
    handleNewReport,
    formHasChanges,
    handleFormChange,
    logoCliente,
    setLogoCliente,
  };
}
