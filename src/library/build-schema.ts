import { mergeResolvers } from '@graphql-tools/merge';
import { makeExecutableSchema } from '@graphql-tools/schema';

import typeDefs from '../schema.js';

import UserResolver from '../resolvers/user.js';
import AuthorizationResolver from '../resolvers/authorization.js';
import ChannelResolver from '../resolvers/channel.js';

export default () => {
  const resolvers = mergeResolvers([UserResolver, AuthorizationResolver, ChannelResolver]);

  return makeExecutableSchema({ typeDefs, resolvers });
};
