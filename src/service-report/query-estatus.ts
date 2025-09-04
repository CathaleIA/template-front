import { ItemQuery, ItemPremitive } from "@/types";
export async function serviceQueryStatusFile(data: ItemQuery){
    // esto manda como request y espera un tipo de ItemPremitive[]
    try {
        const response = await fetch('https://e989ua8tf9.execute-api.us-east-1.amazonaws.com/dev/queryfiles', {
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

        const result: ItemPremitive[] = await response.json();
        return result
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}