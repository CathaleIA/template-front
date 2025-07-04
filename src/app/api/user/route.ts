import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_REG_API_GATEWAY_URL
  const cookiesStore = await cookies()
  const token = cookiesStore.get("cognito_id_token")?.value

  if (!token) {
    return NextResponse.json({ error: "No token found" }, { status: 401 })
  }

  try {
    const body = await request.json()

    const res = await fetch(`${API_BASE_URL}/user`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const errorData = await res.json()
      return NextResponse.json(errorData, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: "Error creating user" }, { status: 500 })
  }
}
