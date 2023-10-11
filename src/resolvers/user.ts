import tryToCatch from 'try-to-catch';
import bcrypt from 'bcrypt';
import * as uuid from 'uuid';
import { omit } from 'ramda';
import { CreateUserInputType } from '../types/user.type.js';

import {
  InvalidEmailAddressFormatError,
  UnauthorizedError,
  UserAlreadyExistsError,
} from '../library/graphql-errors.js';

import UserModel from '../models/user.js';

export default {
  Mutation: {
    async signup(_: any, args: { input: CreateUserInputType }) {
      const result = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.exec(args.input.email);
      if (!result) {
        throw new InvalidEmailAddressFormatError();
      }

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
