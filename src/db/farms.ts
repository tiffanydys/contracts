import AWS from "aws-sdk";
import { GameState } from "../gameEngine/types/game";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

export type DBFarm = Omit<GameState, "balance"> & {
  balance: string;
};

type Session = {
  id: number;
  sessionId?: string;
  createdAt: string;
  // Polygon address
  createdBy: string;
  updatedAt: string;
  // Polygon address
  updatedBy: string;
  farm: DBFarm;
};

export async function getFarm(id: number): Promise<Session | null> {
  const getParams = {
    TableName: process.env.tableName as string,
    Key: {
      id,
    },
  };
  const results = await dynamoDb.get(getParams).promise();

  return results.Item as Session;
}

type CreateFarm = {
  id: number;
  sessionId: string;
  createdBy: string;
  farm: GameState;
};
export async function createFarm({
  id,
  sessionId,
  createdBy,
  farm,
}: CreateFarm): Promise<Session> {
  const safeFarm = {
    ...farm,
    balance: farm.balance.toString(),
  };

  const Item: Session = {
    id: id,
    sessionId: sessionId,
    createdAt: new Date().toISOString(),
    createdBy: createdBy,
    updatedAt: new Date().toISOString(),
    updatedBy: createdBy,
    // TODO - check that data is in right format
    farm: safeFarm,
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
  sessionId: string;
  updatedBy: string;
  farm: GameState;
};
export async function saveFarm({ id, sessionId, updatedBy, farm }: UpdateFarm) {
  const safeFarm = {
    ...farm,
    balance: farm.balance.toString(),
  };

  console.log({ safeFarm });

  const updateParams = {
    TableName: process.env.tableName as string,
    Key: {
      id,
    },
    // Update the "tally" column
    UpdateExpression:
      "SET sessionId = :sessionId, updatedAt = :updatedAt, updatedBy = :updatedBy, farm = :farm",
    ExpressionAttributeValues: {
      ":sessionId": sessionId,
      ":updatedAt": new Date().toISOString(),
      ":updatedBy": updatedBy,
      ":farm": safeFarm,
    },
  };
  await dynamoDb.update(updateParams).promise();
}
