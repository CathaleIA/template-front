'use client';

import { ApolloClient, InMemoryCache, HttpLink, ApolloLink } from '@apollo/client';
import { AuthOptions, createAuthLink } from 'aws-appsync-auth-link';
import { createSubscriptionHandshakeLink } from 'aws-appsync-subscription-link';

// Función para obtener el token JWT
async function getLatestAuthToken() {
  try {
    const response = await fetch('/api/auth/tokens');
    const data = await response.json();
    return data.id_token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    throw error;
  }
}

// Configuración de AppSync
const url = process.env.NEXT_PUBLIC_APPSYNC_API_URL!;
const region = process.env.NEXT_PUBLIC_APPSYNC_REGION!;

const auth: AuthOptions = {
  type: 'AMAZON_COGNITO_USER_POOLS',
  jwtToken: getLatestAuthToken,
};


// Crear los links
const httpLink = new HttpLink({ uri: url });

const link = ApolloLink.from([
  createAuthLink({ url, region, auth }),
  createSubscriptionHandshakeLink({ url, region, auth }, httpLink),
]);

// Cliente Apollo
export const apolloClient = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});