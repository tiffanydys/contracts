//import {DateTimeResolver, PhoneNumberResolver} from 'graphql-scalars';

import { Resolvers } from "./types";

import { farm } from "./farm/queries/farm";
import { save } from "./farm/mutations/save";

export const resolvers: Resolvers = {
  // Custom Scalars

  // Queries
  Query: {
    farm,
  },

  Mutation: {
    save,
  },
};
