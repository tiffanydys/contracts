import AWS from "aws-sdk";
import { KNOWN_IDS } from "../domain/game/types";
import { GameState, InventoryItemName } from "../domain/game/types/game";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

// Store decimal values as strings instead
export type FarmSession = Omit<GameState, "balance" | "inventory"> & {
  balance: string;
  inventory: Record<InventoryItemName, string>;
};

export type Account = {
  id: number;
  owner: string;
  sessionId?: string;
  createdAt: string;
  updatedAt: string;
  gameState: FarmSession;
  previousGameState: FarmSession;
};

export async function getFarmsByAccount(account: string): Promise<Account[]> {
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

export async function getFarmById(
  account: string,
  id: number
): Promise<Account> {
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

/**
 * Santize the farm data
 */
function makeDBItem(farm: GameState): FarmSession {
  const inventory = Object.keys(farm.inventory).reduce((items, itemName) => {
    const value = farm.inventory[itemName as InventoryItemName];

    if (!value || value.lessThanOrEqualTo(0)) {
      return items;
    }

    return {
      ...items,
      [itemName]: value.toString(),
    };
  }, {} as Record<InventoryItemName, string>);

  return {
    ...farm,
    balance: farm.balance.toString(),
    inventory,
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
}: CreateFarm): Promise<Account> {
  const Item: Account = {
    id: id,
    sessionId: sessionId,
    createdAt: new Date().toISOString(),
    owner,
    updatedAt: new Date().toISOString(),
    gameState: makeDBItem(gameState),
    previousGameState: makeDBItem(previousGameState),
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
      ":gameState": makeDBItem(gameState),
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
  const safeFarm = makeDBItem(gameState);

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
