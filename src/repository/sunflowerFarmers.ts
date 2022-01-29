import AWS from "aws-sdk";
import { GameState } from "../domain/game/types/game";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

export type SunflowerFarmersSnapshot = {
  address: string;
  balance: string;
  inventory: GameState["inventory"];
};

export async function getSnapshotByAddress(
  address: string
): Promise<SunflowerFarmersSnapshot | null> {
  const getParams = {
    TableName: process.env.sunflowerFarmersTableName as string,
    Key: {
      address,
    },
  };
  const results = await dynamoDb.get(getParams).promise();

  return results.Item as SunflowerFarmersSnapshot;
}
