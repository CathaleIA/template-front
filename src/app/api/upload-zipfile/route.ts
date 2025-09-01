import { NextResponse } from "next/server";
import {ZipUploadRequest } from '@/types';
import {serviceUploadZipfile} from  '@/service-report/upload-zipfile';

export async function POST(req: Request) {
    try {
        const reqBody : ZipUploadRequest= await req.json();
        if (!reqBody.tenantName || !reqBody.userPoolId || !reqBody.activo || !reqBody.fileName || !reqBody.file) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }
        const response = await serviceUploadZipfile(reqBody);
        return NextResponse.json(response);
    } catch (error) {
        console.error("Error processing request:", error);
        return NextResponse.json({ error: "Error processing request" }, { status: 500 });
    }
}