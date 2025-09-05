import {RequestQueryReportsList, ResponseQueryReportsList} from "@/types"
export async function ServiceQueryReportList(data: RequestQueryReportsList) {
   try {
           const response = await fetch('https://e989ua8tf9.execute-api.us-east-1.amazonaws.com/dev/report_QueryReportList', {
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
   
           const result: ResponseQueryReportsList[] = await response.json();
           return result
       } catch (error) {
           console.error("Error fetching data:", error);
           throw error;
       }
}
