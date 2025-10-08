"use client"

import { useEffect, useState } from "react"
import { Button } from "../ui/button";
import { reponse_consult_file } from "@/types/consult-item";
import ConclusionsFormSave from "./formulario-save-concluciones";
import { divToHtml } from "@/utils/reports-utils/dicToHtml";


interface Conclusion {
    id: number
    text: string
}

interface ArchivoProps {
    s3Key?: string;
    reportId?: string;
    tenantId?: string;
    poolUserId?: string;
    fileName?: string;
    activo?: string;
}
// las concluciones las debe guardar tambien en el useEffect
export default function ConclusionsForm({ s3Key, reportId, tenantId, poolUserId, fileName, activo }: ArchivoProps) {
    const [archivoBase64, setArchivoBase64] = useState<string | null>(null);
    const [htmlContent, setHtmlContent] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    async function FileAbstract(): Promise<reponse_consult_file> {
        // const s3Key = `HTML_toGestion/${tenantName}/${userPoolId}/reports/${activo}/${jobid}/${fileName}.${perfix}`;

        const res = await fetch("/api/file-abstract", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ s3Key: s3Key })
        });

        if (!res.ok) throw new Error("Error al obtener el archivo");
        return res.json();
    }

    const fetchFileBase64 = async () => {
        setIsLoading(true);
        try {
            const data = await FileAbstract();
            setArchivoBase64(data.message); // guardamos solo el base64

            if (data.message) {
                const binaryString = atob(data.message);
                const bytes = Uint8Array.from(binaryString, c => c.charCodeAt(0));
                const decodedHtml = new TextDecoder("utf-8").decode(bytes);
                setHtmlContent(decodedHtml);
            }
        } catch (error) {
            console.error("Error loading items:", error)
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchFileBase64(); // se ejecuta al montar
    }, [s3Key]);

    return (
        <div className="flex border">
            <div className="w-2/5 p-4">
                <ConclusionsFormSave reportId={reportId} tenantId={tenantId} poolUserId={poolUserId} fileName={fileName} activo={activo} />

            </div>
            <div
                className="w-3/5 p-4 border-l overflow-y-scroll overflow-x-hidden"
                style={{
                    width: "794px",   // ancho A4
                    height: "1123px", // alto A4
                }}
            >
                {htmlContent ? (
                    <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        Cargando...
                    </div>
                )}
            </div>

        </div>

    )
}
