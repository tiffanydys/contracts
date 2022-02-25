import { S3 } from "aws-sdk";
import { GameEvent } from "../domain/game/events";
import { GameState } from "../domain/game/types/game";

const s3 = new S3();

type FlaggedEvent = {
  account: string;
  farmId: number;
  events: GameEvent[];
  state: GameState;
  version: number;
};

export function storeFlaggedEvents({
  account,
  farmId,
  events,
  state,
  version,
}: FlaggedEvent) {
  const key = `${farmId}/flagged/${version}.json`;

  const params = {
    Bucket: process.env.bucketName as string,
    Key: key,
    Body: JSON.stringify({
      events,
      account,
      state,
    }),
  };

  return s3.putObject(params).promise();
}

type SyncEvent = {
  account: string;
  farmId: number;
  state: GameState;
  previous: GameState;
  version: number;
};

export function storeState({
  account,
  farmId,
  version,
  state,
  previous,
}: SyncEvent) {
  const key = `${farmId}/sync/${version}.json`;

  const params = {
    Bucket: process.env.bucketName as string,
    Key: key,
    Body: JSON.stringify({
      account,
      state,
      previous,
    }),
  };

  return s3.putObject(params).promise();
}
