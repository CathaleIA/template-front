import { NextResponse } from "next/server";
import {RequestQueryReportsList} from '@/types';
import {ServiceQueryReportList} from "@/service-report/query-reports-list"

export async function POST(req: Request){
    try {
        const body: RequestQueryReportsList = await req.json();

        if (!body.tenantName || !body.userPoolId || !body.status) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const response = await ServiceQueryReportList(body);
        return NextResponse.json(response);
    } catch (error) {
        console.error("Error processing request:", error);
        return NextResponse.json({ error: "Error processing request" }, { status: 500 });
    }
}    
