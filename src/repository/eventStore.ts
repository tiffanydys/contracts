import { S3 } from "aws-sdk";
import { GameEvent } from "../domain/game/events";
import { GameState } from "../domain/game/types/game";

const s3 = new S3();

type FlaggedEvent = {
  account: string;
  farmId: number;
  events: (GameEvent | { captcha: "failed" })[];
  state?: GameState;
  version: number;
};

export function storeFlaggedEvents({
  account,
  farmId,
  events,
  state,
  version,
}: FlaggedEvent) {
  const key = `land/${farmId}/flagged/${version}.json`;

  const params = {
    Bucket: process.env.bucketName as string,
    Key: key,
    Body: JSON.stringify({
      events,
      account,
      state,
      createdAt: new Date().toISOString(),
    }),
  };

  return s3.putObject(params).promise();
}

type SyncEvent = {
  account: string;
  farmId: number;
  changeset: GameState;
  version: number;
  sessionId: string;
};

export function storeSync({
  account,
  farmId,
  version,
  changeset,
  sessionId,
}: SyncEvent) {
  console.log("Real sync");
  const key = `land/${farmId}/sync/${version}.json`;

  const params = {
    Bucket: process.env.bucketName as string,
    Key: key,
    Body: JSON.stringify({
      account,
      changeset,
      sessionId,
      createdAt: new Date().toISOString(),
    }),
  };

  return s3.putObject(params).promise();
}

type StoredEvents = {
  account: string;
  events: GameEvent[];
  createdAt: string;
};

type SaveEvent = {
  account: string;
  farmId: number;
  events: GameEvent[];
  version: number;
};

export async function storeEvents({
  account,
  farmId,
  version,
  events,
}: SaveEvent) {
  const key = `land/${farmId}/events/${version}.json`;

  const previousEvents = await getStoredEvents({ farmId, version });
  const body: StoredEvents = {
    account,
    events: [...previousEvents, ...events],
    createdAt: new Date().toISOString(),
  };

  const params = {
    Bucket: process.env.bucketName as string,
    Key: key,
    Body: JSON.stringify(body),
  };

  return s3.putObject(params).promise();
}

export async function getStoredEvents({
  farmId,
  version,
}: {
  farmId: number;
  version: number;
}): Promise<GameEvent[]> {
  const key = `land/${farmId}/events/${version}.json`;
  const params = {
    Bucket: process.env.bucketName as string,
    Key: key,
  };

  try {
    const events = await s3.getObject(params).promise();
    const parsed: StoredEvents = JSON.parse(events.Body as string);

    return parsed.events;
  } catch (e) {
    if ((e as any).code === "NoSuchKey") {
      return [];
    }

    throw e;
  }
}

type WithdrawEvent = {
  account: string;
  farmId: number;
  version: number;
  sessionId: string;
  sfl: string;
  ids: number[];
  amounts: string[];
};

export function storeWithdraw({
  account,
  farmId,
  version,
  sfl,
  ids,

  amounts,
  sessionId,
}: WithdrawEvent) {
  const key = `land/${farmId}/sync/${version}.json`;

  const params = {
    Bucket: process.env.bucketName as string,
    Key: key,
    Body: JSON.stringify({
      account,
      sessionId,

      sfl,
      ids,
      amounts,

      createdAt: new Date().toISOString(),
    }),
  };

  return s3.putObject(params).promise();
}

type MigrationEvent = {
  account: string;
  farmId: number;
  state: GameState;
};

type Migration = {
  farmId: number;
  state: GameState;
  createdAt: string;
};
export function storeMigrationEvent({
  account,
  farmId,
  state,
}: MigrationEvent) {
  const key = `account/${account}/migration.json`;

  const migration: Migration = {
    farmId,
    state,
    createdAt: new Date().toISOString(),
  };

  const params = {
    Bucket: process.env.bucketName as string,
    Key: key,
    Body: JSON.stringify(migration),
  };

  return s3.putObject(params).promise();
}

export async function getMigrationEvent(
  account: string
): Promise<Migration | null> {
  const key = `account/${account}/migration.json`;

  const params = {
    Bucket: process.env.bucketName as string,
    Key: key,
  };
  console.log({ params });

  try {
    const migration = await s3.getObject(params).promise();
    return migration.Body as Migration;
  } catch (e) {
    console.log({ e });
    if ((e as any).code === "NoSuchKey") {
      return null;
    }
    throw e;
  }
}
