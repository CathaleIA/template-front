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