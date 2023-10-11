export default `#graphql
  type AuthPayload {
    accessToken: String!
  }

  input CreateUserInput {
    email: String!
    password: String!
  }

  type User {
    id: ID!
    email: String!
  }

  type MemberChannelEdge {
    cursor: String!
    node: User!
  }

  type PageInfo {
    total: Int!
    hasNext: Boolean!
  }

  type ChannelMembersConnection {
    pageInfo: PageInfo!
    edges: [MemberChannelEdge!]!
  }

  type Channel {
    id: ID!
    owner: User!

    membersConnection(
      first: Int,
      after: String
    ): ChannelMembersConnection!
  }

  type ChannelEdge {
    cursor: String!
    node: Channel!
  }

  type ChannelConnection {
    pageInfo: PageInfo!
    edges: [ChannelEdge!]!
  }

  type Query {
    me: User!
    channels(first: Int, after: String): ChannelConnection!
  }

  type Mutation {
    login(email: String!, password: String!): AuthPayload!
    logout: Boolean!

    signup(input: CreateUserInput!): Boolean
    sendMessage(channelId: ID!, text: String!): Boolean
  }

  schema {
    query: Query
    mutation: Mutation
  }
`;