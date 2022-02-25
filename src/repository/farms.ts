import { GameState } from "../domain/game/types/game";

import {
  create,
  getFarm,
  getFarms,
  updateGameState,
  createSession,
  blacklist,
} from "./db";
import { FarmSession, Account } from "./types";
import { makeDBItem } from "./utils";

export { FarmSession, Account };

export async function getFarmsByAccount(account: string): Promise<Account[]> {
  return getFarms(account);
}

export async function getFarmById(
  account: string,
  id: number
): Promise<Account> {
  return getFarm(account, id);
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
    owner,
    updatedAt: new Date().toISOString(),
    gameState: makeDBItem(gameState),
    previousGameState: makeDBItem(previousGameState),
    version: 1,
    flaggedCount: 0,
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
  owner: string;
};

export async function blacklistFarm({ id, owner }: Blacklist) {
  return await blacklist({
    id,
    owner,
  });
}
