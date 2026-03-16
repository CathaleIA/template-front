# Documentación Técnica: Arquitectura del Agente Bedrock v2.2

Este documento explica el funcionamiento, la arquitectura y los procedimientos de mantenimiento del Agente de Inteligencia Artificial basado en AWS Bedrock implementado en esta aplicación.

---

## 🚀 Alcance y Capacidades del Agente

El Agente Bedrock es un analista industrial inteligente con las siguientes capacidades activas:

### 1. Naturaleza Conversacional
El bot es capaz de mantener el contexto de la charla. Utiliza el modelo **Claude 3.5 Sonnet** para el razonamiento lógico, permitiendo seguimiento de preguntas y análisis profundo de tendencias.

### 2. Análisis de Datos Históricos (Arquitectura Híbrida)
A diferencia de un LLM estándar, este agente tiene acceso directo al **Data Lake en S3** mediado por Athena.
- **Flujo Optimizado (v2.2)**: El agente principal envía la pregunta en lenguaje natural a la Lambda, la cual utiliza internamente **Claude 3 Haiku** para generar el SQL con filtros de partición en <3 segundos.
- **Capacidades**: Valores máximos, mínimos, promedios, tendencias y correlaciones.

### 3. Generación de Reportes Ejecutivos (Nivel Senior)
Activa el **Protocolo de Reporte Visual** al detectar palabras clave (ej: "informe", "comparativa"):
- **Web Report**: Generá archivos JSON en S3 que se renderizan en `/reports/[id]`.
- **Estructura v2.1**:
    - **KPIs Comparativos**: Muestra Valor Actual vs Valor Anterior, Delta y Tendencia.
    - **Análisis de Causalidad**: Sección dinámica generada por IA para explicar el "por qué" de las variaciones.
    - **Hallazgos y Conclusiones**: Listado de puntos críticos detectados.

### 4. Gestión de Mantenimiento (Action Group v2.0)
El agente ahora puede interactuar con el sistema de mantenimiento:
- Consultar planes (`/getMaintenanceSchedule`).
- Registrar mantenimientos realizados (`/logMaintenance`).
- Programar recordatorios vía correo/EventBridge (`/scheduleMaintenanceReminder`).

---

## 🏗️ Arquitectura General: Hub Híbrido de IA

El sistema opera bajo un modelo de tres niveles para maximizar velocidad y precisión:

1.  **Orquestador (AWS Bedrock Agent - Sonnet 3.5):** Recibe la petición, entiende el contexto y decide qué herramienta usar.
2.  **Motor SQL Interno (Lambda - Haiku 3):** Ubicado dentro de la función Lambda. Su única misión es traducir el lenguaje natural a SQL experto para Athena usando columnas de partición (`year`, `month`, `day`, `hour`).
3.  **Ejecutor de Datos (AWS Athena / S3 / DynamoDB):** Realiza la búsqueda física de los datos, acotada al rango de fechas solicitado gracias al Partition Projection.

---

## ⚡ Componentes Técnicos

### 1. Función Lambda: `IndustrialIoTAgentFunction`
*   **Código:** `src/lib/aws/agent-lambda.ts`
*   **Optimizaciones de Velocidad (Nivel 2 - Partition Projection):**
    - **Partition Projection**: Todas las queries apuntan a `iot_data_v2`. El SQL generado por Haiku incluye `WHERE year='...' AND month='...' AND day='...'`, lo que restringe el escaneo de Athena únicamente a los archivos del periodo solicitado.
    - **Backoff Exponencial reducido**: El polling a Athena arranca en 300 ms (antes 800 ms), ya que las queries particionadas terminan en 1-3 s.
    - **Filtro de Partición en Tiempo Real**: `getRealTimeStatus` filtra por `year/month/day` usando bucle diario de fallback en lugar de un rango de 7 días completo.
    - **Motor SQL Dedicado**: Uso de Haiku para generación de queries ultrarrápidas.

### 2. Orquestador de Chat: `route.ts`
*   **Ubicación:** `src/app/api/agent-chat/route.ts`
*   **Rol:** Gestiona la comunicación entre el frontend y Bedrock.
*   **Cambio Crítico v2.1:** Incluye un conversor de XML a JSON robusto que preserva todos los campos de reportes comparativos y secciones dinámicas de análisis industrial.
*   **Actualización v2.2:** Las instrucciones de reporte indican al agente usar `iot_data_v2` con `GROUP BY year, month, day` en lugar de `substr(timestamp,1,10)`.

### 3. Esquema de Acciones: `agent-action-group-schema.json`
*   **Versión:** OpenAPI 2.0
*   **Acciones (8):** `queryData`, `getRealTimeStatus`, `getThresholds`, `checkThreshold`, `getMaintenanceSchedule`, `logMaintenance`, `scheduleMaintenanceReminder`, `Search` (Knowledge Base).

---

## 🗂️ Estructura de Datos (Amazon S3 + Athena)

**Bucket:** `industrial-iot-snowflake-staging-240435918890`

1.  **`telemetry/`**: Datos crudos de sensores organizados por `YYYY/MM/DD/HH`.
    - **Escala actual (Marzo 2026):** ~1,137,000 archivos JSON · 2.9 GB totales.
    - **Variables Mapeadas (33+)**: Voltajes (L1, L2, L3), Corrientes, Potencia, Frecuencia, 20 Temperaturas de Cilindros, Presión de Aceite y Temperaturas de Enfriamiento.
2.  **`athena-results/`**: Almacén temporal para resultados de Athena.
3.  **`web-reports/`**: Persistencia de reportes JSON generados por la IA.

### Tablas Athena

| Tabla | Particiones | Uso | Datos escaneados por query |
| :--- | :--- | :--- | :--- |
| `iot_data` | ❌ Sin particiones | **Obsoleta** — no usar | ~2,900 MB (tabla completa) |
| `iot_data_v2` | ✅ `year/month/day/hour` (Partition Projection) | **Producción** | ~16 MB (solo el día pedido) |

> [!IMPORTANT]
> **Siempre usar `iot_data_v2`**. La tabla original `iot_data` escanea la totalidad del Data Lake en cada consulta (~1.1 M archivos), causando latencias de 30-90 segundos. `iot_data_v2` con filtros `year/month/day` reduce el escaneo en un **99.5%**, con tiempos de respuesta de Athena de **1-3 segundos**.

### Sintaxis SQL obligatoria con `iot_data_v2`

```sql
-- ✅ CORRECTO: usar columnas de partición en WHERE
SELECT MAX(data.generator.voltage_L1_N.value) AS max_v1
FROM iot_telemetry_db.iot_data_v2
WHERE year='2026' AND month='01' AND day='21';

-- ✅ CORRECTO: GROUP BY por día
SELECT year, month, day, AVG(data.generator.potencia_activa.value) AS avg_power
FROM iot_telemetry_db.iot_data_v2
WHERE year='2026' AND month='01' AND day IN ('20','21','22')
GROUP BY year, month, day;

-- ❌ INCORRECTO: filtrar solo por timestamp string (full scan)
SELECT MAX(data.generator.voltage_L1_N.value)
FROM iot_telemetry_db.iot_data
WHERE timestamp >= '2026-01-21T00:00:00Z';
```

---

## 🛠️ Mantenimiento para Desarrolladores

| Para cambiar... | Archivo a modificar | Método de actualización |
| :--- | :--- | :--- |
| Tono o lógica de extracción | `src/app/api/agent-chat/route.ts` | Git Push (Amplify) |
| Lógica SQL o Mantenimiento | `src/lib/aws/agent-lambda.ts` | Script `update_agent_v2.ps1` |
| Definición de API | `agent-action-group-schema.json` | Script `update_agent_v2.ps1` |
| Estética de Reportes | `web-report-viewer.tsx` | Git Push (Amplify) |
| Instrucciones del Agente Bedrock | `update_agent_v2.ps1` (`$instructions`) | Ejecutar `update_agent_v2.ps1` |
| DDL de tabla Athena | `src/lib/aws/create_partitioned_table.sql` | Ejecutar manualmente en Athena |

> [!IMPORTANT]
> **Seguridad**: Los recordatorios de mantenimiento se envían por defecto al correo configurado en la Lambda. El agente tiene permiso explícito para usar `jerson.villamizar.214@gmail.com`.

---

## 📈 Historial de Optimizaciones

| Versión | Fecha | Cambio clave | Impacto en latencia |
| :--- | :--- | :--- | :--- |
| v1.0 | Ene 2026 | Implementación inicial con Sonnet generando SQL | ~60 s por consulta |
| v2.0 | Feb 2026 | Motor SQL separado con Haiku en Lambda | ~30 s por consulta |
| v2.1 | Feb 2026 | Backoff exponencial · Filtro de fecha en `getRealTimeStatus` | ~15 s por consulta |
| **v2.2** | **Mar 2026** | **Tabla `iot_data_v2` con Partition Projection · Polling inicial 800 ms → 300 ms** | **~3-5 s por consulta** |

---
*Ultima actualización: Marzo 2026 - Optimizaciones de Velocidad Nivel 2 (Partition Projection)*
