import * as uuid from 'uuid';
import R from 'ramda';

import {
  ChannelNotFoundError,
  NotChannelMemberError,
  UnauthorizedError,
} from '../library/graphql-errors.js';
import UserModel from '../models/user.js';
import ChannelModel from '../models/channel.js';

import ChannelMemberModel from '../models/channel-member.js';
import MessageModel from '../models/messages.js';
import { ConnectionParameters } from '../types/common.type';

export default {
  Message: {
    user: async ({ userId }) => {
      return UserModel.findById(userId);
    },
    channel: async ({ channelId }) => {
      return ChannelModel.findById(channelId);
    },
  },

  Mutation: {
    async sendMessage(_: any, { channelId, text }, { user }) {
      if (!user) {
        throw new UnauthorizedError();
      }

      const channelMember = await ChannelMemberModel.findOne({
        channelId,
        userId: user.id,
      });
      if (!channelMember) {
        throw new UnauthorizedError();
      }

      await MessageModel.create({
        _id: uuid.v1(),
        text,
        userId: user.id,
        channelId,
      });

      return true;
    },
  },

  Query: {
    async messages(
      _: any,
      params: ConnectionParameters<{ channelId: string }>,
      { user },
    ) {
      if (!user) {
        throw new UnauthorizedError();
      }

      const { channelId } = params;
      const channel = await ChannelModel.exists({ _id: channelId });
      if (!channel) {
        throw new ChannelNotFoundError();
      }

      const channelMember = await ChannelMemberModel.findOne({
        channelId,
        userId: user.id,
      });
      if (!channelMember) {
        throw new NotChannelMemberError();
      }

      let { first, after } = params;
      if (!first) {
        first = 10;
      }

      const query = { channelId };
      if (after) {
        query['_id'] = { $lt: after };
      }

      const messages = await MessageModel.find(query)
        .sort({ _id: -1 })
        .limit(first)
        .lean();

      const total = await MessageModel.countDocuments(R.omit(['_id'], query));
      return {
        pageInfo: {
          hasNext: messages.length >= first,
          total,
        },
        edges: messages.map((message) => ({
          cursor: message._id,
          node: {
            ...message,
            id: message._id,
          },
        })),
      };
    },
  },
};
