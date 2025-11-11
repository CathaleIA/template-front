// ca consultamos la data y hacemos el fetch y retornamos el objeto que es la data
// que posteriormete vamos a adatar al objeto que lee chart.js
import { reponse_consult_file } from "@/types";




export default async function DatosGraficaObjeto(s3Key?: string): Promise<object> {

    async function ArvhicoJson(): Promise<reponse_consult_file> {
        const res = await fetch("/api/file-abstract", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ s3Key: s3Key })
        });

        if (!res.ok) throw new Error("Error al obtener el archivo");
        return res.json();
    }

    const fetchFileBase64 = async()=>{
        try {
            const data = await ArvhicoJson();
            if(data.message){
                
                const decodeJson = atob(data.message);
                const  parser = JSON.parse(decodeJson)
                return parser
            }
        } catch (error) {
            console.error("Error loading items:", error)
        }
    }

    return await fetchFileBase64();
}