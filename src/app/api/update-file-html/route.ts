import { NextResponse } from "next/server";
import {PdfRenderRequest} from "@/types"
import {ServiceUpdateFileHtml} from "@/service-report/update-file-html"

export async function POST(req: Request) {
    try {
        const body: PdfRenderRequest = await req.json();
        if (!body.activo || !body.archivoHtml || !body.report_id || !body.tenant_id || !body.poolUserId || !body.fileName) {
            return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
        }

       
        const lambdaResponse = await ServiceUpdateFileHtml(body);
        return NextResponse.json(lambdaResponse);
    } catch (error) {
         console.error("Error processing request:", error);
        return NextResponse.json({ error: "Error processing request" }, { status: 500 });
    }
}