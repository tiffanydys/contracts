//import {DateTimeResolver, PhoneNumberResolver} from 'graphql-scalars';

import { Resolvers } from "./types";

import { farm } from "./farm/queries/farm";
import { plant } from "./farm/mutations/plant";
import { harvest } from "./farm/mutations/harvest";

export const resolvers: Resolvers = {
  // Custom Scalars

  // Queries
  Query: {
    farm,
  },

  Mutation: {
    plant,
    harvest,
  },
};
