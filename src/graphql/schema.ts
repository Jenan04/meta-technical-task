import { createSchema } from '@graphql-yoga/node'

export const typeDefs =`
  enum Type {
    PRIVATE
    PUBLIC
  }

  type User {
    id: ID!
    name: String!
    isComplete: Boolean!
    spaces: [Space!]!
  }

  type Space {
    id: ID!
    type: Type!
    contents: [Content!]!
  }

  type Content {
    id: ID!
    type: String!
    data: String!
    size: Int!
    visibility: Type!
  }

  type Query {
    getUser(id: ID!): User
    getSpaceContents(spaceId: ID!): [Content!]!
  }

  type Mutation {
    createPseudoUser(name: String!): User!
    updateUser(id: ID!, name: String!): User!
    addContent(userId: ID!, spaceId: ID!, type: String!, data: String!, visibility: Type!): Content!
  }
`
