"use client";

import { UploadForm } from "@/components/reports-components/formulario-url-prefir/UploadForm";

export default function UploadTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Prueba de Carga de Archivo
            </h1>
            <p className="text-gray-600">
              Prueba el formulario de carga a S3 con URL prefirmada
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Información</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Tenant por defecto: <strong>COPOWER</strong></li>
              <li>• User Pool por defecto: <strong>David-Gomez</strong></li>
              <li>• Formato permitido: <strong>.zip</strong></li>
              <li>• Tamaño máximo: <strong>500MB</strong></li>
            </ul>
          </div>

          <UploadForm />

          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Cómo funciona:</h3>
            <ol className="space-y-2 text-sm text-gray-700">
              <li>1. Selecciona un archivo válido (.zip)</li>
              <li>2. (Opcional) Modifica Tenant y User Pool</li>
              <li>3. Haz clic en "Subir archivo"</li>
              <li>4. El componente obtiene URL prefirmada desde:</li>
              <li className="ml-4 text-gray-600 font-mono text-xs">
                https://e989ua8tf9.execute-api.us-east-1.amazonaws.com/dev/solar-url-prefirmada
              </li>
              <li>5. El archivo se sube a S3 directamente</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
