// src/utils/cognito-user-current.ts
import { cookies } from 'next/headers';
import { getCurrentUser } from 'aws-amplify/auth/server';
import { runWithAmplifyServerContext } from './amplify-utils';

// This page always dynamically renders per request
export const dynamic = 'force-dynamic';

export async function getCurrentAuthUser() {
  try {
    const currentUser = await runWithAmplifyServerContext({
      nextServerContext: { cookies },
      operation: (contextSpec) => getCurrentUser(contextSpec),
    });
    return currentUser;
  } catch (error: any) {
    // If the error is specifically about unauthenticated user, return null silently
    if (error?.name === 'UserUnAuthenticatedException') {
      return null;
    }
    // For other errors, log them and return null
    console.error('Error obteniendo el usuario actual:', error);
    return null;
  }
}