import { NextResponse } from "next/server";
import {serviceRender} from "@/components/service-report/apiServerRender";
import { RequestBody } from "@/types";

export async function POST(req:Request) {
    try {
        const body : RequestBody = await req.json();
        
        // Validar que todos los campos estén presentes
        if (!body.activo || !body.tenant || !body.poolUserId || !body.archivoToFront) {
            return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
        }
        // llamdado de del servicio que implementa la conexion con los lambda AWS
        const lambdaResponse = await serviceRender(body);
        return NextResponse.json(lambdaResponse);
    } catch (error: any) {
        console.error("Error al procesar la solicitud:", error.message);
        return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 });
    }
}