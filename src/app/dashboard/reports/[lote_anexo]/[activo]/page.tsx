// creacion del compoenente dinamico para descargar  el reporte como tal en pdf
// el reporte no el anexo dado que el reporte es el que se descarga no el anexo
// renderiza todo el contenido del editor y lo envia al endpoint que genera el pdf
'use client'

import { reponse_consult_file } from '@/types'
import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
export default function ReportePage() {
    const params = useParams<{ lote_anexo: string , activo : string }>() // 👈 Tipado para TypeScript
    const id = params.lote_anexo;
    const activo  = params.activo;

    const [tenantName, setTenantName] = useState<string>("")
    const [userPoolId, setUserPoolId] = useState<string>("")
    const [error, setError] = useState<string>("")
    const [reportFinal, setReportFinal] = useState<string>("")
    const [isLoading, setIsLoading] = useState(false)
    const [htmlContent, setHtmlContent] = useState("")

    useEffect(() => {
        async function fetchTenant() {
            try {
                const res = await fetch("/api/auth/tenantget")
                const data = await res.json()
                if (data?.userPoolId && data?.userPoolDomain) {
                    setTenantName(data.userPoolDomain)
                    setUserPoolId(data.userPoolId)
                } else {
                    setError("No se encontraron datos de tenant en cookies")
                }
            } catch (err) {
                console.error("Error obteniendo tenant:", err)
                setError("Error al cargar tenant")
            }
        }
        fetchTenant()
    }, [])


    useEffect(() => {
        if (!tenantName || !userPoolId || !id || !activo) return;

        async function fetchFileBase64() {
            setIsLoading(true);
            try {
                const s3Key = `FINALREPORTS/${tenantName}/${userPoolId}/${id}/${activo}/reporte-final-${id}.html`;

                const res = await fetch("/api/file-abstract", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ s3Key }),
                });

                if (!res.ok) throw new Error("Error al obtener el archivo");

                const data: reponse_consult_file = await res.json();

                if (data.message) {
                    const binaryString = atob(data.message);
                    const bytes = Uint8Array.from(binaryString, (c) => c.charCodeAt(0));
                    const decodedHtml = new TextDecoder("utf-8").decode(bytes);
                    setHtmlContent(decodedHtml);
                }
            } catch (error) {
                console.error("Error loading file:", error);
                setError("No se pudo cargar el archivo");
            } finally {
                setIsLoading(false);
            }
        }

        fetchFileBase64();
    }, [tenantName, userPoolId, id]);


    return (
        <div className="p-4">
            {error ? (
                <div className="text-red-500">{error}</div>
            ) : isLoading ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                    Cargando...
                </div>
            ) : (
                <div
                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                    className="prose max-w-none"
                />
            )}
        </div>
    );
}