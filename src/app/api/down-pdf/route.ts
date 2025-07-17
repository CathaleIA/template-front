import { NextResponse } from "next/server";
import { renderPDF } from "../../../components/service-report/apiServerRenderPDF";
import { requestToRender } from "@/types";
export async function POST(req: Request) {
    try {
        const body: requestToRender = await req.json();
        if (!body.archivoHtml || !body.fileName || !body.poolUserId || !body.report_id || !body.tenant_id) {
            return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
        }
        const lambdaResponse = await renderPDF(body);
        console.log("Body recibido en /api/down-pdf:", body);
        return NextResponse.json(lambdaResponse)
    } catch (error: any) {
        console.error("Error al procesar la solicitud:", error.message);
        return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 });
    }
}