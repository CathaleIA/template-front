import { responseFromRender } from "../../types/typePdfRender";

export async function renderPDF(data: any) {
    try {
        const response = await fetch('https://e989ua8tf9.execute-api.us-east-1.amazonaws.com/dev/pdf_render', {
            method: 'POST',
            headers:  { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        })
        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || "Error desconocido")
        }
        const result: responseFromRender = await response.json();
        return result
    } catch (error: any) {
        console.error("Error al comunicarse con la Lambda:", error.message);
        throw error;
    }
}