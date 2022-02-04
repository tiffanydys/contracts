import Decimal from "decimal.js-light";
import { fromWei, toWei } from "web3-utils";
import {
  createFarm,
  getFarmsByAccount,
  updateSession,
  Account,
} from "../../repository/farms";
import { fetchOnChainData, loadNFTFarm } from "../../web3/contracts";
import { INITIAL_FARM } from "../game/lib/constants";
import { KNOWN_IDS, KNOWN_ITEMS } from "../game/types";
import { GameState, InventoryItemName } from "../game/types/game";
import { getV1GameState } from "../sunflowerFarmers/sunflowerFarmers";

type StartSessionArgs = {
  farmId: number;
  sessionId: string;
  sender: string;
  hasV1Farm: boolean;
  hasV1Tokens: boolean;
};

export async function startSession({
  farmId,
  sender,
  sessionId,
  hasV1Farm,
  hasV1Tokens,
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
      const sunflowerFarmersSnapshot = await getV1GameState({
        address: sender,
        hasFarm: hasV1Farm,
        hasTokens: hasV1Tokens,
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

  // TODO - validate the sessionID is the same
  // This is to prevent race conditons of someone withdrawing and trying to create a new session quickly

  const gameState: GameState = {
    // Keep the planted fields
    ...farm.gameState,
    // Load the token + NFT balances
    balance: onChainData.balance,
    // TODO - inventory: onChainData.inventory,
    inventory: {},
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

function makeFarm(gameState: Account["gameState"]): GameState {
  console.log({ gameState });
  // Convert the string values into decimals
  const inventory = Object.keys(gameState.inventory).reduce(
    (items, itemName) => ({
      ...items,
      [itemName]: new Decimal(
        gameState.inventory[itemName as InventoryItemName]
      ),
    }),
    {} as Record<InventoryItemName, Decimal>
  );

  return {
    ...gameState,
    balance: new Decimal(gameState.balance),
    inventory,
  };
}

type Changeset = {
  sfl: number;
  inventory: Record<number, number>;
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
  const wei = Number(toWei(balance.abs().toString()));

  const items = [
    ...new Set([
      ...(Object.keys(gameState.inventory) as InventoryItemName[]),
      ...(Object.keys(snapshot.inventory) as InventoryItemName[]),
    ]),
  ];

  const inventory = items.reduce((inv, name) => {
    const amount = (gameState.inventory[name] || new Decimal(0)).sub(
      snapshot.inventory[name] || new Decimal(0)
    );

    if (amount.equals(0)) {
      return inv;
    }

    return {
      ...inv,
      [KNOWN_IDS[name]]: Number(toWei(amount.toString())),
    };
  }, {});

  return {
    sfl: wei,
    inventory,
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
