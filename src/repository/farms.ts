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

function inventoryToIDs(
  inventory: GameState["inventory"]
): Record<number, string> {
  return Object.keys(inventory).reduce(
    (items, itemName) => ({
      ...items,
      [KNOWN_IDS[itemName as InventoryItemName]]: "0",
    }),
    {} as Record<number, string>
  );
}

/**
 * Santize the farm data
 */
function makeFarm(farm: GameState): FarmSession {
  const inventory = Object.keys(farm.inventory).reduce(
    (items, itemName) => ({
      ...items,
      [itemName]: farm.inventory[itemName as InventoryItemName]?.toString(),
    }),
    {} as Record<InventoryItemName, string>
  );

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
