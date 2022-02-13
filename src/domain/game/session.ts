import Decimal from "decimal.js-light";
import { fromWei, toWei } from "web3-utils";

import {
  getFarmsByAccount,
  createFarm,
  updateSession,
} from "../../repository/farms";
import { GameState } from "./types/game";

import {
  loadNFTFarm,
  loadInventory,
  loadBalance,
} from "../../services/web3/polygon";

import { INITIAL_FARM, INITIAL_STOCK } from "./lib/constants";
import { getV1GameState } from "../sunflowerFarmers/sunflowerFarmers";
import { IDS } from "./types";
import { makeGame, makeInventory } from "./lib/transforms";

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
  // We don't really care about this - they could create a session but never be able to save it
  const nftFarm = await loadNFTFarm(farmId);
  if (nftFarm.owner !== sender) {
    throw new Error("You do not own this farm");
  }

  let farms = await getFarmsByAccount(sender);

  const farm = farms.find((farm) => farm.id === farmId);

  // No session was ever created for this farm + account
  if (!farm) {
    // We don't really care about this - they could create a session but never be able to save it
    const nftFarm = await loadNFTFarm(farmId);
    if (nftFarm.owner !== sender) {
      throw new Error("You do not own this farm");
    }

    let initialFarm: GameState = {
      // Keep the planted fields
      ...INITIAL_FARM,
      // Load the token + NFT balances
      balance: new Decimal(0),
    };

    //If a user session does not exist in Sessions.sol, it is represented as 0, which is the following:
    const isInitialSession =
      // We nuke testnet a lot so ignore
      process.env.NETWORK !== "mainnet" ||
      sessionId ===
        "0x0000000000000000000000000000000000000000000000000000000000000000";

    /**
     * Double check they do not already have a farm migrated.
     * Beta.sol allows only one farm per account but still check!
     */
    if (farms.length === 0 && isInitialSession) {
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
    }

    await createFarm({
      id: farmId,
      owner: sender,
      gameState: initialFarm,

      // We want to be able to calculate the changeset for the farm
      previousGameState: INITIAL_FARM,

      // Will be 0 but still let UI pass it in
      sessionId: sessionId,
    });

    return initialFarm;
  }

  let farmState = makeGame(farm.gameState);

  // Does the session ID match?
  const sessionMatches = farm.sessionId === sessionId;

  if (sessionMatches) {
    return farmState;
  }

  // We are out of sync with the Blockchain
  const onChainData = await fetchOnChainData({
    sender: sender,
    farmId: farmId,
  });

  const gameState: GameState = {
    ...farm.gameState,
    balance: onChainData.balance,
    inventory: onChainData.inventory,
    // Reset the stock
    stock: INITIAL_STOCK,
  };

  await updateSession({
    id: farmId,
    gameState,
    // Set the snapshot for the beginning of the session
    previousGameState: gameState,
    sessionId: sessionId,
    owner: sender,
  });

  return gameState;
}

export async function fetchOnChainData({
  sender,
  farmId,
}: {
  sender: string;
  farmId: number;
}) {
  const farmNFT = await loadNFTFarm(farmId);

  if (farmNFT.owner !== sender) {
    throw new Error("Farm is not owned by you");
  }

  const balanceString = await loadBalance(farmNFT.account);
  const balance = new Decimal(fromWei(balanceString, "ether"));

  const inventory = await loadInventory(IDS, farmNFT.account);
  const friendlyInventory = makeInventory(inventory);

  return {
    balance,
    inventory: friendlyInventory,
    id: farmId,
    address: farmNFT.account,
    fields: {},
  } as GameState;
}
