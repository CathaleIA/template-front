# 📘 Resumen Técnico: Dashboard IoT & Asistente Inteligente AWS

## 🌐 Visión General
Este proyecto es un dashboard de monitoreo industrial en tiempo real desarrollado con **Next.js**, integrado nativamente con servicios de **AWS**. La característica principal reciente es la implementación de un **Asistente de IA Generativa (Chatbot)** capaz de analizar telemetría histórica y responder consultas técnicas complejas.

---

## 🏗️ Arquitectura AWS Implementada

### 1. Ingesta y Almacenamiento (Backend)
- **AWS IoT Core**: Recibe la data cruda de los dispositivos (Gateway QNAP).
- **Amazon S3**: Almacenamiento "Data Lake" de históricos.
  - **Bucket**: `industrial-iot-snowflake-staging-240435918890`
  - **Estructura**: `telemetry/YYYY/MM/DD/` (Particionado por fecha).
  - **Formato**: Archivos JSON separados por tipo (`generador` y `motor`).

### 2. Capa de Inteligencia (Nuevo)
- **Amazon Bedrock**: Plataforma de IA serveless.
- **Modelo**: **Claude 3 Sonnet** (`anthropic.claude-3-sonnet-20240229-v1:0`).
- **Funcionalidad**: RAG (Retrieval-Augmented Generation) ligero sobre S3. El bot no "entrena" con los datos, sino que lee, resume e interpreta los datos en tiempo de consulta.

---

## 🤖 Detalles de Implementación del Bot (Bedrock)

La migración de Snowflake a una arquitectura 100% AWS Serverless se logró mediante tres componentes clave:

### A. API Route (`/api/bedrock-chat`)
- Actúa como orquestador seguro entre el Frontend y AWS.
- **Clasificador de Intención**: Determina si el usuario pide datos (`"voltaje hoy"`) o información general.
- **Extracción de Fechas**: Detecta rangos naturales (`"ayer"`, `"30 de diciembre"`) y los convierte a fechas UTC precisas para consultar S3.

### B. Servicio de Datos S3 (`s3-data.ts`)
- **Búsqueda Optimizada**: Escanea prefijos de S3 a nivel de día (`/2025/12/30/`) para evitar llamadas excesivas.
- **Resumidor Inteligente**: Lee cientos de archivos JSON y genera un "prompt de contexto" técnico. Calcula:
  - Mínimos, Máximos y Promedios (Voltaje, Corriente, Potencia).
  - Detección de fallas en breakers.
  - Diferenciales térmicos en cilindros.

### C. Cliente Bedrock (`bedrock.ts`)
- Configurado con credenciales de servidor (`process.env`).
- Inyecta el resumen de datos al modelo Claude 3 con un rol de "Ingeniero Experto".
- Maneja la sesión stateless (cada pregunta es una nueva invocación con contexto fresco).

---

## ⚙️ Configuración del Entorno (`.env`)

Variables críticas configuradas para el funcionamiento:

```ini
# Bedrock & IA
AWS_BEDROCK_REGION=us-east-1
AWS_BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0

# S3 Data Lake
AWS_S3_IOT_BUCKET=industrial-iot-snowflake-staging-240435918890
AWS_S3_IOT_PREFIX=telemetry/

# Credenciales (Server-side only)
AWS_ACCESS_KEY_ID=***
AWS_SECRET_ACCESS_KEY=***
```

---

## 🚀 Flujo de una Consulta

1. **Usuario pregunta**: *"¿Cuál fue la temperatura máxima del motor ayer?"*
2. **Next.js**: Calcula la fecha de "ayer".
3. **S3 Service**: Lista y descarga los JSONs de esa fecha específica.
4. **Procesamiento**: Calcula `Max(Temp_Cyl_*)` de los registros.
5. **Prompt a Bedrock**: 
   > "Analiza estos datos resumidos: Temp Max 600°C. Responde la pregunta del usuario."
6. **Bedrock**: Genera la respuesta en lenguaje natural explicando el hallazgo.
