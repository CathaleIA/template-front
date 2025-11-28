# Flujo de Envío: Formulario + Archivo ZIP

## 📋 Descripción General

Este documento describe el flujo completo de cómo el formulario y el archivo ZIP se envían juntos a AWS.

---

## 🔄 Flujo Paso a Paso

### **Paso 1: Usuario Completa el Formulario (5 Pasos)**
- Usuario completa todos los 5 pasos del formulario
- Cada paso se valida con Zod schemas
- Al final, click en **"Completar Formulario"**

```
upload-form.tsx
  ↓
uploadForm.handleSubmit()
  ↓
use-upload-form-logic.ts::handleFormSubmit()
  ↓
formData state = formValues
toast: "✅ Formulario completado"
```

### **Paso 2: Usuario Selecciona Archivo ZIP**
- Usuario sube el archivo ZIP en la sección de **"ZipUploadSection"**
- Se valida que sea un `.zip` y menor a 500MB
- El botón de upload se habilita solo si:
  - ✅ Formulario está completado (`formData !== null`)
  - ✅ Archivo está seleccionado (`file !== null`)

```
zip-upload-section.tsx
  ↓
file state = selectedFile
Button disabled={!formData || !file}
```

### **Paso 3: Usuario Hace Click en "Subir Archivo"**
- Se llama a `handleUpload()` del hook

```
handleUpload() en use-upload-form-logic.ts
  ↓
1. Valida que el archivo sea válido ✓
2. Valida que formData exista ✓
3. Llama a getPresignedUrl() → POST /api/public/upload
```

### **Paso 4: POST /api/public/upload - Envío del Formulario a Lambda**

**Frontend envía:**
```json
POST /api/public/upload
Content-Type: application/json

{
  "tenantName": "COPOWER",
  "userPoolName": "David-Gomez",
  "fileName": "opcional",
  "formulario": {
    "reportTitle": "Reporte 1",
    "cliente": "Eliecer",
    "municipio": "Bucaramanga",
    // ... resto del formulario
  }
}
```

**Backend (route.ts) hace:**
```typescript
1. Extrae: { tenantName, userPoolName, fileName, formulario }
2. Envía POST a Lambda (PRESIGNED_URL_ENDPOINT) con todos los datos:
   
   curl -X POST https://e989ua8tf9.execute-api.us-east-1.amazonaws.com/dev/solar-url-prefirmada \
     -H "Content-Type: application/json" \
     -d '{
       "tenantName": "COPOWER",
       "userPoolName": "David-Gomez",
       "fileName": "opcional",
       "formulario": { /* datos completos */ }
     }'

3. Lambda procesa el formulario y:
   - 📝 Guarda los datos en DynamoDB
   - 🔗 Genera URL prefirmada para el ZIP
   - 📤 Devuelve respuesta con la URL
```

**Lambda devuelve:**
```json
{
  "message": "html actualizados correctamente ResponsePresingedUrl(jobId=8956d103..., presignedUrl=https://solar-reports...)",
  "jobId": "8956d103-9c28-45a4-9699-9e3fd10dd819",
  "presignedUrl": "https://solar-reports-prod.s3.amazonaws.com/uploadInv/.../8956d103-....zip?X-Amz-..."
}
```

**Frontend recibe y extrae:**
```typescript
presignedUrl = "https://solar-reports-prod.s3.amazonaws.com/uploadInv/.../8956d103-....zip?X-Amz-..."
jobId = "8956d103-9c28-45a4-9699-9e3fd10dd819"
```

### **Paso 5: PUT /api/public/upload - Envío del Archivo ZIP a S3**

**Frontend envía:**
```
PUT /api/public/upload
Content-Type: multipart/form-data

file: [ZIP binary data]
presignedUrl: "https://solar-reports-prod.s3.amazonaws.com/uploadInv/.../..."
```

**Backend (route.ts) hace:**
```typescript
1. Extrae: file, presignedUrl
2. Lee el archivo a buffer
3. Extrae jobId de la URL presignada
4. Hace PUT directo a S3 con headers autorizados:

   curl -X PUT https://solar-reports-prod.s3.amazonaws.com/uploadInv/.../8956d103-....zip?X-Amz-... \
     -H "Content-Type: application/zip" \
     -H "x-amz-meta-jobid: 8956d103-9c28-45a4-9699-9e3fd10dd819" \
     --data-binary @archivo.zip
```

**S3 devuelve:**
```
Status: 200 OK
```

**Frontend recibe:**
```json
{
  "success": true,
  "message": "Archivo subido correctamente",
  "jobId": "8956d103-9c28-45a4-9699-9e3fd10dd819"
}
```

---

## 📊 Diagrama de Flujo Completo

```
┌─────────────────────────────────────────┐
│  USUARIO COMPLETA FORMULARIO (5 pasos)  │
└──────────────┬──────────────────────────┘
               │
               ↓
      ┌────────────────────┐
      │ formData state set │
      │ Button habilitado  │
      └────────┬───────────┘
               │
               ↓
  ┌─────────────────────────────────────┐
  │  USUARIO SELECCIONA ARCHIVO ZIP    │
  └──────────────┬──────────────────────┘
                 │
                 ↓
        ┌────────────────────┐
        │ file state set     │
        │ Submit habilitado  │
        └────────┬───────────┘
                 │
                 ↓
    ┌────────────────────────────────┐
    │  USUARIO HACE CLICK EN ENVIAR  │
    └──────────────┬─────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ↓                     ↓
   ┌─────────┐          ┌────────────┐
   │ POST 📤 │          │ Valida ... │
   │ Upload  │          │ (OK ✓)     │
   └────┬────┘          └────────────┘
        │
        ↓
   ┌──────────────────────────────┐
   │  Frontend → Backend (POST)    │
   │  /api/public/upload           │
   │  + formulario completo        │
   └────┬─────────────────────────┘
        │
        ↓
   ┌──────────────────────────────┐
   │  Backend → Lambda            │
   │  solar-url-prefirmada        │
   │  + formulario + tenantName   │
   └────┬─────────────────────────┘
        │
        ↓
   ┌──────────────────────────────┐
   │  Lambda procesa formulario   │
   │  📝 Guarda en DynamoDB       │
   │  🔗 Genera URL prefirmada    │
   │  ✅ Devuelve jobId + URL     │
   └────┬─────────────────────────┘
        │
        ↓
   ┌──────────────────────────────┐
   │  Frontend recibe jobId + URL │
   │  y procede a subir ZIP       │
   └────┬─────────────────────────┘
        │
        ↓
   ┌──────────────────────────────┐
   │  Frontend → Backend (PUT)     │
   │  /api/public/upload           │
   │  + archivo ZIP + URL          │
   └────┬─────────────────────────┘
        │
        ↓
   ┌──────────────────────────────┐
   │  Backend → S3                │
   │  PUT (presigned URL)         │
   │  + archivo ZIP               │
   └────┬─────────────────────────┘
        │
        ↓
   ┌──────────────────────────────┐
   │  S3 recibe y guarda ZIP      │
   │  ✅ 200 OK                   │
   └────┬─────────────────────────┘
        │
        ↓
   ┌──────────────────────────────┐
   │  ✅ ÉXITO                    │
   │  Formulario en DynamoDB ✓    │
   │  Archivo ZIP en S3 ✓         │
   │  jobId correlaciona ambos ✓  │
   └──────────────────────────────┘
```

---

## 🔑 Puntos Clave

### 1. **El Formulario se Envía PRIMERO (POST)**
- Antes de que el usuario seleccione el archivo ZIP
- El Lambda procesa y devuelve la URL prefirmada con el jobId
- Los datos quedan guardados en DynamoDB

### 2. **El Archivo ZIP se Envía DESPUÉS (PUT)**
- Con la URL que ya incluye el jobId
- La URL presignada ya está "lista" para recibir solo el archivo

### 3. **jobId es la Llave de Correlación**
- Lambda genera el jobId cuando procesa el formulario
- El jobId viene en la URL prefirmada
- Se puede usar para buscar los datos en DynamoDB

### 4. **No Hay Headers Personalizados**
- El presigned URL solo autoriza: `Content-Type` y `x-amz-meta-jobid`
- Enviar otros headers causa error 403
- Por eso todo se envía en el POST inicial

---

## 🧪 Prueba en Postman

### **1. POST - Envía el Formulario (obtiene URL prefirmada)**

```
POST http://localhost:3000/api/public/upload
Content-Type: application/json

{
  "tenantName": "COPOWER",
  "userPoolName": "David-Gomez",
  "fileName": "opcional",
  "formulario": {
    "reportTitle": "Reporte 1",
    "cliente": "Eliecer",
    "municipio": "Bucaramanga",
    "departamento": "Santander",
    "codigo": "123456",
    "elaboradoPor": ["Empleado1", "Empleador2"],
    "revisadoPor": ["RRHC"],
    "aprobadoPor": ["Kely"],
    "fechaEjecucion": "2025-11-21",
    "fechaEmision": "2025-11-21",
    "primerNombre": "Juan",
    "segundoNombre": "Eliecer",
    "cargo": "Dev",
    "alcance": "El alcance es obligatorio",
    "objetivo": "Prueba numero 1",
    "activos": [
      {
        "nombre": "Motor",
        "pruebas": ["INT"]
      }
    ],
    "personalPresente": ["Tecnico 1"],
    "nombreDoc": "Prueba de la Prueba",
    "desDoc": "Prueba",
    "nombreEquipo": "PLC"
  }
}
```

**Respuesta esperada:**
```json
{
  "presignedUrl": "https://solar-reports-prod.s3.amazonaws.com/uploadInv/COPOWER/David-Gomez/INVERSOR/8956d103-9c28-45a4-9699-9e3fd10dd819/opcional_8956d103-9c28-45a4-9699-9e3fd10dd819.zip?X-Amz-...",
  "jobId": "8956d103-9c28-45a4-9699-9e3fd10dd819",
  "message": "URL prefirmada obtenida exitosamente"
}
```

### **2. PUT - Envía el Archivo ZIP**

```
PUT http://localhost:3000/api/public/upload
Content-Type: multipart/form-data

file: [selecciona tu archivo.zip]
presignedUrl: [pega la URL del paso anterior]
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Archivo subido correctamente",
  "jobId": "8956d103-9c28-45a4-9699-9e3fd10dd819"
}
```

---

## 📝 Resumen Final

✅ **Antes (problema):**
- Formulario se guardaba solo en localStorage
- Archivo ZIP se subía sin datos del formulario
- Resultado: null en AWS

✅ **Ahora (solución):**
- Formulario se envía al Lambda antes de seleccionar ZIP
- Lambda guarda el formulario en DynamoDB
- Lambda devuelve URL prefirmada con jobId
- Archivo ZIP se sube con el jobId
- Resultado: Formulario + ZIP correlacionados en AWS con jobId
