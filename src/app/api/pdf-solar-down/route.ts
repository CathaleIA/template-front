import { NextResponse } from "next/server";

const AWS_ENDPOINT =
  "https://e989ua8tf9.execute-api.us-east-1.amazonaws.com/dev/query-filer-user";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { tenantName, userPoolName } = body;

    if (!tenantName || !userPoolName) {
      return NextResponse.json(
        { message: "tenantName y userPoolName son requeridos" },
        { status: 400 }
      );
    }

    const awsResponse = await fetch(AWS_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tenantName,
        userPoolName,
      }),
    });

    if (!awsResponse.ok) {
      throw new Error("Error al consumir AWS endpoint");
    }

    const data = await awsResponse.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
