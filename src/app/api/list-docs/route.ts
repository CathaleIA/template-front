import { NextResponse } from "next/server";
import { serviceListDosc } from "../../service-report/apiServerListDocs";
import { requestListDocs } from "@/types/typeListDocs";

export async function POST(req: Request) {
    try {
        const body : requestListDocs = await req.json();
        if (!body.tenantName || !body.userPoolid) {
            return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
        }

        const lambdaResponse = await serviceListDosc(body);
        console.log('body de en /api/list-docs');
        return NextResponse.json(lambdaResponse)
    } catch (error: any) {
         console.error("Error al procesar la solicitud:", error.message);
        return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 });
    }
}