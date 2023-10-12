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
    name: String!
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
    channelMembers(
      channelId: ID!
      first: Int,
      after: String
    ): ChannelMembersConnection!
  }

  type Mutation {
    login(email: String!, password: String!): AuthPayload!
    logout: Boolean!

    signup(input: CreateUserInput!): Boolean

    createChannel(name: String!): Channel!
    addChannelMember(channelId: ID!, userId: ID!): Boolean!
    sendMessage(channelId: ID!, text: String!): Boolean!
  }

  schema {
    query: Query
    mutation: Mutation
  }
`;
