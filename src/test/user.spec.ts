import { gql } from '@apollo/client';
import tryToCatch from 'try-to-catch';
import { path } from 'ramda';

import { client, authenticateUser } from './helper';

describe('User', function() {
  describe('Query#me', function() {
    it('SHOULD be able to retrieve the user information GIVEN valid credentials', async function() {
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
  
    it('SHOULD throw an UNAUTHORIZED error WHEN no valid credentials', async function() {
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
});