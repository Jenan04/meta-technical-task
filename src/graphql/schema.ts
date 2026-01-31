export const typeDefs =`
  enum Type {
    PRIVATE
    PUBLIC
  }

  enum ContentType {
  IMAGE
  FILE
  NOTE
 }

  type User {
    id: ID!
    name: String!
    slug: String!        
    privateToken: String!
    isComplete: Boolean!
    spaces: [Space!]!
  }

  type Space {
    id: ID!
    name: String!
    slug: String!
    type: Type!
    user: User!
    contents: [Content!]!
  }

  type Content {
    id: ID!
    type:ContentType!
    text: String
    url:String
    size: Int
    visibility: Type!
    createdAt: String!
  }

  type Upload {
  id: ID!
  status: String! # أو استخدمي Enum إذا أردتِ
  fileUrl: String
  type: ContentType
}

  type Query {
    getUser(id: ID!): User
    getPublicProfile(slug: String!): User 
    getPrivateProfileByToken(slug: String!, token: String!): User
    getSpaceContents(spaceId: ID!): [Content!]!
    getUserSpaces(userId: ID!): [Space!]!
    getSpaceBySlug(slug: String!): Space
    getPendingUploads(userId: ID!): [Upload!]!
  }

  type Mutation {
    createPseudoUser(name: String!): User!
    updateUser(id: ID!, name: String!): User!

    addContent(userId: ID!, spaceId: ID!, type: ContentType!, text: String, fileName: String, fileBuffer: String,visibility: Type!): Content!

    createSpace(userId: ID!, name: String!, type: Type!): Space!
    updateSpace(id: ID!, name: String, type: Type): Space!
    deleteContent(id: ID!): Boolean
    deleteSpace(id: ID!): Boolean

    startUpload(userId: ID!, spaceId: ID!, type: ContentType!): Upload!
    finishUpload(uploadId: ID!, url: String!, size: Int!, visibility: Type!): Content!
    reportUploadFailure(uploadId: ID!): Upload!
  }
`
