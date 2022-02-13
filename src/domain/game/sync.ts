import Decimal from "decimal.js-light";
import { fromWei, toWei } from "web3-utils";

import { getFarmById } from "../../repository/farms";
import { GameState, InventoryItemName, Inventory } from "./types/game";
import { LimitedItems, CraftableName, LimitedItem } from "./types/craftables";

import { getItemUnit } from "../../services/web3/utils";
import { KNOWN_IDS } from "./types";
import { craft } from "./events/craft";
import { makeGame } from "./lib/transforms";

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

export function calculateChangeset({
  current,
  previous,
}: {
  current: GameState;
  previous: GameState;
}): GameState {
  const balance = current.balance.minus(previous.balance);
  const wei = new Decimal(toWei(balance.toString()));

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

  // TODO - call to the Blockchain and see if some are still available
  // Currently only the UI will be protecting this limit

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
