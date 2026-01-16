import { Upload, FileCheck, X } from "lucide-react";
import { toast } from "sonner";

interface ZipUploadSectionProps {
  file: File | null;
  setFile: (file: File | null) => void;
  tenantName: string;
  setTenantName: (name: string) => void;
  userPoolName: string;
  setUserPoolName: (name: string) => void;
  fileName: string;
  setFileName: (name: string) => void;
  progress: number;
  message: string;
  error: string;
  loading: boolean;
  dragActive: boolean;
  setDragActive: (active: boolean) => void;
  onUpload: () => void;
  validateFile: (file: File) => string | null;
  setError: (error: string) => void;
  isFormCompleted?: boolean;
  uploadSuccess?: boolean;
  onUploadAnother?: () => void;
  uploadedFiles?: Array<{ name: string; timestamp: Date }>;
  onNewReport?: () => void;
  formHasChanges?: boolean;
  logoCliente?: { name: string; size: number; type: string; data: string } | null;
  onLogoClienteChange?: (logo: { name: string; size: number; type: string; data: string } | null) => void;
}

export function ZipUploadSection({
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
  loading,
  dragActive,
  setDragActive,
  onUpload,
  validateFile,
  setError,
  isFormCompleted = false,
  uploadSuccess = false,
  onUploadAnother,
  uploadedFiles = [],
  onNewReport,
  formHasChanges = false,
  onShowSaveWarning,
  logoCliente,
  onLogoClienteChange,
}: ZipUploadSectionProps) {
  const handleFileDrop = (droppedFile: File) => {
    const validationError = validateFile(droppedFile);
    if (validationError) {
      setError(validationError);
      return;
    }
    setFile(droppedFile);
    const nameWithoutExt = droppedFile.name.replace(/\.zip$/i, "");
    setFileName(nameWithoutExt);
    setError("");
  };

  const handleFileSelect = (selectedFile: File) => {
    const validationError = validateFile(selectedFile);
    if (validationError) {
      setError(validationError);
      return;
    }
    setFile(selectedFile);
    const nameWithoutExt = selectedFile.name.replace(/\.zip$/i, "");
    setFileName(nameWithoutExt);
    setError("");
  };

  return (
    <div className="xl:sticky xl:top-4 xl:self-start h-fit">
      <div className="space-y-3">
          {/* Drag & Drop Area */}
          <div
            onDragEnter={() => setDragActive(true)}
            onDragLeave={() => setDragActive(false)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              const droppedFiles = e.dataTransfer.files;
              if (droppedFiles?.[0]) {
                handleFileDrop(droppedFiles[0]);
              }
            }}
            className={`border-2 border-dashed rounded-md p-4 sm:p-6 text-center transition-colors ${
              file 
                ? "border-green-500 bg-green-50 dark:bg-green-900/20" 
                : dragActive 
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                  : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50"
            }`}
          >
            {!file ? (
              <>
                <div className="mb-2 sm:mb-3">
                  <Upload className="mx-auto h-8 w-8 sm:h-10 sm:w-10 text-gray-400 dark:text-gray-500" />
                </div>
                <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Arrastra tu archivo .zip aquí</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">o</p>
                <label>
                  <input
                    type="file"
                    accept=".zip"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleFileSelect(e.target.files[0]);
                      }
                    }}
                    disabled={loading}
                    className="hidden"
                  />
                  <span className="inline-block px-3 py-2 sm:px-4 text-xs sm:text-sm bg-blue-600 text-white rounded font-medium cursor-pointer hover:bg-blue-700 transition-colors disabled:opacity-50">
                    Seleccionar archivo
                  </span>
                </label>
              </>
            ) : (
              <div className="space-y-2">
                <div className="mb-2 sm:mb-3">
                  <FileCheck className="mx-auto h-8 w-8 sm:h-10 sm:w-10 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-xs sm:text-sm font-medium text-green-900 dark:text-green-400">Archivo seleccionado:</p>
                <p className="text-xs sm:text-sm font-semibold text-green-700 dark:text-green-500 truncate px-2" title={file.name}>{file.name}</p>
                <p className="text-xs text-green-600 dark:text-green-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                <button
                  onClick={() => {
                    setFile(null);
                    setFileName("");
                  }}
                  className="text-xs text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 mt-2 underline font-medium"
                >
                  Cambiar archivo
                </button>
              </div>
            )}
          </div>

          {/* File Info - Eliminado porque ahora está integrado arriba */}
          {/* {file && (...)} */}

          {/* Logo del Cliente */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-3 mt-3">
            <div className="space-y-2">
              <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                Logo del Cliente *
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                Carga el logo del cliente - Obligatorio (máx. 20KB)
              </p>
              
              {!logoCliente ? (
                <>
                  <label className="block cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                    onChange={(e) => {
                      const logoFile = e.target.files?.[0];
                      if (!logoFile) return;

                      // Validar tamaño (20KB max)
                      if (logoFile.size > 20480) {
                        alert('El logo debe ser menor a 20KB');
                        return;
                      }

                      // Validar tipo de archivo
                      if (!logoFile.type.startsWith('image/')) {
                        alert('Solo se permiten archivos de imagen');
                        return;
                      }

                      // Convertir a base64
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const base64String = event.target?.result as string;
                        if (onLogoClienteChange) {
                          const logoData = {
                            name: logoFile.name,
                            size: logoFile.size,
                            type: logoFile.type,
                            data: base64String
                          };
                          onLogoClienteChange(logoData);
                        }
                      };
                      reader.readAsDataURL(logoFile);
                    }}
                    className="hidden"
                  />
                    <div className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md hover:border-blue-500 dark:hover:border-blue-400 transition-colors bg-gray-50 dark:bg-gray-800/50">
                      <Upload className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <span className="text-xs sm:text-sm text-gray-900 dark:text-gray-100 font-medium">Seleccionar logo (Requerido)</span>
                    </div>
                  </label>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">Debes cargar el logo antes de subir el archivo</p>
                </>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-md">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <FileCheck className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-green-900 dark:text-green-300 truncate">{logoCliente.name}</p>
                        <p className="text-xs text-green-600 dark:text-green-500">{(logoCliente.size / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onLogoClienteChange && onLogoClienteChange(null)}
                      className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    >
                      <X className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                  <div className="relative w-32 h-32 border border-slate-200 dark:border-slate-700 rounded-md overflow-hidden bg-white dark:bg-slate-900 mx-auto">
                    <img 
                      src={logoCliente.data} 
                      alt="Logo del cliente" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Upload Button */}
          <button
            onClick={() => {
              if (!logoCliente) {
                alert('Debes cargar el logo del cliente antes de subir el archivo');
                return;
              }
              if (formHasChanges) {
                toast.error("Formulario modificado", {
                  description: "Debes guardar el formulario nuevamente antes de subir el archivo",
                  position: "top-center",
                });
                return;
              }
              onUpload();
            }}
            disabled={loading || !file || !isFormCompleted || !logoCliente || formHasChanges}
            className={`w-full text-white rounded-md p-2 sm:p-3 text-sm sm:text-base font-medium transition-colors ${
              isFormCompleted && logoCliente && !formHasChanges
                ? "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                : "bg-gray-400 dark:bg-gray-600 cursor-not-allowed opacity-50"
            }`}
            title={
              !isFormCompleted 
                ? "Debes completar el formulario primero" 
                : !logoCliente 
                  ? "Debes cargar el logo del cliente" 
                  : formHasChanges
                    ? "Debes guardar el formulario nuevamente"
                    : ""
            }
          >
            {loading ? "Cargando..." : "Subir archivo"}
          </button>

          {/* Progress Bar */}
          {progress > 0 && (
            <div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 text-center font-medium">{progress}%</p>
            </div>
          )}

          {/* Messages */}
          {error && <p className="text-red-600 dark:text-red-400 font-medium text-xs sm:text-sm break-words">{error}</p>}
          {message && <p className="text-green-600 dark:text-green-400 text-xs sm:text-sm break-words">{message}</p>}
          
          {/* Historial de archivos subidos */}
          {uploadedFiles.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Archivos subidos ({uploadedFiles.length})
                </h4>
                {onNewReport && (
                  <button
                    onClick={onNewReport}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium underline"
                  >
                    Nuevo Reporte
                  </button>
                )}
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide">
                {uploadedFiles.map((uploadedFile, index) => (
                  <div
                    key={index}
                    className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-md p-2 sm:p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-green-900 dark:text-green-300 truncate" title={uploadedFile.name}>
                          {uploadedFile.name}
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-500 mt-0.5">
                          {new Date(uploadedFile.timestamp).toLocaleString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
    </div>
  );
}
