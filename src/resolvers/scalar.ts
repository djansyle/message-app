import { GraphQLScalarType, Kind } from 'graphql';

export default {
  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'Custom Date scalar',
    parseValue(value: string) {
      return new Date(value);
    },
    serialize(value: Date) {
      return value.toISOString();
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.STRING) {
        // Parse date from an AST string node
        return new Date(ast.value);
      }
      return null;
    },
  }),
};
