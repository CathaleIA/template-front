"use client"

import { useEffect, useState } from "react"
import { reponse_consult_file } from "@/types/consult-item";
import ConclusionsFormSave from "./formulario-save-concluciones";

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
            </div>
            <div
                className="basis-1/3 p-4 border-l"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
        </div>

    )
}
