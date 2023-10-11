import { gql } from '@apollo/client';
import tryToCatch from 'try-to-catch';
import { path } from 'ramda';

import { client, chance, createUser, authenticateUser } from './helper';

const loginMutation = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      accessToken
    }
  }
`;

describe('Authentication', () => {
  describe('Mutation#Login', function() {
    it('SHOULD return an error WHEN user does not exists', async function () {
      const request = await client();
  
      const [error] = await tryToCatch(request.mutate, {
        mutation: loginMutation,
        variables: {
          email: chance.email(),
          password: chance.word(),
        },
      });
  
      expect(error).toBeDefined();
      expect(path(['graphQLErrors', 0, 'code'], error)).toBe(
        'INVALID_CREDENTIALS',
      );
    });
  
    it('SHOULD return an INVALID_CREDENTIALS WHEN password does not match', async function () {
      const request = await client();
      const { email } = await createUser();
  
      const [error] = await tryToCatch(request.mutate, {
        mutation: loginMutation,
        variables: {
          email,
          password: chance.word(),
        },
      });
  
      expect(error).toBeDefined();
      expect(path(['graphQLErrors', 0, 'code'], error)).toBe(
        'INVALID_CREDENTIALS',
      );
    });
  
    it('SHOULD return an access token GIVEN valid credentials', async function () {
      const { email, password } = await createUser();
  
      const request = await client();
      const response = await request.mutate({
        mutation: loginMutation,
        variables: {
          email,
          password,
        },
      });
  
      expect(response.data.login).toMatchObject(
        expect.objectContaining({
          accessToken: expect.any(String),
        }),
      );
    });
  });

  describe('Mutation#Logout', function() {
    it('SHOULD return true GIVEN token is valid', async function() {
      const { accessToken } = await authenticateUser();
      const request = await client({
        authorization: `Bearer ${accessToken}`,
      });

      const response = await request.mutate({
        mutation: gql`
          mutation Logout {
            logout
          }
        `,
      });

      expect(response.data.logout).toBe(true);
    });

    it('SHOULD not be able to use anymore the token that was already logged out', async function() {
      const { accessToken } = await authenticateUser();
      const request = await client({
        authorization: `Bearer ${accessToken}`,
      });

      const response = await request.mutate({
        mutation: gql`
          mutation Logout {
            logout
          }
        `,
      });

      expect(response.data.logout).toBe(true);
      const [error] = await tryToCatch(request.query, {
        query: gql`
          query me {
            me {
              email
            }
          }
        `,
      });

      expect(error).toBeDefined();
      expect(path(['graphQLErrors', 0, 'code'], error)).toBe(
        'UNAUTHORIZED',
      );
    });

    it('SHOULD return an UNAUTHORIZED error WHEN token is invalid', async function() {
      const request = await client({
        authorization: `Bearer ${chance.word()}`,
      });

      const [error] = await tryToCatch(request.mutate, {
        mutation: gql`
          mutation Logout {
            logout
          }
        `,
      });

      expect(error).toBeDefined();
      expect(path(['graphQLErrors', 0, 'code'], error)).toBe(
        'UNAUTHORIZED',
      );
    });
  });
});
