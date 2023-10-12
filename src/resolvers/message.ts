import * as uuid from 'uuid';

import { UnauthorizedError } from '../library/graphql-errors';
import UserModel from '../models/user.js';
import ChannelMemberModel from '../models/channel-member.js';
import MessageModel from '../models/messages.js';

export default {
  Message: {
    user: async ({ userId }) => {
      return UserModel.findById(userId);
    },
  },

  Mutation: {
    async sendMessage(_, { channelId, text }, { user }) {
      if (!user) {
        throw new UnauthorizedError();
      }

      const channelMember = await ChannelMemberModel.findOne({ channelId, userId: user.id });
      if (!channelMember) {
        throw new UnauthorizedError();
      }

      await MessageModel.create({
        _id: uuid.v1(),
        text,
        userId: user.id,
      });

      return true;
    }
  }
}