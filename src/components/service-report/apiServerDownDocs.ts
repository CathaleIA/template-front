import { reponseDown} from "../../types/typeDownFile";

export async function downloadFile(data: any) {
    try {
        const response = await fetch(' https://e989ua8tf9.execute-api.us-east-1.amazonaws.com/dev/downLoadFile',{
            method : 'POST',
            headers : { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Error desconocido")

        }

        const result : reponseDown = await response.json();
        return result;
    } catch (error : any) {
        console.error("Error al comunicarse con la Lambda reponseDown:", error.message);
        throw error;
    }
}