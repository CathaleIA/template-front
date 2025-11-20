import { useState } from "react";

export function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [tenantName, setTenantName] = useState("COPOWER");
  const [userPoolName, setUserPoolName] = useState("David-Gomez");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const PRESIGNED_URL_ENDPOINT =
    process.env.NEXT_PUBLIC_PRESIGNED_URL ||
    "https://e989ua8tf9.execute-api.us-east-1.amazonaws.com/dev/solar-url-prefirmada";

  const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
  const ALLOWED_EXTENSIONS = [".zip"];

  // Validar archivo
  function validateFile(file: File): string | null {
    if (!file) return "Selecciona un archivo";

    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return `Extensión no permitida. Usa: ${ALLOWED_EXTENSIONS.join(", ")}`;
    }

    if (file.size > MAX_FILE_SIZE) {
      return `Archivo muy grande. Máximo: 50MB`;
    }

    return null;
  }

  // Obtener URL prefirmada desde el backend (a través del proxy de Next.js)
  async function getPresignedUrl() {
    if (!tenantName.trim() || !userPoolName.trim()) {
      throw new Error("Tenant y User Pool son requeridos");
    }

    const response = await fetch("/api/public/upload?tenantName=" + encodeURIComponent(tenantName) + "&userPoolName=" + encodeURIComponent(userPoolName), {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("📦 Respuesta del proxy:", data);
    
    if (!data.url) {
      throw new Error("No se encontró URL prefirmada en la respuesta");
    }
    
    console.log("🔗 URL Prefirmada obtenida:", data.url);
    
    return data.url;
  }

  // Subir archivo a través del proxy de Next.js (evita CORS)
  function uploadToS3(presignedUrl: string, file: File) {
    return new Promise<void>((resolve, reject) => {
      console.log("📤 Iniciando carga del archivo:", file.name);
      
      const reader = new FileReader();
      
      reader.onload = () => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", "/api/public/upload", true);
        xhr.setRequestHeader("Content-Type", "application/json");

        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) {
            const progressPercent = Math.round((ev.loaded / ev.total) * 100);
            setProgress(progressPercent);
            console.log(`⏳ Progreso: ${progressPercent}%`);
          }
        };

        xhr.onload = () => {
          console.log("✅ Respuesta del servidor:", xhr.status, xhr.statusText);
          if (xhr.status >= 200 && xhr.status < 300) {
            console.log("🎉 Archivo subido exitosamente!");
            resolve();
          } else {
            try {
              const errorData = JSON.parse(xhr.responseText);
              reject(`Error ${xhr.status}: ${errorData.error || xhr.statusText}`);
            } catch {
              reject(`Error HTTP ${xhr.status}`);
            }
          }
        };

        xhr.onerror = () => {
          console.error("❌ Error en la solicitud");
          reject("Error en la solicitud de red");
        };
        
        xhr.ontimeout = () => {
          console.error("⏱️ Tiempo de espera agotado");
          reject("Tiempo de espera agotado");
        };
        
        // Convertir a base64 para enviar en JSON
        const base64String = (reader.result as string).split(',')[1];
        const payload = JSON.stringify({
          presignedUrl: presignedUrl,
          file: base64String,
          fileName: file.name
        });
        
        console.log("📤 Enviando payload al servidor...");
        xhr.send(payload);
      };
      
      reader.onerror = () => {
        reject("Error al leer el archivo");
      };
      
      reader.readAsDataURL(file);
    });
  }

  // Lógica del botón "Subir"
  async function handleUpload() {
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
  }

  return (
    <div className="p-6 max-w-md mx-auto border rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Subir archivo</h2>

      <div className="space-y-4">
        {/* Zona de arrastrar y soltar */}
        <div
          onDragEnter={() => setDragActive(true)}
          onDragLeave={() => setDragActive(false)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            const droppedFiles = e.dataTransfer.files;
            if (droppedFiles?.[0]) {
              const droppedFile = droppedFiles[0];
              const validationError = validateFile(droppedFile);
              if (validationError) {
                setError(validationError);
                return;
              }
              setFile(droppedFile);
              setError("");
            }
          }}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 bg-gray-50"
          }`}
        >
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
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

          <p className="text-sm font-medium text-gray-900 mb-2">
            Arrastra tu archivo .zip aquí
          </p>
          <p className="text-xs text-gray-500 mb-4">o</p>

          <label>
            <input
              type="file"
              accept=".zip"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  const selectedFile = e.target.files[0];
                  const validationError = validateFile(selectedFile);
                  if (validationError) {
                    setError(validationError);
                    return;
                  }
                  setFile(selectedFile);
                  setError("");
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

        {/* Archivo seleccionado */}
        {file && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm font-medium text-green-900">
              ✓ Archivo seleccionado:
            </p>
            <p className="text-xs text-green-700 mt-1">{file.name}</p>
            <p className="text-xs text-green-600 mt-1">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
            <button
              onClick={() => setFile(null)}
              className="text-xs text-green-600 hover:text-green-800 mt-2 underline"
            >
              Cambiar archivo
            </button>
          </div>
        )}

        {/* Tenant */}
        <div>
          <label className="block text-sm font-medium mb-2">Tenant Name</label>
          <input
            type="text"
            value={tenantName}
            onChange={(e) => setTenantName(e.target.value)}
            disabled={loading}
            className="w-full border rounded p-2"
          />
        </div>

        {/* User Pool */}
        <div>
          <label className="block text-sm font-medium mb-2">User Pool</label>
          <input
            type="text"
            value={userPoolName}
            onChange={(e) => setUserPoolName(e.target.value)}
            disabled={loading}
            className="w-full border rounded p-2"
          />
        </div>

        {/* Botón subir */}
        <button
          onClick={handleUpload}
          disabled={loading || !file}
          className="w-full bg-blue-600 text-white rounded p-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
        >
          {loading ? "Cargando..." : "Subir archivo"}
        </button>

        {/* Progreso */}
        {progress > 0 && (
          <div>
            <div className="w-full bg-gray-200 rounded h-2">
              <div
                className="bg-blue-600 h-2 rounded transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-1">{progress}%</p>
          </div>
        )}

        {/* Errores */}
        {error && <p className="text-red-600 font-medium">{error}</p>}

        {/* Mensajes */}
        {message && <p className="text-green-600">{message}</p>}
      </div>
    </div>
  );
}
