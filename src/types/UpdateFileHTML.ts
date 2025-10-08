// Objeto para actualizar el contenido HTML de un archivo
export interface PdfRenderRequest {
  archivoHtml: string;
  report_id: string;
  tenant_id: string;
  poolUserId: string;
  fileName: string;
  activo: string;
}
export interface PdfRenderResponse {
  message: string;
}   