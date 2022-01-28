import AWS from "aws-sdk";
import { GameState } from "../domain/game/types/game";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

export type FarmSession = Omit<GameState, "balance"> & {
  balance: string;
};

export type Session = {
  id: number;
  sessionId?: string;
  createdAt: string;
  // Polygon address
  createdBy: string;
  updatedAt: string;
  // Polygon address
  updatedBy: string;
  farm: FarmSession;
  oldFarm: FarmSession;
};

export async function getSessionByFarmId(id: number): Promise<Session | null> {
  const getParams = {
    TableName: process.env.tableName as string,
    Key: {
      id,
    },
  };
  const results = await dynamoDb.get(getParams).promise();

  return results.Item as Session;
}

/**
 * Santize the farm data
 */
function makeFarm(farm: GameState): FarmSession {
  return {
    ...farm,
    balance: farm.balance.toString(),
  };
}

type CreateFarm = {
  id: number;
  sessionId: string;
  createdBy: string;
  farm: GameState;
};
export async function createSession({
  id,
  sessionId,
  createdBy,
  farm,
}: CreateFarm): Promise<Session> {
  const safeFarm = makeFarm(farm);

  const Item: Session = {
    id: id,
    sessionId: sessionId,
    createdAt: new Date().toISOString(),
    createdBy: createdBy,
    updatedAt: new Date().toISOString(),
    updatedBy: createdBy,
    farm: safeFarm,
    oldFarm: safeFarm,
  };

  const putParams = {
    TableName: process.env.tableName as string,
    Item,
  };

  await dynamoDb.put(putParams).promise();

  return Item;
}

type UpdateFarm = {
  id: number;
  updatedBy: string;
  farm: GameState;
};

export async function updateFarm({ id, updatedBy, farm }: UpdateFarm) {
  const updateParams = {
    TableName: process.env.tableName as string,
    Key: {
      id,
    },
    // Update the "tally" column
    UpdateExpression:
      "SET updatedAt = :updatedAt, updatedBy = :updatedBy, farm = :farm",
    ExpressionAttributeValues: {
      ":updatedAt": new Date().toISOString(),
      ":updatedBy": updatedBy,
      ":farm": makeFarm(farm),
    },
  };
  await dynamoDb.update(updateParams).promise();
}

type UpdateSession = {
  id: number;
  sessionId: string;
  updatedBy: string;
  farm: GameState;
  oldFarm?: GameState;
};

export async function updateSession({
  id,
  sessionId,
  updatedBy,
  farm,
}: UpdateSession) {
  const safeFarm = makeFarm(farm);

  const updateParams = {
    TableName: process.env.tableName as string,
    Key: {
      id,
    },
    // Update the "tally" column
    UpdateExpression:
      "SET sessionId = :sessionId, updatedAt = :updatedAt, updatedBy = :updatedBy, farm = :farm, oldFarm = :oldFarm",
    ExpressionAttributeValues: {
      ":sessionId": sessionId,
      ":updatedAt": new Date().toISOString(),
      ":updatedBy": updatedBy,
      ":farm": safeFarm,
      ":oldFarm": safeFarm,
    },
  };
  await dynamoDb.update(updateParams).promise();
}
