export function divToBase64(divId: string): string | null {
  const div = document.getElementById(divId);
  if (!div) {
    console.warn(`No se encontró el div con id "${divId}"`);
    return null;
  }

  // Obtiene el HTML interno del div
  const htmlContent = div.innerHTML;

  // Convierte a base64
  const base64 = btoa(unescape(encodeURIComponent(htmlContent)));

  return base64;
}