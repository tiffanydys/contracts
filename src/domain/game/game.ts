import Decimal from "decimal.js-light";
import { toWei } from "web3-utils";

import {
  Account,
  getFarmsByAccount,
  updateFarm,
  createFarm,
  updateSession,
} from "../../repository/farms";
import { EVENTS, GameEvent } from "./events";
import { GameState, InventoryItemName, Inventory } from "./types/game";

import { fetchOnChainData, loadNFTFarm } from "../../web3/contracts";
import { getItemUnit } from "../../web3/utils";
import { INITIAL_FARM } from "../game/lib/constants";
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

    /**
     * Double check they do not already have a farm migrated.
     * Beta.sol allows only one farm per account but still check!
     */
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

function makeGame(gameState: Account["gameState"]): GameState {
  // Convert the string values into decimals
  const inventory = Object.keys(gameState.inventory).reduce(
    (items, itemName) => ({
      ...items,
      [itemName]: new Decimal(
        gameState.inventory[itemName as InventoryItemName] || 0
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

type CalculateChangesetArgs = {
  id: number;
  owner: string;
};

export async function calculateChangeset({
  id,
  owner,
}: CalculateChangesetArgs): Promise<GameState> {
  let farms = await getFarmsByAccount(owner);
  const farm = farms.find((farm) => farm.id === id);

  if (!farm) {
    throw new Error("Farm does not exist");
  }

  const gameState = makeGame(farm.gameState);
  const snapshot = makeGame(farm.previousGameState);

  const balance = gameState.balance.minus(snapshot.balance);
  const wei = new Decimal(toWei(balance.abs().toString()));

  const items = [
    ...new Set([
      ...(Object.keys(gameState.inventory) as InventoryItemName[]),
      ...(Object.keys(snapshot.inventory) as InventoryItemName[]),
    ]),
  ];

  const inventory: Inventory = items.reduce((inv, name) => {
    const amount = (gameState.inventory[name] || new Decimal(0)).sub(
      snapshot.inventory[name] || new Decimal(0)
    );

    if (amount.equals(0)) {
      return inv;
    }

    const unit = getItemUnit(name);

    return {
      ...inv,
      name: new Decimal(toWei(amount.toString(), unit)),
    };
  }, {});

  return {
    ...gameState,
    balance: wei,
    inventory,
  };
}

export type GameAction = GameEvent & {
  createdAt: number;
};

function processEvent(state: GameState, action: GameAction): GameState {
  const handler = EVENTS[action.type];

  if (!handler) {
    throw new Error(`Unknown event type: ${action}`);
  }

  return handler({
    state,
    createdAt: action.createdAt,
    // TODO - fix this type error
    action: action as never,
  });
}

// An event must be saved within 5 minutes before it is considered stale
export const MILLISECONDS_TO_SAVE = 5 * 60 * 1000;

export function processActions(state: GameState, actions: GameAction[]) {
  // Validate actions
  if (!Array.isArray(actions)) {
    throw new Error("Expected actions to be an array");
  }

  return actions.reduce((farm, action, index) => {
    if (index > 0) {
      const previousAction = actions[index - 1];
      if (previousAction.createdAt > action.createdAt) {
        throw new Error("Events must be in chronological order");
      }
    }

    if (action.createdAt > Date.now()) {
      throw new Error("Event cannot be in the future");
    }

    if (action.createdAt < Date.now() - MILLISECONDS_TO_SAVE) {
      throw new Error("Event is too old");
    }

    return processEvent(farm, action);
  }, state);
}

type SaveArgs = {
  farmId: number;
  account: string;
  actions: GameAction[];
};

export async function save({ farmId, account, actions }: SaveArgs) {
  const farms = await getFarmsByAccount(account);
  const farm = farms.find((f) => f.id === farmId);
  if (!farm) {
    throw new Error("Farm does not exist!");
  }

  // Pass numbers into a safe format before processing.
  const gameState = makeGame(farm.gameState);

  const newGameState = processActions(gameState, actions);

  await updateFarm({
    id: farmId,
    gameState: newGameState,
    owner: account,
  });

  return newGameState;
}
