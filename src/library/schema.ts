import path from 'path';
import { loadFilesSync } from '@graphql-tools/load-files';
import { mergeResolvers, mergeTypeDefs } from '@graphql-tools/merge';
import { makeExecutableSchema } from '@graphql-tools/schema';

import UserResolver from '../resolvers/user.js';

export default () => {
  const __filename = new URL(import.meta.url).pathname;
  const __dirname = path.dirname(__filename);

  const typeDefs = mergeTypeDefs(
    loadFilesSync(path.join(__dirname, '../types/')),
  );

  const resolvers = mergeResolvers([UserResolver]);

  return makeExecutableSchema({ typeDefs, resolvers });
};
