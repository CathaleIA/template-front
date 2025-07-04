// src/app/api/users/route.ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const cookiesStorage = await cookies();

  const API_BASE_URL = process.env.NEXT_PUBLIC_REG_API_GATEWAY_URL;
  const TOKEN_ID = cookiesStorage.get('cognito_id_token')?.value;

  if (!TOKEN_ID) {
    return NextResponse.json({ error: 'No token found' }, { status: 401 });
  }

  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${TOKEN_ID}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener los usuarios');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching users' }, { status: 500 });
  }
}