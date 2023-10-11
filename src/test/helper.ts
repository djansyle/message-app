import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { AddressInfo } from 'net';
import Chance from 'chance';

import { app } from './global-hook';

export async function client(headers?: Record<string, string>) {
  const { httpServer } = await app;
  const address = httpServer.address() as AddressInfo;
  return new ApolloClient({
    uri: `http://localhost:${address.port}/graphql`,
    cache: new InMemoryCache(),
    headers,
  });
}

export const chance = new Chance();

export async function createUser(email?: string) {
  const request = await client();
  const mutation = gql`
    mutation Signup($input: CreateUserInput!) {
      signup(input: $input)
    }
  `;

  const password = chance.word();
  let userEmail = email || chance.email();

  await request.mutate({
    mutation,
    variables: {
      input: {
        email: userEmail,
        password,
      },
    },
  });

  return {
    email: userEmail,
    password,
  };
}

export async function authenticateUser() {
  const { email, password } = await createUser();
  const request = await client();
  const mutation = gql`
    mutation Login($email: String!, $password: String!) {
      login(email: $email, password: $password) {
        accessToken
      }
    }
  `;

  const response = await request.mutate({
    mutation,
    variables: {
      email,
      password,
    },
  });

  return {
    email,
    password,
    accessToken: response.data.login.accessToken,
  };
}
