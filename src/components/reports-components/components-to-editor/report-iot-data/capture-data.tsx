// Objetivo de este módulo:
// - Recibir un objeto de datos (props) y construir un TEMPLATE HTML a partir de él
// - Retornar ese TEMPLATE como string
// - Para que luego se envíe a un endpoint (server/Lambda) que convierta HTML -> PDF

// Contrato (inputs/outputs breves):
// - Input: IotReportData (datos del reporte)
// - Output: string (HTML completo y autocontenible) o { html: string } como payload
// - Errores: si faltan campos clave, se usan valores por defecto en el template


// Interfaces para metricas del generador
import {Button} from "@/components/ui/button";
    
	
// Métricas numéricas genéricas para todos los valores numericos
export type NumericMetricas = {
		value: number;
		timestamp: string; // ISO 8601
   };

// Metricas booleanas genéricas para todos los valores booleanos
export type BooleanMetricas = {
		value: boolean;
		timestamp: string; // ISO 8601
   };

   //  * Utility type para extraer las claves de un objeto que tienen estructura de métrica

   




export default function captureData(data: GeneradorMetricas){
	return (
		<Button/>

	)
}