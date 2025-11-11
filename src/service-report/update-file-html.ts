import { PdfRenderRequest, PdfRenderResponse } from '@/types';

export async function ServiceUpdateFileHtml(data: PdfRenderRequest): Promise<PdfRenderResponse> {
  try {
    // 🔹 Validación previa
    if (!data.report_id || !data.tenant_id || !data.poolUserId || !data.fileName || !data.archivoHtml) {
      throw new Error("Faltan campos obligatorios en la petición");
    }

    // 🔹 Timeout de 20 segundos
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const response = await fetch(
      'https://e989ua8tf9.execute-api.us-east-1.amazonaws.com/dev/UpdateFileHTML',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    // 🔹 Manejo de errores seguro
    const responseText = await response.text();

    if (!response.ok) {
      let message = "Error desconocido";
      try {
        const errorData = JSON.parse(responseText);
        message = errorData.error || message;
      } catch {
        message = responseText || message;
      }
      throw new Error(message);
    }

    // 🔹 Si todo va bien, parsear JSON válido
    const result: PdfRenderResponse = JSON.parse(responseText);
    return result;
  } catch (error: any) {
    console.error('❌ Error en ServiceUpdateFileHtml:', error.message);
    throw error;
  }
}
