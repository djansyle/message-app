import { ApolloServerPlugin } from '@apollo/server';
import * as jwt from './jwt.js';

export default function (): ApolloServerPlugin<{ user?: { id: string } }> {
  return {
    async requestDidStart({ contextValue, request }) {
      const authorization = request.http.headers.get('authorization');

      if (!authorization) {
        return;
      }

      const [type, token] = authorization.split(' ');

      if (type.toLowerCase() !== 'bearer') {
        return;
      }

      const user = await jwt.verify(token);
      if (!user) {
        return;
      }

      contextValue.user = user;
    },
  };
}
