import tryToCatch from 'try-to-catch';
import bcrypt from 'bcrypt';
import * as uuid from 'uuid';
import { omit } from 'ramda';
import { CreateUserInputType } from '../types/user.type.js';

import {
  InvalidCredentials,
  ServerError,
  UnauthorizedError,
  UserAlreadyExistsError,
  UserNotFoundError,
} from '../library/graphql-errors.js';
import * as jwt from '../library/jwt.js';
import UserModel from '../models/user.js';

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
      return {
        accessToken,
      };
    },

    async signup(_: any, args: { input: CreateUserInputType }) {
      const [error] = await tryToCatch(async () => {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(args.input.password, salt);
        await UserModel.create({
          ...omit(['password'], args.input),
          _id: uuid.v4(),
          password: hash,
          salt,
        });
      });

      if (!error) {
        return true;
      }

      if ((error as any).code === 11000) {
        throw new UserAlreadyExistsError();
      }

      return false;
    },
  },

  Query: {
    async me(_: any, args: any, context: { user?: { id: string } }) {
      if (!context.user) {
        throw new UnauthorizedError();
      }

      const user = await UserModel.findById(context.user.id).lean();
      return {
        ...user,
        id: user._id,
      };
    },
  },
};
