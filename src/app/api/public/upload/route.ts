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

  try {
    console.log("🔍 Obteniendo URL prefirmada para:", { tenantName, userPoolName });

    const response = await fetch(PRESIGNED_URL_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantName, userPoolName }),
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
 * Evita problemas de CORS
 */
export async function PUT(request: NextRequest) {
  try {
    console.log("🔵 PUT /api/public/upload - Iniciando...");

    // Obtener URL prefirmada del body
    const contentType = request.headers.get("content-type");
    
    let presignedUrl: string | null = null;
    let fileBuffer: ArrayBuffer;

    // Si el content-type es JSON, la URL viene en el body
    if (contentType?.includes("application/json")) {
      const body = await request.json();
      presignedUrl = body.presignedUrl;
      fileBuffer = new Uint8Array(Buffer.from(body.file, 'base64')).buffer;
    } else {
      // Si no, obtener del header (fallback)
      presignedUrl = request.headers.get("x-presigned-url");
      fileBuffer = await request.arrayBuffer();
    }

    console.log("📋 Presigned URL recibida:", presignedUrl?.substring(0, 100) + "...");

    if (!presignedUrl) {
      console.error("❌ Error: URL prefirmada no proporcionada");
      return NextResponse.json(
        { error: "URL prefirmada no proporcionada" },
        { status: 400 }
      );
    }

    const fileContentType = request.headers.get("x-file-type") || "application/zip";

    console.log("📤 Subiendo archivo a S3...");
    console.log("📍 URL completa (primeros 150 chars):", presignedUrl.substring(0, 150));
    console.log("📦 Tamaño:", fileBuffer.byteLength, "bytes");
    console.log("📝 Content-Type:", fileContentType);

    const response = await fetch(presignedUrl, {
      method: "PUT",
      headers: {
        "Content-Type": fileContentType,
      },
      body: fileBuffer,
    });

    console.log("✅ Respuesta de S3:", response.status, response.statusText);

    if (!response.ok) {
      const responseText = await response.text();
      console.error("❌ Error de S3:", response.statusText);
      console.error("📄 Respuesta:", responseText.substring(0, 300));
      return NextResponse.json(
        { error: `Error al subir a S3: ${response.statusText}` },
        { status: response.status }
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
