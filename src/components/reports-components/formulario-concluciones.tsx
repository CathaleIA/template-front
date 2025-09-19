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
}
// las concluciones las debe guardar tambien en el useEffect
export default function ConclusionsForm({ s3Key }: ArchivoProps) {
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
                const decodedHtml = atob(data.message);
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
        <div className="flex flex-row h-[90vh] overflow-y-auto border">
            <div className="basis-2/3 p-4">
                <ConclusionsFormSave />
                <Button onClick={async () => {
                    const html = divToHtml("Report_PDF_Component");
                    if (!html) return;

                    const res = await fetch("/api/pdf-generate", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ html }),
                    });

                    if (!res.ok) {
                        console.error("Error generando PDF");
                        return;
                    }

                    const blob = await res.blob();
                    const url = window.URL.createObjectURL(blob);

                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "reporte.pdf";
                    a.click();

                    window.URL.revokeObjectURL(url);

                }}>Creacion de documento</Button>
            </div>
            <div
                className="basis-1/3 p-4 border-l"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
            />

        </div>

    )
}
