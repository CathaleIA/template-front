import { NextResponse } from 'next/server';
import { getWebReport } from '@/lib/reports-store';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ reportId: string }> }
) {
    const paramsData = await params;
    const reportId = paramsData.reportId;

    if (!reportId) {
        return NextResponse.json({ error: 'Report ID is required' }, { status: 400 });
    }

    try {
        const data = await getWebReport(reportId);

        if (!data) {
            return NextResponse.json({ error: 'Report not found' }, { status: 404 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error in reports API:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
