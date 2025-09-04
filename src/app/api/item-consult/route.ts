import { NextResponse } from "next/server";
import { ItemQuery } from "@/types";
import { serviceQueryStatusFile } from "@/service-report/query-estatus";

// desde aca hacemos la peticion como teniamos entendido
export async function POST(req: Request) {
    try {
        const body: ItemQuery = await req.json();

        // Validar que todos los campos requeridos estén presentes
        if (!body.tenant_name || !body.job_id || !body.estado) {
            return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
        }

        const lambdaResponse = await serviceQueryStatusFile(body);
        return NextResponse.json(lambdaResponse);
    } catch (error) {
        console.error("Error al procesar la solicitud:", error);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}