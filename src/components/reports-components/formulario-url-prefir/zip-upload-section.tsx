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
    <div className="lg:sticky lg:top-4 lg:self-start h-fit">
      <div className="p-4 border rounded-lg shadow bg-white">
        <h2 className="text-xl font-bold mb-3">Subir archivo ZIP</h2>

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
            className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
              dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50"
            }`}
          >
            <div className="mb-2">
              <svg
                className="mx-auto h-10 w-10 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-12l-3.172-3.172a4 4 0 00-5.656 0L28 12M12 32l3.172-3.172a4 4 0 015.656 0L28 32"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">Arrastra tu archivo .zip aquí</p>
            <p className="text-xs text-gray-500 mb-2">o</p>
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
              <span className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg font-medium cursor-pointer hover:bg-blue-700 transition-colors disabled:opacity-50">
                Seleccionar archivo
              </span>
            </label>
          </div>

          {/* File Info */}
          {file && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm font-medium text-green-900">Archivo seleccionado:</p>
              <p className="text-xs text-green-700 mt-1">{file.name}</p>
              <p className="text-xs text-green-600 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              <button
                onClick={() => {
                  setFile(null);
                  setFileName("");
                }}
                className="text-xs text-green-600 hover:text-green-800 mt-2 underline"
              >
                Cambiar archivo
              </button>
            </div>
          )}

          {/* File Name */}
          {fileName && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <label className="block text-sm font-medium mb-1">Nombre del archivo:</label>
              <p className="text-sm font-mono text-blue-900">{fileName}</p>
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={onUpload}
            disabled={loading || !file || !isFormCompleted}
            className={`w-full text-white rounded p-2 font-medium transition-colors ${
              isFormCompleted 
                ? "bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                : "bg-gray-400 cursor-not-allowed opacity-50"
            }`}
            title={!isFormCompleted ? "Debes completar el formulario primero" : ""}
          >
            {loading ? "Cargando..." : "Subir archivo"}
          </button>

          {/* Progress Bar */}
          {progress > 0 && (
            <div>
              <div className="w-full bg-gray-200 rounded h-2">
                <div className="bg-blue-600 h-2 rounded transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-sm text-gray-600 mt-1">{progress}%</p>
            </div>
          )}

          {/* Messages */}
          {error && <p className="text-red-600 font-medium text-sm">{error}</p>}
          {message && <p className="text-green-600 text-sm">{message}</p>}
        </div>
      </div>
    </div>
  );
}
