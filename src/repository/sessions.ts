import AWS from "aws-sdk";
import { GameState } from "../domain/game/types/game";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

export type FarmSession = Omit<GameState, "balance"> & {
  balance: string;
};

// TODO - rename?
export type AccountFarm = {
  id: number;
  owner: string;
  sessionId?: string;
  createdAt: string;
  updatedAt: string;
  gameState: FarmSession;
  previousGameState: FarmSession;
};

export async function getFarmsByAccount(
  account: string
): Promise<AccountFarm[]> {
  const getParams = {
    TableName: process.env.tableName as string,
    KeyConditionExpression: "#owner = :owner",
    ExpressionAttributeNames: {
      "#owner": "owner",
    },
    ExpressionAttributeValues: {
      ":owner": account,
    },
  };

  const results = await dynamoDb.query(getParams).promise();

  return results.Items as AccountFarm[];
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
  owner: string;
  gameState: GameState;
  previousGameState: GameState;
};
export async function createFarm({
  id,
  sessionId,
  owner,
  gameState,
  previousGameState,
}: CreateFarm): Promise<AccountFarm> {
  const Item: AccountFarm = {
    id: id,
    sessionId: sessionId,
    createdAt: new Date().toISOString(),
    owner,
    updatedAt: new Date().toISOString(),
    gameState: makeFarm(gameState),
    previousGameState: makeFarm(previousGameState),
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
  owner: string;
  gameState: GameState;
};

export async function updateFarm({ id, owner, gameState }: UpdateFarm) {
  const updateParams = {
    TableName: process.env.tableName as string,
    Key: {
      id,
      owner,
    },
    UpdateExpression: "SET updatedAt = :updatedAt, gameState = :gameState",
    ExpressionAttributeValues: {
      ":updatedAt": new Date().toISOString(),
      ":gameState": makeFarm(gameState),
    },
  };
  await dynamoDb.update(updateParams).promise();
}

type UpdateSession = {
  id: number;
  owner: string;
  sessionId: string;
  gameState: GameState;
  previousGameState?: GameState;
};

export async function updateSession({
  id,
  sessionId,
  owner,
  gameState,
}: UpdateSession) {
  const safeFarm = makeFarm(gameState);

  const updateParams = {
    TableName: process.env.tableName as string,
    Key: {
      id,
      owner,
    },
    // Update the "tally" column
    UpdateExpression:
      "SET sessionId = :sessionId, updatedAt = :updatedAt, gameState = :gameState, previousGameState = :previousGameState",
    ExpressionAttributeValues: {
      ":sessionId": sessionId,
      ":updatedAt": new Date().toISOString(),
      ":gameState": safeFarm,
      ":previousGameState": safeFarm,
    },
  };
  await dynamoDb.update(updateParams).promise();
}
