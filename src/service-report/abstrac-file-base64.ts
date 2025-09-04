import {consult_item_file, reponse_consult_file} from "@/types";
export async function serviceAbstractFile(data: consult_item_file){
    // esto manda como request y espera un tipo de ItemPremitive[]
    try {
        const response = await fetch('https://e989ua8tf9.execute-api.us-east-1.amazonaws.com/dev/report_AbtracFile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
                  if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Error desconocido")

        }

        const result: reponse_consult_file = await response.json();
        return result
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}