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

### 2. Capa de Inteligencia (Amazon Bedrock Agents)
- **Motor de Razonamiento**: Utiliza **Claude 3 Haiku** para operaciones rápidas (SQL interno) y **Claude 3 Sonnet** para el análisis final de reportes.
- **Bedrock Agent**: Configurado con un **Action Group** que invoca una función **AWS Lambda** (`IndustrialIoTAgentFunction`).
- **Knowledge Base**: Integración con manuales técnicos (Motor Waukesha, Generador Stamford) para extracción de límites operativos y planes de mantenimiento.
- **Optimizaciones de Latencia**: 
    - **Regla de Oro de Velocidad**: Consolidación de múltiples consultas en una sola llamada a Athena.
    - **Polling Adaptativo**: Reducción de llamadas innecesarias durante la generación de reportes.

### 3. Sistema de Reportes Dinámicos
- **Protocolo `<report_data>`**: La IA emite estructuras JSON/XML aisladas que el frontend captura y procesa.
- **Visor Premium (`web-report-viewer.tsx`)**: 
    - Estética **Glassmorphism** y gradientes dinámicos según el estado de los sensores.
    - Soporte para **Reportes Comparativos** (Cara a Cara) con cálculo automático de Deltas y Tendencias.
    - **Normalización Automática**: El backend corrige en tiempo real inconsistencias en las etiquetas de los KPIs enviados por la IA.

---

## ⚙️ Configuración del Entorno (`.env` & Lambda)

```ini
# Bedrock Agent
AWS_BEDROCK_AGENT_ID=O4WWVY6I8G
AWS_BEDROCK_AGENT_ALIAS_ID=TSTALIASID

# Athena & S3
AWS_S3_IOT_BUCKET=industrial-iot-snowflake-staging-240435918890
ATHENA_DATABASE=iot_data_test

# Lambda Action Group
LAMBDA_FUNCTION_NAME=IndustrialIoTAgentFunction
```

---

## 🚀 Flujo de una Consulta de Datos / Reporte
1. **Usuario**: "¿Compara el voltaje entre el 5 y 6 de febrero?"
2. **Bedrock Agent**: Invoca la Lambda pidiendo datos de ambos días en una sola transacción.
3. **Lambda**: Ejecuta SQL en Athena, procesa resultados y devuelve el resumen técnico.
4. **Bedrock (Análisis)**: Genera el bloque `<report_data>` con KPIs, conclusiones y análisis de causalidad.
5. **Frontend**: Detecta el reporte, lo persiste en S3 y lo renderiza con el visor **Next-Gen**. ✅
