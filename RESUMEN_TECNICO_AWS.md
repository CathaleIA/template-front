# 📘 Resumen Técnico: Dashboard IoT & Asistente Inteligente AWS

## 🌐 Visión General
Este proyecto es un dashboard de monitoreo industrial en tiempo real desarrollado con **Next.js**, integrado nativamente con servicios de **AWS**. La característica principal es un **Asistente de IA Generativa** que utiliza un enfoque híbrido (WebSockets para tiempo real y AWS Athena para históricos) para analizar telemetría industrial.

---

## 🏗️ Arquitectura AWS Implementada

### 1. Ingesta y Almacenamiento (Data Lake)
- **AWS IoT Core**: Recibe la data cruda de los dispositivos (Gateway QNAP).
- **Amazon S3**: Repositorio central de históricos.
  - **Bucket**: `industrial-iot-snowflake-staging-240435918890`
  - **Estructura**: `telemetry/YYYY/MM/DD/HH/`
- **AWS Athena**: Motor de consultas SQL serverless que escanea los JSON de S3 de forma masiva sin necesidad de mover los datos.

### 2. Capa de Inteligencia (Generative AI)
- **Amazon Bedrock**: Utiliza **Claude 3 Sonnet** como motor de razonamiento.
- **Modos de Operación**:
  - **Conversacional**: Respuestas rápidas a saludos y preguntas generales (bajo costo).
  - **Tiempo Real**: Conexión directa a **WebSockets** para ver el estado actual del equipo.
  - **Histórico (SQL RAG)**: El bot traduce preguntas humanas a **SQL (Presto/Athena)** para extraer datos precisos de S3.

---

## 🤖 Detalles de Implementación (Bedrock + Athena)

### A. API Route Orquestadora (`/api/bedrock-chat`)
- **Clasificador Inteligente**: Detecta si la consulta es una charla informal, una duda sobre manuales o una petición de datos técnicos.
- **Generación Dinámica de SQL**: Bedrock genera la consulta SQL óptima según la pregunta del usuario.
- **Inyección de Contexto**: El bot recibe los resultados de la DB y los traduce a una explicación técnica directa y segura.

### B. Servicio Athena (`athena-data.ts`)
- **Esquema 2026**: Adaptado para manejar estructuras JSON complejas y anidadas (donde cada métrica tiene su propio objeto `value` y `timestamp`).
- **Performance**: Optimizado para escanear particiones por fecha, permitiendo analizar meses de datos en pocos segundos.

### C. Tiempo Real (`iot-realtime.ts`)
- Mantiene un caché en memoria de los últimos mensajes del motor y generador vía WebSockets, permitiendo respuestas instantáneas sobre el "ahora".

---

## ⚙️ Configuración del Entorno (`.env`)

```ini
# Bedrock
AWS_BEDROCK_REGION=us-east-1
AWS_BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0

# S3 & Athena
AWS_S3_IOT_BUCKET=industrial-iot-snowflake-staging-240435918890
# Athena utiliza el bucket anterior para guardar resultados en /athena-results/

# Credenciales
AWS_ACCESS_KEY_ID=***
AWS_SECRET_ACCESS_KEY=***
```

---

## 🚀 Flujo de una Consulta de Datos
1. **Usuario**: "¿Cuál fue el voltaje máximo ayer?"
2. **Bedrock (SQL Gen)**: Genera `SELECT MAX(data.generator.voltage_L1_N.value) FROM ... WHERE date >= '2026-01-21'`.
3. **Athena**: Ejecuta la consulta sobre los miles de archivos en S3.
4. **Bedrock (Final)**: Recibe el valor (ej: 2405V) y responde: *"El voltaje máximo ayer fue de 2405V...".* ✅
