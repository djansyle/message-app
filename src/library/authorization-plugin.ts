import { ApolloServerPlugin, HeaderMap } from '@apollo/server';
import * as jwt from './jwt.js';
import TokenModel from '../models/token.js';

export default function (): ApolloServerPlugin<{
  user?: { id: string };
  token?: string;
}> {
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

      const tokenExists = await TokenModel.findOne({ _id: token }).lean();
      if (!tokenExists || tokenExists.revoked) {
        return;
      }

      const user = await jwt.verify(token);
      if (!user) {
        return;
      }

      contextValue.user = user;
      contextValue.token = token;
    },
  };
}
