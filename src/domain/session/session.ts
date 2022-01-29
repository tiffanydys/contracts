import Decimal from "decimal.js-light";
import { fromWei, toWei } from "web3-utils";
import {
  createFarm,
  getFarmsByAccount,
  updateSession,
  AccountFarm,
} from "../../repository/sessions";
import { getSnapshotByAddress } from "../../repository/sunflowerFarmers";
import { fetchOnChainData, loadNFTFarm } from "../../web3/contracts";
import { INITIAL_FARM } from "../game/lib/constants";
import { GameState } from "../game/types/game";

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

    // Make sure the user has not already created a farm (and potentially migrated)
    if (farms.length === 0) {
      // Load a V1 snapshot (any resources/inventory they had from the old game)
      const sunflowerFarmersSnapshot = await getSnapshotByAddress(sender);

      if (sunflowerFarmersSnapshot) {
        initialFarm = {
          ...initialFarm,
          balance: new Decimal(sunflowerFarmersSnapshot.balance),
          inventory: sunflowerFarmersSnapshot.inventory,
        };
      }
    }

    await createFarm({
      id: farmId,
      owner: sender,
      gameState: initialFarm,

      // Will be 0 but still let UI pass it in
      sessionId: sessionId,
    });

    return initialFarm;
  }

  let farmState = makeFarm(farm.gameState);

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
    // Keep the planted fields
    ...farm.gameState,
    // Load the token + NFT balances
    balance: new Decimal(fromWei(onChainData.balance.toString(), "ether")),
    // TODO - inventory: onChainData.inventory,
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

function makeFarm(gameState: AccountFarm["gameState"]): GameState {
  return {
    ...gameState,
    balance: new Decimal(gameState.balance),
    // TODO - inventory: farm.inventory,
  };
}

type Changeset = {
  mintTokens: string;
  burnTokens: string;
  // Inventory
  mintIds: string[];
  mintAmounts: string[];
  burnIds: string[];
  burnAmounts: string[];
};

type CalculateChangesetArgs = {
  id: number;
  owner: string;
};

export async function calculateChangeset({
  id,
  owner,
}: CalculateChangesetArgs): Promise<Changeset> {
  let farms = await getFarmsByAccount(owner);
  const farm = farms.find((farm) => farm.id === id);

  if (!farm) {
    throw new Error("Farm does not exist");
  }

  const gameState = makeFarm(farm.gameState);
  const snapshot = makeFarm(farm.previousGameState);

  const balance = gameState.balance.minus(snapshot.balance);

  const wei = toWei(balance.abs().toString());

  return {
    mintTokens: balance.isPositive() ? wei : "0",
    burnTokens: balance.isNegative() ? wei : "0",
    mintIds: [],
    mintAmounts: [],
    burnIds: [],
    burnAmounts: [],
  };
}

/**

  DynamoDB use the farmID + owner (sort key) to identify the session

 */

/** 
--farms
  --farmId
    --address
      --sessionId
        start.json
        farm.json
        timestamp.json

-- farms
  --123
    --0x750a0as0asc0ac (42 characters)
      --0xc64a915fad97e6756d78050482ec (Sliced to 63 characters)
        -start.json
        -farm.json
        -1023910129202.json
        -1813910129202.json
      --0xc64a915fad97e6756d78050482ec (Sliced to 63 characters)
        -start.json
        -farm.json
        -1023910129202.json
        -1813910129202.json
      
*/
