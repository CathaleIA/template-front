import { reponse_consult_file } from "@/types/consult-item";
import Link from "next/link";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";


async function getHtmlContent(html_s3_template: string): Promise<reponse_consult_file> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/file-abstract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ s3Key: html_s3_template }),
        cache: "no-store",
    })

    if (!res.ok) {
        throw new Error("Error cargando archivo HTML")
    }

    return res.json()
}

function decodeHtmlContent(base64Content: string): string {
    try {
        // Decode base64 to get the HTML content
        return atob(base64Content)
    } catch (error) {
        console.error("Error decoding base64 content:", error)
        return "Error al decodificar el contenido HTML"
    }
}

export default async function ItemPage({
    params,
    searchParams,
}: {
    params: Promise<{ job_id: string }>
    searchParams: Promise<{ s3Path: string }>
}) {
    const { job_id } = await params
    const { s3Path } = await searchParams
    console.log("Job ID:", job_id)
    console.log("S3 Path:", s3Path)
    if (!s3Path) {
        return (
            <div className="flex h-full items-center justify-center p-6">
                <p>Error: No se proporcionó la ruta del archivo</p>
                <Link href="/items">
                    <Button>Volver a Items</Button>
                </Link>
            </div>
        )
    }

    try {
        const data = await getHtmlContent(s3Path)
        const htmlContent = decodeHtmlContent(data.message)

        return (
            <ResizablePanelGroup direction="horizontal" className="min-h-[500px] w-full rounded-lg border">
                <ResizablePanel defaultSize={25} minSize={20}>
                    <div className="p-4">
                        <h3 className="font-semibold mb-2">Información del Lote</h3>
                        <p className="text-sm text-muted-foreground">ID: {job_id}</p>
                        <p className="text-sm text-muted-foreground mt-2">Archivo:</p>
                        <p className="text-xs break-all">{s3Path.split("/").pop()}</p>
                        <Link href="/items" className="mt-4 inline-block">
                            <Button size="sm">Volver a Items</Button>
                        </Link>
                    </div>
                </ResizablePanel>

                <ResizableHandle withHandle />

                <ResizablePanel defaultSize={75}>
                    <div className="h-full p-4">
                        <div className="h-full border rounded-md overflow-auto">
                            <div className="p-4 prose max-w-none" dangerouslySetInnerHTML={{ __html: htmlContent }} />
                        </div>
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>
        )
    } catch (error) {
        console.error("Error loading HTML content:", error)
        return (
            <div className="flex h-full items-center justify-center p-6">
                <div className="text-center">
                    <p className="text-red-500 mb-4">Error al cargar el contenido HTML</p>
                    <Link href="/items">
                        <Button>Volver a Items</Button>
                    </Link>
                </div>
            </div>
        )
    }
}
