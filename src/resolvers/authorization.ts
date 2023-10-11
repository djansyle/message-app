import tryToCatch from 'try-to-catch';
import bcrypt from 'bcrypt';

import {
  InvalidCredentials,
  ServerError,
  UnauthorizedError,
} from '../library/graphql-errors.js';
import * as jwt from '../library/jwt.js';
import UserModel from '../models/user.js';
import TokneModel from '../models/token.js';

export default {
  Mutation: {
    async login(_: any, args: { email: string; password: string }) {
      const [error, user] = await tryToCatch(async () =>
        UserModel.findOne({ email: args.email }),
      );

      if (error) {
        throw new ServerError();
      }

      if (!user) {
        throw new InvalidCredentials();
      }

      const [hashError, isPasswordValid] = await tryToCatch(() =>
        bcrypt.compare(args.password, user.password),
      );

      if (hashError) {
        throw new ServerError();
      }

      if (!isPasswordValid) {
        throw new InvalidCredentials();
      }

      const accessToken = await jwt.sign({ id: user._id });
      await TokneModel.create({ _id: accessToken });
      return {
        accessToken,
      };
    },

    async logout(_: any, __: any, { user, token }: any) {
      if (!user || !token) {
        throw new UnauthorizedError();
      }

      await TokneModel.updateOne({ _id: token }, { $set: { revoked: true } });

      return true;
    }
  },
};