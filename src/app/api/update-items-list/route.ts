import { NextResponse } from "next/server";
import {RequestListItemStatusObject} from "@/types"
import {ServiceListItemStatusObject} from "@/service-report/item-status-objects"

export async function POST(req: Request) {
    try {
        const body: RequestListItemStatusObject[] = await req.json();
        if (!body || body.length === 0) {
            return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
        }
        const lambdaResponse = await ServiceListItemStatusObject(body);
        return NextResponse.json(lambdaResponse);
    } catch (error) {
         console.error("Error processing request:", error);
        return NextResponse.json({ error: "Error processing request" }, { status: 500 });
    }
}