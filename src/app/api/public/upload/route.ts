import { NextRequest, NextResponse } from "next/server";

const PRESIGNED_URL_ENDPOINT =
  process.env.NEXT_PUBLIC_PRESIGNED_URL ||
  "https://e989ua8tf9.execute-api.us-east-1.amazonaws.com/dev/solar-url-prefirmada";

/**
 * GET - Obtiene la URL prefirmada desde el backend AWS
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tenantName = searchParams.get("tenantName") || "COPOWER";
  const userPoolName = searchParams.get("userPoolName") || "David-Gomez";
  const fileName = searchParams.get("fileName");

  try {
    console.log("🔍 Obteniendo URL prefirmada para:", { tenantName, userPoolName, fileName });

    const requestBody: any = { tenantName, userPoolName };
    if (fileName) {
      requestBody.fileName = fileName;
    }

    const response = await fetch(PRESIGNED_URL_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      console.error("❌ Error del backend:", response.statusText);
      return NextResponse.json(
        { error: `Error del backend: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("✅ Respuesta del backend:", data);

    // Extraer URL prefirmada del mensaje si es necesario
    let presignedUrl = data.url || data.presignedUrl || data.presigned_url;

    if (!presignedUrl && data.message && typeof data.message === "string") {
      const urlMatch = data.message.match(/https?:\/\/[^\s\)]+/);
      presignedUrl = urlMatch ? urlMatch[0] : null;
    }

    if (!presignedUrl) {
      return NextResponse.json(
        { error: "No se encontró URL prefirmada" },
        { status: 400 }
      );
    }

    return NextResponse.json({ url: presignedUrl });
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    return NextResponse.json(
      { error: error.message || "Error desconocido" },
      { status: 500 }
    );
  }
}

/**
 * PUT - Sube el archivo a S3 a través de proxy
 * Evita problemas de CORS permitiendo que Next.js maneje la solicitud
 */
export async function PUT(request: NextRequest) {
  try {
    console.log("🔵 PUT /api/public/upload - Iniciando...");

    // Parsear FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const presignedUrl = formData.get('presignedUrl') as string;

    if (!file) {
      console.error("❌ Error: Archivo no proporcionado");
      return NextResponse.json(
        { error: "Archivo no proporcionado" },
        { status: 400 }
      );
    }

    if (!presignedUrl) {
      console.error("❌ Error: URL prefirmada no proporcionada");
      return NextResponse.json(
        { error: "URL prefirmada no proporcionada" },
        { status: 400 }
      );
    }

    console.log("📋 Presigned URL recibida:", presignedUrl.substring(0, 100) + "...");
    console.log("📦 Archivo:", file.name, "Tamaño:", file.size, "bytes");
    
    // Extraer jobId de la URL
    const jobIdMatch = presignedUrl.match(/\/([a-f0-9\-]{36})\//);
    const jobId = jobIdMatch ? jobIdMatch[1] : null;
    console.log("🆔 JobId encontrado:", jobId);

    // Convertir el archivo a buffer
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    console.log("📤 Subiendo archivo a S3...");
    console.log("📍 Headers que se enviarán:");
    console.log("   Content-Type: application/zip");
    if (jobId) {
      console.log(`   x-amz-meta-jobid: ${jobId}`);
    }

    // Hacer PUT a S3 con los headers necesarios para que la firma sea válida
    const s3Response = await fetch(presignedUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/zip",
        ...(jobId ? { "x-amz-meta-jobid": jobId } : {}),
      },
      body: fileBuffer,
    });

    console.log("✅ Respuesta de S3:", s3Response.status, s3Response.statusText);

    if (!s3Response.ok) {
      const responseText = await s3Response.text();
      console.error("❌ Error de S3:", s3Response.statusText);
      console.error("📄 Respuesta completa:", responseText);
      
      // Intentar parsear error XML de S3
      try {
        const xmlParser = new DOMParser();
        const xmlDoc = xmlParser.parseFromString(responseText, "text/xml");
        const code = xmlDoc.getElementsByTagName("Code")?.[0]?.textContent;
        const message = xmlDoc.getElementsByTagName("Message")?.[0]?.textContent;
        console.error(`📄 Error S3: [${code}] ${message}`);
      } catch (e) {
        console.error("📄 No se pudo parsear respuesta XML");
      }
      
      return NextResponse.json(
        { error: `Error al subir a S3: ${s3Response.statusText}`, details: responseText },
        { status: s3Response.status }
      );
    }

    console.log("🎉 Archivo subido exitosamente a S3");

    return NextResponse.json({
      success: true,
      message: "Archivo subido correctamente",
    });
  } catch (error: any) {
    console.error("❌ Error en proxy:", error.message);
    console.error("📋 Stack:", error.stack);
    return NextResponse.json(
      { error: error.message || "Error desconocido" },
      { status: 500 }
    );
  }
}
