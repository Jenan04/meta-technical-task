import { createYoga, createSchema } from 'graphql-yoga';
import { typeDefs } from '@/graphql/schema';
import { resolvers } from '@/graphql/resolver';
import { NextRequest } from 'next/server';

const yoga = createYoga({
  schema: createSchema({
    typeDefs,
    resolvers,
  }),
  
  graphqlEndpoint: '/api/graphql', 
  fetchAPI: { Response }
});

export async function GET(request: NextRequest) {
  return yoga(request)
}

export async function POST(request: NextRequest) {
  return yoga(request)
}

export async function OPTIONS(request: NextRequest) {
  return yoga(request)
}