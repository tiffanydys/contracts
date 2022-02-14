import { S3 } from "aws-sdk";
import { GameEvent } from "../domain/game/events";
import { GameState } from "../domain/game/types/game";

const s3 = new S3();

type PlayerEvent = {
  account: string;
  farmId: number;
  events: GameEvent[];
  state: GameState;
};

export function storeEvents({ account, farmId, events, state }: PlayerEvent) {
  const key = `${farmId}/${Date.now()}.json`;

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
