import { ApolloServer } from "apollo-server-lambda";
import { Handler } from "aws-lambda";

import { resolvers } from "./graphql/resolvers";
import { typeDefs } from "./graphql/schema";
import { Context } from "./types/Context";

const IS_LOCAL = !!process.env.IS_LOCAL;

const server = new ApolloServer({
  resolvers,
  typeDefs,
  introspection: IS_LOCAL,
  context: ({ event }): Context => {
    return {};
  },
});

export const handler = server.createHandler() as Handler;
