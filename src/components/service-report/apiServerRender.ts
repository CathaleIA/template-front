import { ApiResponse } from "@/types";

export async function serviceRender(data: any): Promise<ApiResponse>{
    try {

        // almacenamos el cuerpo de arespuesta
        const response = await fetch('https://e989ua8tf9.execute-api.us-east-1.amazonaws.com/dev/normalizar', {
            // cargamos el cuerpo de la solicitud
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Error desconocido")

        }
        // leemos el cuerpo de la respuesta solo una vez
        const result: ApiResponse = await response.json();
        return result
    } catch (error : any) {
        console.error("Error al comunicarse con la Lambda:", error.message);
        throw error;
    }
}