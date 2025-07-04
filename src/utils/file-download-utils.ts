/**
 * Función simple para descargar un archivo desde base64
 */
export function downloadBase64File(base64Data: string, fileName: string, mimeType = "application/pdf") {
  try {
    // Limpiar el base64 (remover prefijos si los tiene)
    const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, "")

    // Convertir base64 a bytes
    const byteCharacters = atob(cleanBase64)
    const byteNumbers = new Array(byteCharacters.length)

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }

    // Crear blob
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: mimeType })

    // Crear enlace de descarga
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = fileName

    // Descargar
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Limpiar
    window.URL.revokeObjectURL(url)

    return true
  } catch (error) {
    console.error("Error al descargar:", error)
    return false
  }
}

/**
 * Función para abrir PDF en nueva pestaña
 */
export function openBase64Pdf(base64Data: string) {
  try {
    const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, "")
    const byteCharacters = atob(cleanBase64)
    const byteNumbers = new Array(byteCharacters.length)

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }

    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: "application/pdf" })
    const url = window.URL.createObjectURL(blob)

    window.open(url, "_blank")

    // Limpiar después de un momento
    setTimeout(() => window.URL.revokeObjectURL(url), 1000)

    return true
  } catch (error) {
    console.error("Error al abrir PDF:", error)
    return false
  }
}