import { NextResponse } from "next/server";
import { downloadFile } from "../../../components/service-report/apiServerDownDocs";
import { requestDown } from "@/types";
export async function POST(req: Request) {
    try {
        const body: requestDown = await req.json();
        if (!body.key || !body.tenantName || !body.userPoolId) {
            return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
        }
        const lambdaResponse = await downloadFile(body);
        console.log("Body recibido en /api/down-file-pdf:", body);
        return NextResponse.json(lambdaResponse)
    } catch (error: any) {
        console.error("Error al procesar la solicitud:", error.message);
        return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 });
    }
}