// la creacion de un boton que capture y envie el html a la lambda que genera el pdf
'use client'

import { Button } from '@/components/ui/button'
import { PdfRenderRequest, PdfRenderResponse } from '@/types'
import { Upload } from 'lucide-react'
import { useState } from 'react'

export default function ButtonEventUploadHtmlFile({ reportId, tenantId, poolUserId, fileName, activo }: { reportId: string, tenantId: string, poolUserId: string, fileName: string, activo: string }) {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    async function handleUploadHtmlFile(data: PdfRenderRequest): Promise<PdfRenderResponse> {
        const response = await fetch('/api/update-file-html', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Error desconocido");
        }
        const result: PdfRenderResponse = await response.json();
        return result;
    }
    function toBase64UTF8(str: string): string {
        // Convierte correctamente caracteres UTF-8 (acentos, ñ, etc.) a Base64
        const encoder = new TextEncoder();
        const bytes = encoder.encode(str);
        let binary = "";
        for (let i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    async function onClickUpload(e: any) {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);
        setError(null);
        try {
            const divElement = document.getElementById('Report_PDF_Component');
            if (!divElement) {
                setError("No se encontró el elemento con id 'Report_PDF_Component'");
                setIsLoading(false);
                return;
            }
            const htmlContent = divElement.innerHTML;
            const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8"/>
        </head>
         <div class="container">
        <div id="Report_PDF_Component" class="a4-page">
          ${htmlContent}
        </div>
        </div>
      </html>
    `;


            const base64Html = toBase64UTF8(fullHtml);

            const bodyData: PdfRenderRequest = {
                archivoHtml: base64Html,
                report_id: reportId,
                tenant_id: tenantId,
                poolUserId: poolUserId,
                fileName: fileName,
                activo: activo
            }
            const response = await handleUploadHtmlFile(bodyData);
            setMessage(response.message);
        } catch (err: any) {
            console.error("Error al subir el archivo HTML:", err);
            setError(err.message || "Ocurrió un error al subir el archivo");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div>
            <Button
                variant={"custom"}
                size={"custom"}
                onClick={onClickUpload}
                disabled={isLoading}
                className="w-full rounded-sm bg-purple-600 text-white hover:bg-purple-700"
            >
                {isLoading ? 'Cargando...' : <><Upload className="mr-2 h-4 w-4" />Completar</>}
            </Button>
            {message && <p className="mt-2 text-green-600">{message}</p>}
            {error && <p className="mt-2 text-red-600">{error}</p>}
        </div>
    )
}