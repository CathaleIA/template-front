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
    console.log(currentUser)
    return currentUser;
  } catch (error) {
    console.error('Error obteniendo el usuario actual:', error);
    return null;
  }
}