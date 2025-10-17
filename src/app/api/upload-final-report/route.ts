import { NextResponse } from "next/server";
import {RequestUploadFinalReport } from '@/types';
import {ServiceUploadFinalReport} from  '@/service-report/upload-final-report';

export async function POST(req: Request) {
    try {
        const reqBody : RequestUploadFinalReport= await req.json();
        if (!reqBody.archivoHtml || !reqBody.s3key) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }
        const response = await ServiceUploadFinalReport(reqBody);
        return NextResponse.json(response);
    } catch (error) {
        console.error("Error processing request:", error);
        return NextResponse.json({ error: "Error processing request" }, { status: 500 });
    }
}