import * as uuid from 'uuid';

import UserModel from '../models/user.js';
import ChannelModel from '../models/channel.js';
import { Channel } from '../models/channel.js';
import { Context } from '../types/common.type.js';
import { ChannelAlreadyExistsError, UnauthorizedError } from '../library/graphql-errors.js';

export default {
  Channel: {
    owner: async (parent: Channel, _: any, { models }) => {
      return UserModel.findById(parent.owner);
    },
  },

  Mutation: {
    async createChannel(_: any, args: { name: string }, { user }: Context) {
      if (!user) {
        throw new UnauthorizedError();
      }

      const data = {
        _id: uuid.v1(),
        name: args.name,
        owner: user.id,
        dateTimeCreated: new Date(),
      };

      const sameChannel = await ChannelModel.exists({ name: args.name, owner: user.id });
      if (sameChannel) {
        throw new ChannelAlreadyExistsError();
      }

      const channel = await ChannelModel.create(data);
      return {
        ...data,
        id: channel._id,
      };
    },
  }
};
