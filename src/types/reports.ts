export interface reponseDown {
    fileName : string;
    base64File: string;
}

export interface requestDown{
    userPoolId : string;
    tenantName : string;
    key: string;

}

export interface S3FileInfo{
    key : string;
    size : number;
    lastModified : string;
}

export interface requestListDocs{
    userPoolid : string;
    tenantName : string;
}

export interface responseListDocs{
    mapObjetos : Record<string, S3FileInfo[]>
}

// filtrado de json para PDF

export type PdfFile = {
  key: string
  fileName: string
  size: number
  lastModified: string
}

export interface requestToRender{
    archivoHtml : string;
    report_id : string;
    tenant_id : string;
    poolUserId : string;
    fileName : string;
}

export interface responseFromRender{
    message : string;
}

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