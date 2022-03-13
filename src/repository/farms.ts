import { GameState } from "../domain/game/types/game";

import {
  create,
  getFarm,
  updateGameState,
  createSession,
  blacklist,
  updateFlaggedCount,
  verifyAccount,
} from "./db";
import { FarmSession, Account } from "./types";
import { makeDBItem } from "./utils";

export { FarmSession, Account };

export async function getFarmById(id: number): Promise<Account> {
  return getFarm(id);
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
  const item: Account = {
    id: id,
    sessionId: sessionId,
    createdAt: new Date().toISOString(),
    createdBy: owner,
    updatedAt: new Date().toISOString(),
    updatedBy: owner,
    gameState: makeDBItem(gameState),
    previousGameState: makeDBItem(previousGameState),
    version: 1,
    flaggedCount: 0,
    // First verify period should be 15 minutes after playing the game.
    verifyAt: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
  };

  return create(item);
}

type UpdateFarm = {
  id: number;
  owner: string;
  gameState: GameState;
  flaggedCount: number;
};

export async function updateFarm({
  id,
  owner,
  gameState,
  flaggedCount,
}: UpdateFarm) {
  const safeItem = makeDBItem(gameState);
  return await updateGameState({
    id,
    owner,
    session: safeItem,
    flaggedCount,
  });
}

type UpdateSession = {
  id: number;
  owner: string;
  sessionId: string;
  gameState: GameState;
  previousGameState?: GameState;
  version: number;
};

export async function updateSession({
  id,
  sessionId,
  owner,
  gameState,
  version,
}: UpdateSession) {
  const safeFarm = makeDBItem(gameState);

  return await createSession({
    id,
    sessionId,
    owner,
    session: safeFarm,
    version,
  });
}

type Blacklist = {
  id: number;
};

export async function blacklistFarm({ id }: Blacklist) {
  return await blacklist({
    id,
  });
}

type UpdateFlaggedCount = {
  id: number;
  flaggedCount: number;
};

export async function flag({ id, flaggedCount }: UpdateFlaggedCount) {
  return await updateFlaggedCount({
    id,
    flaggedCount,
  });
}

type Verify = {
  id: number;
  createdAt: string;
};

// Every 30 days during beta
const VERIFIED_PERIOD = 1000 * 60 * 60 * 24 * 30;

// 8 hours
const EIGHT_HOURS = 1000 * 60 * 60 * 6;

/**
 * After solving a captcha, the account is verified for 30 minutes
 * We set the next verifyAt timestamp for when this expires
 */
export async function verify({ id, createdAt }: Verify) {
  // Do not make the captcha predictable, add a buffer period
  const buffer = VERIFIED_PERIOD / 5;
  const randomBuffer = Math.floor(Math.random() * buffer);

  // 30 days
  let nextVerifyAt = Date.now() + VERIFIED_PERIOD;

  // If the account is new, captcha more often
  if (new Date(createdAt).getTime() < Date.now() - VERIFIED_PERIOD) {
    nextVerifyAt = Date.now() + EIGHT_HOURS + randomBuffer;
  }

  return await verifyAccount({
    id,
    verifyAt: new Date(nextVerifyAt).toISOString(),
  });
}
