// src/utils/reports-utils/htmlTobase.ts

/**
 * Extrae el innerHTML de un div por ID
 * para luego mandarlo al backend y generar el PDF.
 */
export function divToHtml(divId: string): string | null {
  const div = document.getElementById(divId);
  if (!div) {
    console.warn(`No se encontró el div con id "${divId}"`);
    return null;
  }

  console.log("================ HTML CAPTURADO DEL DIV =================");
  console.log(div.innerHTML);

  return div.innerHTML;
}
