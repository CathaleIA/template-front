import { responseListDocs} from "@/types";

export async function serviceListDosc(data: any) {
    try {
        const response = await fetch(' https://e989ua8tf9.execute-api.us-east-1.amazonaws.com/dev/listDocs',{
            method : 'POST',
            headers : { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Error desconocido")

        }

        const result : responseListDocs = await response.json();
        return result;
    } catch (error : any) {
        console.error("Error al comunicarse con la Lambda listar docs:", error.message);
        throw error;
    }
}