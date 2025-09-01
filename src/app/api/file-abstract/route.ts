import { NextResponse } from "next/server";
import { consult_item_file } from "@/types/type-report/consult-item";
import {serviceAbstractFile } from "@/service-report/abstrac-file-base64";

export async function POST(req: Request) {
    const data: consult_item_file = await req.json();
    try {
        if (!data.s3Key) {
            return NextResponse.json({ error: "Falta el s3Key" }, { status: 400 });
        }
        //const result = await serviceAbstractFile(data);
        const result = await serviceAbstractFile(data);
        return NextResponse.json(result);
    } catch (error) {
        console.error("Error in POST /api/file-abstract:", error);
        return NextResponse.error();
    }
}
