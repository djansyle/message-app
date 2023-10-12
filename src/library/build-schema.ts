import { mergeResolvers } from '@graphql-tools/merge';
import { makeExecutableSchema } from '@graphql-tools/schema';

import typeDefs from '../schema.js';

import UserResolver from '../resolvers/user.js';
import AuthorizationResolver from '../resolvers/authorization.js';
import ChannelResolver from '../resolvers/channel.js';
import MessageResolver from '../resolvers/message.js';

export default () => {
  const resolvers = mergeResolvers([
    UserResolver,
    AuthorizationResolver,
    ChannelResolver,
    MessageResolver,
  ]);

  return makeExecutableSchema({ typeDefs, resolvers });
};
