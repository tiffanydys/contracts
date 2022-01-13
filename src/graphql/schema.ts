import { gql } from "apollo-server-lambda";

export const typeDefs = gql`
  """
  A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the 'date-time' format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar.
  """
  scalar DateTime

  type Field {
    index: Int!
    plant: Plant!
    plantedAt: DateTime!
  }

  type Farm {
    id: ID!
    fields: [Field!]!
  }

  enum Plant {
    sunflower
    potato
  }

  type PlantAction {
    plant: Plant!
    field: Int!
    plantedAt: DateTime!
  }

  union Event = PlantAction

  input PlantInput {
    plant: Plant!
    field: Int!
    plantedAt: DateTime!
  }

  input HarvestInput {
    field: Int!
    harvestedAt: DateTime!
  }

  """
  MutationType
  """
  type Mutation {
    plant(plant: PlantInput!): Farm
    harvest(plant: HarvestInput!): Farm
  }

  """
  QueryType
  """
  type Query {
    farm(id: ID!): Farm
  }
`;
