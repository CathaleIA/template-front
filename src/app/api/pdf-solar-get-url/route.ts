import { desc } from "motion/react-client";
import { NextResponse } from "next/server";
// genera la url prefirmada para descargar el archivo PDF desde S3, utilizando el path del archivo que se recibe en la solicitud POST. La función hace una solicitud a un endpoint de AWS API Gateway que se encarga de generar la URL prefirmada. Si la solicitud es exitosa, devuelve la URL en formato JSON; si hay un error, devuelve un mensaje de error con el código de estado correspondiente.
export async function POST(req: Request) {
  try {
    const { path } = await req.json();

    if (!path) {
      return NextResponse.json(
        { error: "Missing path" },
        { status: 400 }
      );
    }

    const response = await fetch(
    "https://e989ua8tf9.execute-api.us-east-1.amazonaws.com/dev/create-get-url-file", // tu endpoint API Gateway
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ path }),
      }
    );

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}