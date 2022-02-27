import AWS from "aws-sdk";

import { FarmSession, Account } from "./types";

export { FarmSession, Account };

const dynamoDb = new AWS.DynamoDB.DocumentClient();

export async function getFarm(id: number): Promise<Account> {
  const getParams = {
    TableName: process.env.tableName as string,
    Key: {
      id,
    },
  };

  const results = await dynamoDb.get(getParams).promise();

  return results.Item as Account;
}

export async function create(item: Account): Promise<Account> {
  const putParams = {
    TableName: process.env.tableName as string,
    Item: item,
  };

  await dynamoDb.put(putParams).promise();

  return item;
}

type UpdateFarm = {
  id: number;
  owner: string;
  session: FarmSession;
  flaggedCount: number;
};

export async function updateGameState({
  id,
  owner,
  session,
  flaggedCount,
}: UpdateFarm) {
  const updateParams = {
    TableName: process.env.tableName as string,
    Key: {
      id,
    },
    UpdateExpression:
      "SET updatedAt = :updatedAt, updatedBy = :updatedBy, gameState = :gameState, flaggedCount = :flaggedCount",
    ExpressionAttributeValues: {
      ":updatedAt": new Date().toISOString(),
      ":updatedBy": owner,
      ":gameState": session,
      ":flaggedCount": flaggedCount,
    },
  };
  await dynamoDb.update(updateParams).promise();
}

type UpdateSession = {
  id: number;
  owner: string;
  sessionId: string;
  session: FarmSession;
  version: number;
};

export async function createSession({
  id,
  sessionId,
  owner,
  session,
  version,
}: UpdateSession) {
  const updateParams = {
    TableName: process.env.tableName as string,
    Key: {
      id,
      owner,
    },
    UpdateExpression:
      "SET sessionId = :sessionId, updatedAt = :updatedAt, updatedBy = :updatedBy, gameState = :gameState, previousGameState = :previousGameState, version = :version",
    ExpressionAttributeValues: {
      ":sessionId": sessionId,
      ":updatedAt": new Date().toISOString(),
      ":updatedBy": owner,
      ":gameState": session,
      ":previousGameState": session,
      ":version": version,
    },
  };
  await dynamoDb.update(updateParams).promise();
}

type Blacklist = {
  id: number;
};

export async function blacklist({ id }: Blacklist) {
  const updateParams = {
    TableName: process.env.tableName as string,
    Key: {
      id,
    },
    UpdateExpression: "SET blacklistedAt = :blacklistedAt",
    ExpressionAttributeValues: {
      ":blacklistedAt": new Date().toISOString(),
    },
  };
  await dynamoDb.update(updateParams).promise();
}

type UpdateFlaggedCount = {
  id: number;
  flaggedCount: number;
};

export async function updateFlaggedCount({
  id,
  flaggedCount,
}: UpdateFlaggedCount) {
  const updateParams = {
    TableName: process.env.tableName as string,
    Key: {
      id,
    },
    UpdateExpression: "SET flaggedCount = :flaggedCount",
    ExpressionAttributeValues: {
      ":flaggedCount": flaggedCount,
    },
  };
  await dynamoDb.update(updateParams).promise();
}

type VerifyAccount = {
  id: number;
  verifyAt: string;
};

export async function verifyAccount({ id, verifyAt }: VerifyAccount) {
  const updateParams = {
    TableName: process.env.tableName as string,
    Key: {
      id,
    },
    UpdateExpression: "SET verifyAt = :verifyAt",
    ExpressionAttributeValues: {
      ":verifyAt": verifyAt,
    },
  };
  await dynamoDb.update(updateParams).promise();
}
