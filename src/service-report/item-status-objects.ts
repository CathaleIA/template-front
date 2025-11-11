import { RequestListItemStatusObject, ResponseMessageStatusObject } from '@/types';

export async function ServiceListItemStatusObject(data: RequestListItemStatusObject[]) {
    try {
        const response = await fetch('https://e989ua8tf9.execute-api.us-east-1.amazonaws.com/dev/UpdateItemStatus', {
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
        const result: ResponseMessageStatusObject = await response.json();
        return result;
    } catch (error) {
        console.error('Error fetching item status:', error);
        throw error;
    }
}