import Decimal from "decimal.js-light";
import { fromWei, toWei } from "web3-utils";

import {
  Account,
  getFarmsByAccount,
  updateFarm,
  createFarm,
  updateSession,
  getFarmById,
} from "../../repository/farms";
import { EVENTS, GameEvent } from "./events";
import { GameState, InventoryItemName, Inventory } from "./types/game";
import { LimitedItems, CraftableName, LimitedItem } from "./types/craftables";

import {
  loadNFTFarm,
  loadInventory,
  loadBalance,
} from "../../services/web3/polygon";

import { getItemUnit } from "../../services/web3/utils";
import { INITIAL_FARM } from "../game/lib/constants";
import { getV1GameState } from "../sunflowerFarmers/sunflowerFarmers";
import { IDS, KNOWN_IDS } from "./types";
import { craft } from "./events/craft";

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

  // TODO - also check session ID is 0x0000000000...

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

  console.log("loaded");
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

export async function getChangeset({
  id,
  owner,
}: CalculateChangesetArgs): Promise<GameState> {
  let farm = await getFarmById(owner, id);
  if (!farm) {
    throw new Error("Farm does not exist");
  }

  const current = makeGame(farm.gameState);
  const previous = makeGame(farm.previousGameState);

  return calculateChangeset({ current, previous });
}

export async function calculateChangeset({
  current,
  previous,
}: {
  current: GameState;
  previous: GameState;
}): Promise<GameState> {
  const balance = current.balance.minus(previous.balance);
  const wei = new Decimal(toWei(balance.abs().toString()));

  const items = [
    ...new Set([
      ...(Object.keys(current.inventory) as InventoryItemName[]),
      ...(Object.keys(previous.inventory) as InventoryItemName[]),
    ]),
  ];

  const inventory: Inventory = items.reduce((inv, name) => {
    const amount = (current.inventory[name] || new Decimal(0)).sub(
      previous.inventory[name] || new Decimal(0)
    );

    if (amount.equals(0)) {
      return inv;
    }

    const unit = getItemUnit(name);

    return {
      ...inv,
      [name]: new Decimal(toWei(amount.toString(), unit)),
    };
  }, {});

  return {
    ...current,
    balance: wei,
    inventory,
  };
}

export type GameAction = GameEvent & {
  createdAt: string;
};

function processEvent(state: GameState, action: GameAction): GameState {
  const handler = EVENTS[action.type];

  if (!handler) {
    throw new Error(`Unknown event type: ${action}`);
  }

  const payload = {
    state,
    createdAt: new Date(action.createdAt).getTime(),
    // TODO - fix this type error
    action: action as never,
  };

  return handler(payload);
}

// An event must be saved within 5 minutes before it is considered stale
export const MILLISECONDS_TO_SAVE = 5 * 60 * 1000;

// The events cannot span wider than a 2 minute time range
export const MAX_SECONDS_RANGE = 2 * 60;

// Humanly possible time before executing 2 distinct actions
const HUMAN_BUFFER_MILLSECONDS = 200;

export function processActions(state: GameState, actions: GameAction[]) {
  // Validate actions
  if (!Array.isArray(actions)) {
    throw new Error("Expected actions to be an array");
  }

  const timeRange =
    new Date(actions[actions.length - 1].createdAt).getTime() -
    new Date(actions[0].createdAt).getTime();

  if (timeRange >= MAX_SECONDS_RANGE * 1000) {
    throw new Error("Event range is too large");
  }

  // If they have done multiple actions, make sure it is humanly possible
  if (actions.length > 2) {
    const average = timeRange / actions.length;
    if (average < HUMAN_BUFFER_MILLSECONDS) {
      throw new Error("Too many events in a short time");
    }
  }

  return actions.reduce((farm, action, index) => {
    const createdAt = new Date(action.createdAt);
    if (index > 0) {
      const previousAction = actions[index - 1];
      if (new Date(previousAction.createdAt) > createdAt) {
        throw new Error("Events must be in chronological order");
      }

      const difference =
        createdAt.getTime() - new Date(previousAction.createdAt).getTime();

      if (difference < 100) {
        throw new Error("Event fired too quickly");
      }
    }

    const now = new Date();
    if (createdAt > now) {
      throw new Error("Event cannot be in the future");
    }

    if (createdAt.getTime() < now.getTime() - MILLISECONDS_TO_SAVE) {
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
  let farm = await getFarmById(account, farmId);
  if (!farm) {
    throw new Error("Farm does not exist");
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

type MintOptions = {
  farmId: number;
  account: string;
  item: LimitedItem;
};

/**
 * Creates the changeset
 */
export async function mint({ farmId, account, item }: MintOptions) {
  let farm = await getFarmById(account, farmId);
  if (!farm) {
    throw new Error("Farm does not exist");
  }

  // Pass numbers into a safe format before processing.
  const gameState = makeGame(farm.gameState);

  const newGameState = craft({
    state: gameState,
    action: {
      type: "item.crafted",
      item,
      amount: 1,
    },
    available: Object.keys(LimitedItems) as CraftableName[],
  });

  const changeset = calculateChangeset({
    current: newGameState,
    previous: makeGame(farm.previousGameState),
  });

  return changeset;
}

/**
 * Convert an onchain inventory into the supported game inventory
 * Returned as wei - ['0', '0', '0' ]
 */
export function makeInventory(amounts: string[]): Inventory {
  const inventoryItems = Object.keys(KNOWN_IDS) as InventoryItemName[];

  const inventory = amounts.reduce((items, amount, index) => {
    const name = inventoryItems[index];
    const unit = getItemUnit(name);
    const value = new Decimal(fromWei(amount, unit));

    if (value.equals(0)) {
      return items;
    }

    return {
      ...items,
      [name]: value,
    };
  }, {} as Inventory);

  return inventory;
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
