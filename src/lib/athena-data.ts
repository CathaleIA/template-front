import {
    AthenaClient,
    StartQueryExecutionCommand,
    GetQueryExecutionCommand,
    GetQueryResultsCommand,
    QueryExecutionState
} from "@aws-sdk/client-athena";

const region = process.env.BEDROCK_REGION || process.env.REGION || 'us-east-1';
const bucket = process.env.S3_IOT_BUCKET!;
const athenaClient = new AthenaClient({
    region,
    credentials: {
        accessKeyId: process.env.NEXT_AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.NEXT_AWS_SECRET_ACCESS_KEY!
    }
});

const DATABASE = 'iot_telemetry_db'; // Nombre de tu base de datos en Athena
const TABLE = 'iot_data'; // Nombre de tu tabla
const OUTPUT_LOCATION = `s3://${bucket}/athena-results/`;

/**
 * Ejecuta una consulta SQL en Athena y devuelve los resultados
 */
export async function executeAthenaQuery(sql: string): Promise<any[]> {
    try {
        console.log(`🚀 Executing Athena Query: ${sql}`);

        // 1. Iniciar la consulta
        const params = {
            QueryString: sql,
            QueryExecutionContext: { Database: DATABASE },
            ResultConfiguration: { OutputLocation: OUTPUT_LOCATION },
            WorkGroup: 'primary' // Asegurar que usa el workgroup por defecto
        };
        console.log('🚀 Starting Athena Query with params:', JSON.stringify(params, null, 2));

        const startCommand = new StartQueryExecutionCommand(params);

        const { QueryExecutionId } = await athenaClient.send(startCommand);
        if (!QueryExecutionId) throw new Error('Failed to start Athena query');

        console.log(`🆔 Query ID: ${QueryExecutionId}`);

        // 2. Esperar a que termine
        let status: string | undefined = QueryExecutionState.QUEUED;
        let retries = 0;

        while (status === QueryExecutionState.QUEUED || status === QueryExecutionState.RUNNING) {
            if (retries > 60) throw new Error('Athena query timed out after 30 seconds'); // 60 intentos * 500ms = 30s

            await new Promise(resolve => setTimeout(resolve, 500));
            const statusCommand = new GetQueryExecutionCommand({ QueryExecutionId });
            const { QueryExecution } = await athenaClient.send(statusCommand);

            status = QueryExecution?.Status?.State;
            if (status === QueryExecutionState.FAILED) {
                console.error('❌ Athena Failure Reason:', QueryExecution?.Status?.StateChangeReason);
                throw new Error(`Query failed: ${QueryExecution?.Status?.StateChangeReason}`);
            }
            retries++;
        }

        if (status !== QueryExecutionState.SUCCEEDED) {
        }

        // 3. Obtener resultados
        const resultsCommand = new GetQueryResultsCommand({ QueryExecutionId });
        const { ResultSet } = await athenaClient.send(resultsCommand);

        if (!ResultSet || !ResultSet.Rows || ResultSet.Rows.length <= 1) {
            return []; // Sin resultados (la fila 0 es header)
        }

        // 4. Mapear resultados a JSON limpio
        const headers = ResultSet.Rows[0].Data?.map(col => col.VarCharValue || '') || [];
        const rows = ResultSet.Rows.slice(1).map(row => {
            const rowData: any = {};
            row.Data?.forEach((col, index) => {
                const header = headers[index];
                let value = col.VarCharValue;

                // Intentar convertir números
                if (value && !isNaN(Number(value))) {
                    rowData[header] = Number(value);
                } else {
                    rowData[header] = value;
                }
            });
            return rowData;
        });

        console.log(`✅ Athena returned ${rows.length} rows`);
        return rows;

    } catch (error) {
        console.error('❌ Athena Query Error:', error);
        throw error;
    }
}

/**
 * Genera el SQL para crear la tabla (para que el usuario lo corra)
 */
export function getDDLScript(): string {
    return `
CREATE DATABASE IF NOT EXISTS ${DATABASE};

CREATE EXTERNAL TABLE IF NOT EXISTS ${DATABASE}.${TABLE} (
  timestamp string,
  device_id string,
  device_type string,
  data struct<
    generator: struct<
      voltage_L1_N:struct<value:float,timestamp:string>,
      voltage_L2_N:struct<value:float,timestamp:string>,
      voltage_L3_N:struct<value:float,timestamp:string>,
      corriente_L1:struct<value:float,timestamp:string>,
      corriente_L2:struct<value:float,timestamp:string>,
      corriente_L3:struct<value:float,timestamp:string>,
      frecuencia:struct<value:float,timestamp:string>,
      potencia_activa:struct<value:float,timestamp:string>
    >,
    cylinders: struct<
      Tem_Cyl_1:struct<value:float,timestamp:string>,
      Tem_Cyl_2:struct<value:float,timestamp:string>,
      Tem_Cyl_3:struct<value:float,timestamp:string>,
      Tem_Cyl_10:struct<value:float,timestamp:string>,
      Promedio_tem_cyl:struct<value:float,timestamp:string>
    >,
    oil_system: struct<
      Temperatura_aceite:struct<value:float,timestamp:string>,
      Presion_aceite:struct<value:float,timestamp:string>
    >,
    cooling_system: struct<
      T_HT_ENTRADA:struct<value:float,timestamp:string>,
      Temp_LT_salida:struct<value:float,timestamp:string>
    >
  >
)
ROW FORMAT SERDE 'org.openx.data.jsonserde.JsonSerDe'
LOCATION 's3://${bucket}/telemetry/'
TBLPROPERTIES ('has_encrypted_data'='false');
    `.trim();
}
