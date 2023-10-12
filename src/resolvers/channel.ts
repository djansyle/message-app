import * as uuid from 'uuid';

import UserModel from '../models/user.js';
import ChannelModel from '../models/channel.js';
import ChannelMemberModel from '../models/channel-member.js';
import { Channel } from '../models/channel.js';
import { Context } from '../types/common.type.js';
import { ChannelAlreadyExistsError, ChannelNotFoundError, NotChannelOwnerError, UnauthorizedError, UserNotFoundError } from '../library/graphql-errors.js';

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

    async addChannelMember(_: unknown, args: { channelId: string; userId: string }, { user }: Context) {
      if (!user) {
        throw new UnauthorizedError();
      }

      const channel = await ChannelModel.findById(args.channelId);
      if (!channel) {
        throw new ChannelNotFoundError();
      }

      if (channel.owner !== user.id) {
        throw new NotChannelOwnerError();
      }

      const userExists = await UserModel.exists({ _id: args.userId });
      if (!userExists) {
        throw new UserNotFoundError();
      }

      const alreadyMember = await ChannelMemberModel.exists({ channelId: args.channelId, userId: args.userId });
      if (alreadyMember) {
        return false;
      }

      await ChannelMemberModel.create({
        _id: uuid.v1(),
        channelId: args.channelId,
        userId: args.userId,
        dateTimeCreated: new Date(),
      });

      return true;
    }
  }
};
