// lib/apolloClient.ts
'use client';

import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  split,
} from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { setContext } from '@apollo/client/link/context';

async function getTokenFromCookie(): Promise<string | null> {
  try {
    const response = await fetch('/api/auth/tokens');
    if (!response.ok) {
      console.error('Failed to fetch tokens:', response.statusText);
      return null;
    }
    const data = await response.json();
    console.log(data)
    return data.id_token || null;
  } catch (error) {
    console.error('Error fetching token:', error);
    return null;
  }
}

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_APPSYNC_API_URL,
});

const authLink = setContext(async (_, { headers }) => {
  const token = await getTokenFromCookie();
  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const wsLink = typeof window !== 'undefined'
  ? new GraphQLWsLink(createClient({
      url: process.env.NEXT_PUBLIC_APPSYNC_WS_URL!,
      connectionParams: async () => {
        const token = await getTokenFromCookie();
        return {
          Authorization: token ? `Bearer ${token}` : '',
        };
      },
    }))
  : null;

const splitLink = typeof window !== 'undefined' && wsLink
  ? split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === 'OperationDefinition' &&
          definition.operation === 'subscription'
        );
      },
      wsLink,
      authLink.concat(httpLink)
    )
  : authLink.concat(httpLink);

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});
