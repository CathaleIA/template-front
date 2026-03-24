export async function GET(
  request: Request,
  { params }: { params: Promise<{ tenantName: string }> }
) {
  const { tenantName } = await params;
  const apiBaseUrl = process.env.NEXT_PUBLIC_REG_API_GATEWAY_URL;

  if (!apiBaseUrl) {
    return new Response(
      JSON.stringify({ error: "API Gateway URL not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const res = await fetch(`${apiBaseUrl}/tenant/init/${tenantName}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const text = await res.text();
      return new Response(
        JSON.stringify({ error: text }),
        { status: res.status, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch tenant config" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
