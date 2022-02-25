import AWS from "aws-sdk";

import { FarmSession, Account } from "./types";

export { FarmSession, Account };

const dynamoDb = new AWS.DynamoDB.DocumentClient();

export async function getFarms(account: string): Promise<Account[]> {
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

  return results.Items as Account[];
}

export async function getFarm(account: string, id: number): Promise<Account> {
  const getParams = {
    TableName: process.env.tableName as string,
    Key: {
      owner: account,
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
      owner,
    },
    UpdateExpression:
      "SET updatedAt = :updatedAt, gameState = :gameState, flaggedCount = :flaggedCount",
    ExpressionAttributeValues: {
      ":updatedAt": new Date().toISOString(),
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
    // Update the "tally" column
    UpdateExpression:
      "SET sessionId = :sessionId, updatedAt = :updatedAt, gameState = :gameState, previousGameState = :previousGameState, version = :version",
    ExpressionAttributeValues: {
      ":sessionId": sessionId,
      ":updatedAt": new Date().toISOString(),
      ":gameState": session,
      ":previousGameState": session,
      ":version": version,
    },
  };
  await dynamoDb.update(updateParams).promise();
}
