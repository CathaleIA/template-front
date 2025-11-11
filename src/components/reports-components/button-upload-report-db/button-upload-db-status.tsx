import { Button } from "@/components/ui/button";
import { RequestListItemStatusObject, ResponseMessageStatusObject } from "@/types";
import { useState } from "react";

interface ButtonUploadDBStatusProps {
    tenantName: string;
    sortKey: string;
    statusValue: string;
    onSuccess?: (response: ResponseMessageStatusObject) => void;
    onError?: (error: Error) => void;
}

export default function ButtonUploadDBStatus({
    tenantName,
    sortKey,
    statusValue,
    onSuccess,
    onError
}: ButtonUploadDBStatusProps) {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    async function handleUploadStatus(): Promise<void> {
        try {
            setIsLoading(true);

            // Crear el item individual como un array
            const dataToSend: RequestListItemStatusObject[] = [{
                tenantName,
                sortKey,
                statusValue
            }];

            const response = await fetch('/api/update-items-list', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Error desconocido");
            }

            const result: ResponseMessageStatusObject = await response.json();
            
            if (onSuccess) {
                onSuccess(result);
            }

        } catch (error) {
            console.error('Error al actualizar el estado:', error);
            if (onError) {
                onError(error as Error);
            }
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Button
            variant={"custom"}
            size={"custom"}
            onClick={handleUploadStatus}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
            {isLoading ? 'Actualizando...' : 'Actualizar Estado'}
        </Button>
    );
}