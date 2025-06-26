// definicion de tipos esto conrespecto a request y response

export interface RequestBody {
    activo: string;
    tenant: string;
    poolUserId: string;
    archivoToFront: string; // Base64 del archivo
}

export interface GraficaData {
    title: string;
    xAxisLabel: string;
    yAxisLabel: string;
    rangosEjeY: number[];
    rangosEjeX: number[];
    puntosGraficar: Record<string, number[]>
}

export interface GraficaDataExi {
    title: string;
    xAxisLabel: string;
    yAxisLabel: string;
    puntosEjeX: number[];
    puntosEjeY: number[];
    inflexcion: number;
}

export interface ApiResponse {
    archivoHtml: string;
    report_id: string;
    graficaCNData?: GraficaData;
    graficaRCNData?: GraficaData;
    graficaDataExi?: GraficaDataExi;
    message?: string;
    error?: string;
}

// types/chart.ts
// types/typeReports.ts

