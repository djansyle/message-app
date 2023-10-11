import { gql } from '@apollo/client';
import tryToCatch from 'try-to-catch';
import { path } from 'ramda';

import UserModel from '../models/user';
import { client, authenticateUser, chance } from './helper';

const signupMutation = gql`
  mutation Signup($input: CreateUserInput!) {
    signup(input: $input)
  }
`;

describe('User', function () {
  describe('Query#me', function () {
    it('SHOULD be able to retrieve the user information GIVEN valid credentials', async function () {
      const { accessToken } = await authenticateUser();
      const request = await client({
        authorization: `Bearer ${accessToken}`,
      });

      const query = gql`
        query Me {
          me {
            id
            email
          }
        }
      `;

      const response = await request.query({
        query,
      });

      expect(response.data.me).toBeDefined();
      expect(response.data.me.email).toBeDefined();
      expect(response.data.me.id).toBeDefined();
    });

    it('SHOULD throw an UNAUTHORIZED error WHEN no valid credentials', async function () {
      const request = await client();

      const [error] = await tryToCatch(request.query, {
        query: gql`
          query Me {
            me {
              id
              email
            }
          }
        `,
      });

      expect(error).toBeDefined();
      expect(path(['graphQLErrors', 0, 'code'], error)).toBe('UNAUTHORIZED');
    });
  });

  describe('Mutation#signup', function () {
    it('SHOULD be able to create a user', async function () {
      const email = chance.email();
      const request = await client();
      const password = chance.word();

      const response = await request.mutate({
        mutation: signupMutation,
        variables: {
          input: {
            email,
            password,
          },
        },
      });

      expect(response.data.signup).toBe(true);
      const user = await UserModel.findOne({ email });
      expect(user).toBeDefined();
    });

    it('SHOULD not be able to create a user with same email', async function () {
      const email = chance.email();
      const request = await client();
      const password = chance.word();

      const response = await request.mutate({
        mutation: signupMutation,
        variables: {
          input: {
            email,
            password,
          },
        },
      });

      expect(response.data.signup).toBe(true);

      const [error] = await tryToCatch(request.mutate, {
        mutation: signupMutation,
        variables: {
          input: {
            email,
            password,
          },
        },
      });

      expect(error).toBeDefined();
      expect(path(['graphQLErrors', 0, 'code'], error)).toBe(
        'USER_ALREADY_EXISTS',
      );
    });
  });
});
