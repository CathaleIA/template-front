import {RequestUploadFinalReport} from "@/types"
export async function ServiceUploadFinalReport(data: RequestUploadFinalReport) {
   try {
           const response = await fetch('https://e989ua8tf9.execute-api.us-east-1.amazonaws.com/dev/uploadFinalReport', {
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
   
           const result = await response.json();
           return result
       } catch (error) {
           console.error("Error fetching data:", error);
           throw error;
       }
}
