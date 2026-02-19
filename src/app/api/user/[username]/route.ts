// src/app/api/users/[username]/route.ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const cookiesStorage = await cookies();
  const API_BASE_URL = process.env.NEXT_PUBLIC_REG_API_GATEWAY_URL;
  const TOKEN_ID = cookiesStorage.get('cognito_id_token')?.value;

  if (!TOKEN_ID) {
    return NextResponse.json({ error: 'No token found' }, { status: 401 });
  }

  const { username } = await params;

  try {
    console.log(`[API] Fetching user from: ${API_BASE_URL}/user/${username}`);
    const response = await fetch(`${API_BASE_URL}/user/${username}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${TOKEN_ID}`,
        'Content-Type': 'application/json',
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API] Upstream error for user ${username}: Status ${response.status} | Body: ${errorText}`);
      throw new Error(`Upstream API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(`[API] Error in GET /api/user/${(await params).username}:`, error);
    return NextResponse.json({ error: 'Error fetching user', details: String(error) }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const cookiesStorage = await cookies();
  const API_BASE_URL = process.env.NEXT_PUBLIC_REG_API_GATEWAY_URL;
  const TOKEN_ID = cookiesStorage.get('cognito_id_token')?.value;

  if (!TOKEN_ID) {
    return NextResponse.json({ error: 'No token found' }, { status: 401 });
  }

  const { username } = await params;
  const body = await request.json();

  try {
    const response = await fetch(`${API_BASE_URL}/user/${username}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TOKEN_ID}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Error updating user' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const cookiesStorage = await cookies();
  const API_BASE_URL = process.env.NEXT_PUBLIC_REG_API_GATEWAY_URL;
  const TOKEN_ID = cookiesStorage.get('cognito_id_token')?.value;

  if (!TOKEN_ID) {
    return NextResponse.json({ error: 'No token found' }, { status: 401 });
  }

  const { username } = await params;

  try {
    const response = await fetch(`${API_BASE_URL}/user/${username}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${TOKEN_ID}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error deleting user: ${username}`);
    }

    return NextResponse.json({ message: `User ${username} deleted successfully` });
  } catch (error) {
    return NextResponse.json({ error: 'Error deleting user' }, { status: 500 });
  }
}