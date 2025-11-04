"use client"

import { reponse_consult_file } from "@/types";
import { useState, useEffect } from "react";
import estilosA4 from "@/components/reports-components/dinamic-report/estilos"
import estiloForm from "@/components/reports-components/dinamic-report/EstilosFormFinal"
import tiptapTableStyles from "@/components/reports-components/dinamic-report/StyleTableTipTap"
import { Button } from "@/components/ui/button";
//Aca esta la logica trae el archivo de s3
// Limpia y formatea el archivo internamente para los estilos
// Llama al end point creado en API TS para hacer el PDF
// GUARDAMOS y DESCARGAMOS

interface FinalReportProps {
    job_id: string;
    activo: string;


}
export default function CreateFinalReportFile({ job_id, activo }: FinalReportProps) {
    const [tenantName, setTenantName] = useState<string>("")
    const [userPoolId, setUserPoolId] = useState<string>("")
    const [error, setError] = useState<string>("")
    const [isLoading, setIsLoading] = useState(false)
    const [htmlContent, setHtmlContent] = useState("")

    // 🔹 Función auxiliar: decodifica los bloques de anexos
    const decodeRawHtmlBlocks = (html: string) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        doc.querySelectorAll("div[data-raw-html]").forEach((div) => {
            const encoded = div.getAttribute("data-raw-html");
            if (encoded) {
                const decoded = decodeURIComponent(encoded);
                div.outerHTML = decoded; // Reemplaza el div por el HTML real
            }
        });

        return doc.documentElement.outerHTML;
    };

    // traemos los datos de las Cookis osea Tennant y UserPoolId
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


    // Constula y Limpieza de Archivo de S3

    const archivoHtml = async () => {
        setIsLoading(true);

        try {
            const s3Key = `FINALREPORTS/${tenantName}/${userPoolId}/${job_id}/${activo}/reporte-final-${job_id}.html`;

            const res = await fetch("/api/file-abstract", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ s3Key }),
            });

            if (!res.ok) throw new Error("Error al obtener el archivo");

            const data: reponse_consult_file = await res.json();
            if (!data.message) throw new Error("Archivo vacío o no encontrado");

            const binaryString = atob(data.message);
            const bytes = Uint8Array.from(binaryString, (c) => c.charCodeAt(0));
            const decodedHtml = new TextDecoder("utf-8").decode(bytes);
            setHtmlContent(decodedHtml);

            const cleanedHtml = decodeRawHtmlBlocks(decodedHtml);

            const combinedStyles = `\n${tiptapTableStyles}\n${estilosA4}\n${estiloForm}\n`;

            const pdfResponse = await fetch("/api/pdf-generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    html: cleanedHtml,
                    styles: combinedStyles,
                }),
            });

            if (!pdfResponse.ok) throw new Error("Error generando el PDF");

            // 🔹 Descargamos el PDF
            const blob = await pdfResponse.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `reporte-final-${job_id}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error("Error loading file:", error);
            setError("No se pudo cargar el archivo");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Button
            variant={"custom"}
            size={"custom"}
            onClick={archivoHtml}
            disabled={isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded"
        >
            {isLoading ? "Generando PDF..." : "Generar Reporte PDF"}
        </Button>
    )
}