import { responseFromRender } from "@/types";

export async function renderPDF(data: any) {
    try {
        console.log("Enviando a Lambda con payload:", data);
        const response = await fetch('https://e989ua8tf9.execute-api.us-east-1.amazonaws.com/dev/pdf_render', {
            method: 'POST',
            headers:  { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        })
        if (!response.ok) {
            const errorData = await response.json()
            console.error("Respuesta con error desde Lambda:", errorData);
            throw new Error(errorData.error || "Error desconocido")
        }
        const result: responseFromRender = await response.json();
        return result
    } catch (error: any) {
        console.error("Error al comunicarse con la Lambda:", error.message);
        throw error;
        
    }
}