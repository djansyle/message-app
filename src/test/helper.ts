import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { AddressInfo } from 'net';
import Chance from 'chance';
import { path } from 'ramda';
import tryToCatch from 'try-to-catch';

import { app } from './global-hook';
import UserModel from '../models/user.js';
import { ConnectionParameters } from '../types/common.type';

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

  const user = await UserModel.findOne({ email: userEmail });
  expect(user).toBeDefined();
  return {
    email: userEmail,
    password,
    id: user._id,
  };
}

export async function authenticateUser() {
  const { email, password, id } = await createUser();
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
    id,
    email,
    password,
    accessToken: response.data.login.accessToken,
  };
}

export async function createChannel(params?: {
  accessToken?: string;
  name?: string;
}) {
  const { accessToken: token } = await authenticateUser();
  let requestToken = path(['accessToken'], params) || token;
  const request = await client({
    authorization: `Bearer ${requestToken}`,
  });

  const mutation = gql`
    mutation CreateChannel($name: String!) {
      createChannel(name: $name) {
        id
        name
      }
    }
  `;

  const channelName = path(['name'], params) || chance.word();
  const [error, response] = await tryToCatch(request.mutate, {
    mutation,
    variables: {
      name: channelName,
    },
  });

  return {
    error,
    response,
    channelName,
    channelId: path(['data', 'createChannel', 'id'], response),
    requestToken,
  };
}

export async function channels(
  params: ConnectionParameters & { accessToken: string },
) {}

export async function addChannelMember(params?: {
  accessToken?: string;
  channelId: string;
  userId: string;
}) {
  const { accessToken: token } = await authenticateUser();

  const requestToken = path(['accessToken'], params) || token;
  const request = await client({
    authorization: `Bearer ${requestToken}`,
  });
  const mutation = gql`
    mutation AddChannelMember($channelId: ID!, $userId: ID!) {
      addChannelMember(channelId: $channelId, userId: $userId)
    }
  `;

  const [error, response] = await tryToCatch(request.mutate, {
    mutation,
    variables: {
      channelId: path(['channelId'], params),
      userId: path(['userId'], params),
    },
  });

  return {
    error,
    response,
    requestToken,
  };
}

export async function listChannels(params?: {
  accessToken?: string;
  first?: number;
  after?: string;
}) {
  const { accessToken: token } = await authenticateUser();
  const requestToken = path(['accessToken'], params) || token;
  const request = await client({
    authorization: `Bearer ${requestToken}`,
  });

  const query = gql`
    query Channels($first: Int, $after: String) {
      channels(first: $first, after: $after) {
        pageInfo {
          total
          hasNext
        }

        edges {
          cursor
          node {
            id
            name
          }
        }
      }
    }
  `;

  const [error, response] = await tryToCatch(request.query, {
    query,
    variables: {
      first: path(['first'], params),
      after: path(['after'], params),
    },
  });

  return {
    error,
    response,
    requestToken,
  };
}

export async function listChannelMembers(params: {
  accessToken?: string;
  channelId: string;
  first?: number;
  after?: string;
}) {
  const { accessToken: token } = await authenticateUser();
  const requestToken = path(['accessToken'], params) || token;
  const request = await client({
    authorization: `Bearer ${requestToken}`,
  });

  const query = gql`
    query ChannelMembers($channelId: ID!, $first: Int, $after: String) {
      channelMembers(channelId: $channelId, first: $first, after: $after) {
        pageInfo {
          total
          hasNext
        }

        edges {
          cursor
          node {
            id
            email
          }
        }
      }
    }
  `;

  const [error, response] = await tryToCatch(request.query, {
    query,
    variables: {
      channelId: path(['channelId'], params),
      first: path(['first'], params),
      after: path(['after'], params),
    },
  });

  return {
    error,
    response,
    requestToken,
  };
}

export async function sendMessage(params: {
  accessToken?: string;
  channelId: string;
  text: string;
}) {
  const { accessToken: token } = await authenticateUser();
  const requestToken = path(['accessToken'], params) || token;
  const request = await client({
    authorization: `Bearer ${requestToken}`,
  });

  const mutation = gql`
    mutation SendMessage($channelId: ID!, $text: String!) {
      sendMessage(channelId: $channelId, text: $text)
    }
  `;

  const [error, response] = await tryToCatch(request.mutate, {
    mutation,
    variables: {
      channelId: path(['channelId'], params),
      text: path(['text'], params),
    },
  });

  return {
    error,
    response,
    requestToken,
  };
}
