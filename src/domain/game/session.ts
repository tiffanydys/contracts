import Decimal from "decimal.js-light";
import { fromWei } from "web3-utils";

import { createFarm, getFarmById, updateSession } from "../../repository/farms";
import { GameState } from "./types/game";

import {
  loadNFTFarm,
  loadInventory,
  loadBalance,
  FarmNFT,
  loadSession,
} from "../../services/web3/polygon";

import { INITIAL_FARM, INITIAL_STOCK } from "./lib/constants";
import { getV1GameState } from "../sunflowerFarmers/sunflowerFarmers";
import { IDS } from "./types";
import { makeGame, makeInventory } from "./lib/transforms";
import { logInfo } from "../../services/logger";
import {
  getMigrationEvent,
  storeMigrationEvent,
} from "../../repository/eventStore";

type StartSessionArgs = {
  farmId: number;
  sessionId: string;
  sender: string;
};

export async function startSession({
  farmId,
  sender,
  sessionId,
}: StartSessionArgs): Promise<GameState> {
  const farm = await getFarmById(farmId);

  // No session was ever created for this farm NFT
  if (!farm) {
    const nftFarm = await loadNFTFarm(farmId);
    if (nftFarm.owner !== sender) {
      throw new Error("You do not own this farm");
    }

    let initialFarm: GameState = {
      ...INITIAL_FARM,
    };

    const migration = await getMigrationEvent(sender);

    /**
     * Beta.sol allows only one farm per account
     * If a user has a migarte event, we assume they have already performed the migration
     */
    if (!migration) {
      // Load a V1 snapshot (any resources/inventory they had from the old game)
      const sunflowerFarmersSnapshot = await getV1GameState({
        address: sender,
      });

      if (sunflowerFarmersSnapshot) {
        initialFarm = {
          ...initialFarm,
          balance: sunflowerFarmersSnapshot.balance,
          inventory: sunflowerFarmersSnapshot.inventory,
        };
      }

      await storeMigrationEvent({
        account: sender,
        farmId,
        state: initialFarm,
      });
    }

    await createFarm({
      id: farmId,
      owner: sender,
      gameState: initialFarm,

      previousGameState: {
        ...INITIAL_FARM,
      },

      sessionId: sessionId,
    });

    return initialFarm;
  }

  const farmState = makeGame(farm.gameState);

  // Does the session ID match?
  const sessionMatches = farm.sessionId === sessionId;
  const ownerChanged = farm.updatedBy !== sender;

  if (sessionMatches && !ownerChanged) {
    return farmState;
  }

  // We are out of sync with the Blockchain
  const onChainData = await fetchOnChainData({
    farmId: farmId,
    sessionId,
    sender,
  });

  const gameState: GameState = {
    ...farmState,
    balance: onChainData.balance,
    inventory: onChainData.inventory,
  };

  // Reset the stock only on new sessions (not transferring ownership)
  if (!ownerChanged) {
    gameState.stock = INITIAL_STOCK;
  }

  await updateSession({
    id: farmId,
    gameState,
    // Set the snapshot for the beginning of the session
    previousGameState: gameState,
    sessionId: sessionId,
    owner: sender,
    version: farm.version + 1,
  });

  return gameState;
}

export async function fetchOnChainData({
  farmId,
  sessionId,
  sender,
}: {
  farmId: number;
  sessionId: string;
  sender: string;
}) {
  const nftFarm = await loadNFTFarm(farmId);
  if (nftFarm.owner !== sender) {
    throw new Error("You do not own this farm");
  }

  const currentSessionId = await loadSession(farmId);
  if (sessionId !== currentSessionId) {
    throw new Error("Session ID does not match");
  }

  const balanceString = await loadBalance(nftFarm.account);
  const balance = new Decimal(fromWei(balanceString, "ether"));

  const inventory = await loadInventory(IDS, nftFarm.account);
  const friendlyInventory = makeInventory(inventory);

  return {
    balance,
    inventory: friendlyInventory,
    id: farmId,
    address: nftFarm.account,
    // Off chain data
    fields: {},
    stock: {},
    trees: {},
    stones: {},
    iron: {},
    gold: {},
  } as GameState;
}
