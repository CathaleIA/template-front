//me debe retornar una tabla y un boton para agregar al editor
// debe dejar disponible en el compoenente el "key S3" para que se herede al compoenen que se va a cargar 

import { Button } from "@/components/ui/button";
import { ItemPremitive, ItemQuery, reponse_consult_file } from "@/types"
import { Editor } from "@tiptap/react";
import { useEffect, useState } from "react"

interface CardProps {
    tenant_name: string;
    job_id: string;
    estado: string;
    type: string;
    editor: Editor | null;
}

export default function AnexosToAddEditor({ tenant_name, job_id, estado, type, editor }: CardProps) {
    const [anexosList, setAnexosList] = useState<ItemPremitive[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [archivoBase64, setArchivoBase64] = useState<string | null>(null);
    const [htmlContent, setHtmlContent] = useState("");

    async function getItems(): Promise<ItemPremitive[]> {
        setIsLoading(true)
        try {
            const bodyConsult: ItemQuery = { tenant_name, job_id, estado, type }

            const res = await fetch("/api/item-consult", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                cache: "force-cache",
                body: JSON.stringify(bodyConsult),
            })

            if (!res.ok) throw new Error("Error cargando items")
            const rowData: ItemPremitive[] = await res.json()
            return rowData
        } catch (error) {
            console.error("Error fetching anexos:", error)
            return []
        } finally {
            setIsLoading(false)
        }
    }

    async function FileAbstract(s3Key: string): Promise<reponse_consult_file> {
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

    const fetchFileBase64 = async (s3Key: string) => {
        setIsLoading(true);
        try {
            const data = await FileAbstract(s3Key);
            setArchivoBase64(data.message); // guardamos solo el base64

            if (data.message) {
                const binaryString = atob(data.message);
                const bytes = Uint8Array.from(binaryString, c => c.charCodeAt(0));
                const decodedHtml = new TextDecoder("utf-8").decode(bytes);
                setHtmlContent(decodedHtml);
            }

                if (editor) {
                editor.commands.insertContent(htmlContent);
        }
        } catch (error) {
            console.error("Error loading items:", error)
        } finally {
            setIsLoading(false);
        }
    }


    useEffect(() => {
        getItems().then(setAnexosList)
    }, [tenant_name, job_id, estado, type])

    // Para crear la tabla de anexos debemos como tal colocar {} esto nos permite hacer codigo
    return (
        <div className="border rounded p-4">
            <h3 className="text-lg font-medium mb-4">Anexos Disponibles</h3>
            {isLoading ? (
                <p>Cargando...</p>
            ) : (
                <table className="min-w-full">
                    <thead>
                        <tr>
                            <th className="px-4 py-2 text-left">Nombre</th>
                            <th className="px-4 py-2 text-left">Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {anexosList.map((anexo) => (
                            <tr key={anexo.lote_job_id}>
                                <td className="border px-4 py-2">{anexo.s3_html_path?.split("/").pop()}</td>
                                <td className="border px-4 py-2">
                                    <Button
                                        variant='custom'
                                        size='custom'
                                        color="primary"
                                        onClick={() => fetchFileBase64(anexo.s3_html_path || "")}>Agregar</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    )
}