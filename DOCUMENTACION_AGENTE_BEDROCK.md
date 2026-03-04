# Documentación Técnica: Arquitectura del Agente Bedrock

Este documento explica el funcionamiento, la arquitectura y los procedimientos de mantenimiento del Agente de Inteligencia Artificial basado en AWS Bedrock implementado en esta aplicación.

---

## 🚀 Alcance y Capacidades del Agente

El Agente Bedrock no es un simple chatbot de texto; es un analista industrial inteligente con las siguientes capacidades activas:

### 1. Naturaleza Conversacional
El bot es capaz de mantener el contexto de la charla. Si le preguntas "¿Cuál fue el voltaje de ayer?" y luego dices "Grafícalo", el bot entiende que te refieres al voltaje de ayer sin necesidad de repetir los detalles.

### 2. Análisis de Datos Históricos (S3 + Athena)
A diferencia de un LLM estándar, este agente tiene acceso directo al **Data Lake en S3**. Puede realizar consultas complejas sobre años de telemetría para encontrar:
- Valores máximos, mínimos y promedios en rangos de tiempo específicos.
- Tendencias de comportamiento de variables críticas.
- Correlaciones entre variables (ej: voltaje vs temperatura).

### 3. Generación de Reportes Ejecutivos
Cuando detecta palabras clave (ej: "informe", "resumen mensual"), el agente activa el **Protocolo de Reporte Visual**:
- **Formato**: Crea un archivo JSON persistente que se renderiza como una página web dedicada (`/reports/[id]`).
- **Estructura del Informe**:
    - **Resumen Ejecutivo**: Análisis narrativo de los hallazgos principales.
    - **Semáforo de Anomalías**: Clasificación de eventos en Críticos, Advertencias o Informativos.
    - **Gráficas Interactivas**: Visualizaciones de series de tiempo usando Plotly.
    - **Conclusiones y Recomendaciones**: Pasos sugeridos basados en la IA.

### 4. Inteligencia de Umbrales (Thresholds)
El agente conoce los límites técnicos de operación (ej: qué voltaje es demasiado alto) y puede alertar proactivamente en sus respuestas si detecta que los datos consultados superan estos límites.

---

## 🏗️ Arquitectura General: "Cerebro y Manos"

El sistema opera bajo un modelo de desacoplamiento entre el procesamiento de lenguaje y la ejecución de acciones:

1.  **El Cerebro (AWS Bedrock Agent):** Utiliza un modelo fundacional (Anthropic Claude) para procesar las intenciones del usuario, mantener el hilo de la conversación y decidir cuándo necesita datos externos.
2.  **Las Manos (AWS Lambda):** Es el brazo ejecutor. El agente "invoca" esta función Lambda cuando identifica que la pregunta requiere consultar la base de datos de telemetría (S3/Athena).

---

## 🧠 Gestión del Contexto y Personalidad

El comportamiento del bot se controla en dos niveles:

### Nivel 1: Prompt del Sistema (Control Local)
*   **Ubicación:** `template-front/src/app/api/agent-chat/route.ts`
*   **Función:** Es la instrucción dinámica que se envía en cada invocación. Aquí se definen las reglas de respuesta, el formato del JSON para reportes (`<report_data>`), y las restricciones de seguridad (ej. límites de gráficas).
*   **Mantenimiento:** Cualquier cambio aquí se aplica mediante un despliegue estándar en Amplify (Git push).

### Nivel 2: Instrucción del Agente (Consola AWS)
*   **Ubicación:** AWS Console -> Amazon Bedrock -> Agents.
*   **Función:** La "misión" de alto nivel del agente. Se recomienda mantenerlo general, ya que el Nivel 1 (route.ts) ofrece un control más granular y rápido.

---

## ⚡ La Función Lambda: El Traductor SQL
*   **Ubicación del Código:** `template-front/src/lib/aws/agent-lambda.ts`
*   **Rol Crítico:**
    1.  Toma la necesidad del agente (ej: "Ver presión del aceite ayer").
    2.  Utiliza Bedrock internamente para generar una consulta SQL compatible con **Presto/Athena**.
    3.  Ejecuta la consulta y devuelve los datos limpios al agente en formato JSON.
*   **Mantenimiento:** Si se agregan nuevas tablas a Athena o se cambia el esquema de datos, este archivo debe actualizarse y su versión compilada (`.js`) debe subirse manualmente a la consola de AWS Lambda. Nombre en aws: IndustrialIoTAgentFunction

---

## �️ Estructura de Datos (Amazon S3)

El agente depende de un bucket central de S3 para leer telemetría y persistir reportes. Esta estructura es vital para que tanto desarrolladores como futuras IAs entiendan dónde reside la "verdad" de los datos.

**Bucket:** `industrial-iot-snowflake-staging-240435918890`

### 1. `telemetry/` (Fuente de Verdad)
*   **Funcionalidad:** Almacena los datos crudos (logs) capturados de los sensores industriales.
*   **Estructura Cronológica:** Los archivos se organizan por jerarquía temporal: `telemetry/YYYY/MM/DD/HH/`
*   **Tipos de Archivos y Esquemas:** Dentro de cada carpeta residen dos tipos de documentos JSON con estructuras específicas:

#### A. Archivos de Motor (Variables Mecánicas)
Contienen datos de salud del motor. Estructura clave:
```json
{
  "timestamp": "ISO-8601",
  "device_id": "string",
  "data": {
    "cylinders": { "Tem_Cyl_1...20": {"value": float} },
    "cooling_system": { "Presion_HT": {"value": float}, "Tem_HT_ref_salida": {"value": float} },
    "oil_system": { "Temperatura_aceite": {"value": float}, "Presion_aceite": {"value": float} }
  }
}
```

#### B. Archivos de Generador (Variables Eléctricas)
Contienen datos de generación y energía. Estructura clave:
```json
{
  "timestamp": "ISO-8601",
  "device_id": "string",
  "data": {
    "generator": { "corriente_L1..L3": {"value": float}, "voltage_L1..L3": {"value": float} },
    "busbar": { "voltage_L1_L2": {"value": float} },
    "breaker": { "closed": {"value": boolean}, "fault": {"value": boolean} },
    "temperature": { "devanado_u..w": {"value": float} }
  }
}
```

*   **Uso del Agente:** La Lambda mapea estas rutas para que Athena pueda realizar un `SELECT` sobre el campo `data.motor. Temperatura_aceite` o `data.generator.frecuencia` de forma transparente.

### 2. `athena-results/` (Cache de Consultas)
*   **Funcionalidad:** Carpeta de trabajo para AWS Athena.
*   **Contenido:** Archivos `.csv` y `.metadata` que contienen los resultados de las consultas ejecutadas por la Lambda.
*   **Importancia:** Athena requiere esta ubicación para depositar temporalmente las respuestas antes de que la Lambda las procese.

### 3. `web-reports/` (Persistencia de IA)
*   **Funcionalidad:** Base de datos persistente para los informes de IA generados.
*   **Contenido:** Archivos `.json` nombrados con UUIDs (ej: `1a2b3c...json`). Cada archivo contiene el título, gráficas de Plotly, conclusiones y anomalías del reporte.
*   **Ciclo de Vida:** La API Route escribe aquí cuando el agente termina su análisis, y el Visor Web (`/reports/[id]`) lee de aquí para renderizar el informe al usuario.

---

## �🛠️ Guía de Modificación para Desarrolladores

| Si quieres cambiar... | Modifica este archivo | Acción requerida |
| :--- | :--- | :--- |
| **Personalidad o tono del bot** | `src/app/api/agent-chat/route.ts` | Git Push (Amplify) |
| **Reglas de generación de reportes** | `src/app/api/agent-chat/route.ts` | Git Push (Amplify) |
| **Lógica de consultas a la base de datos** | `src/lib/aws/agent-lambda.ts` | Subir `.js` a AWS Lambda |
| **Diseño visual del reporte web** | `src/components/reports/web-report-viewer.tsx` | Git Push (Amplify) |

---

## 🔄 Flujo de una Consulta de Reporte
1.  **Pregunta:** "¿Deme un informe de temperatura de enero?".
2.  **API Route:** Inyecta el contexto de reporte y llama a Bedrock.
3.  **Bedrock & Lambda:** Colaboran para extraer datos históricos de Athena.
4.  **Respuesta:** El agente genera un JSON estructurado dentro de etiquetas `<report_data>`.
5.  **Persistencia:** La API Route extrae ese JSON, lo guarda en S3 y genera un ID único.
6.  **Entrega:** El bot responde con un enlace profesional: `/reports/[ID]`.

---

## 📊 Capacidad de Análisis de Datos

Es fundamental distinguir entre los datos que existen en S3 y lo que el Agente "conoce" actualmente para analizar.

### Universo de Datos (S3)
Actualmente, los archivos JSON contienen un total de **77 variables** técnicas (basado en `metadata.variables_count`):
*   **Motor:** 29 variables (cilindros, aceite, enfriamiento, etc.).
*   **Generador:** 48 variables (potencia, voltajes de línea y fase, breaker, busbar, temperaturas de devanado).

### Alcance del Agente (Mapeadas)
De esas 77, el Agente está configurado para analizar prioritariamente **33 variables críticas**, las cuales están mapeadas explícitamente en el prompt de la Lambda:

| Sistema | Variables Monitoreadas |
| :--- | :--- |
| **Generación (8)** | Voltajes de Fase (L1N, L2N, L3N), Corrientes (L1, L2, L3), Potencia Activa y Frecuencia. |
| **Cilindros (21)** | Temperatura individual de los 20 cilindros y el Promedio General. |
| **Aceite (2)** | Temperatura y Presión de aceite. |
| **Enfriamiento (2)** | Temperatura de entrada HT y Salida LT. |

> [!TIP]
> Si deseas que el bot analice alguna de las 44 variables restantes (ej. factor de potencia, armónicos o estados del breaker), simplemente debes agregar el nombre del campo en el prompt de `agent-lambda.ts` y redeployar la Lambda.

---

> [!NOTE]
> Para asegurar la estabilidad en producción, el agente tiene un límite estricto de **2 gráficas y 5 puntos por serie** para evitar el truncamiento por límites de tokens de salida de Bedrock.
