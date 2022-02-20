import Decimal from "decimal.js-light";
import { fromWei } from "web3-utils";
import { loadV1Balance, loadV1Farm } from "../../services/web3/polygon";
import { Square, V1Fruit } from "../../services/web3/types";
import { CropName } from "../game/types/crops";
import { Inventory, InventoryItemName } from "../game/types/game";

import { balances } from "./constants/balances";
import { POOL_BALANCE } from "./constants/liquidityPools";

const CROP_CONVERSION: Record<V1Fruit, CropName> = {
  "0": "Sunflower",
  "1": "Sunflower",
  "2": "Potato",
  "3": "Pumpkin",
  "4": "Carrot",
  "5": "Cauliflower",
  "6": "Parsnip",
  "7": "Radish",
};

type Options = {
  address: string;
};

type PartialGame = {
  balance: Decimal;
  inventory: Inventory;
};

export async function getV1GameState({
  address,
}: Options): Promise<PartialGame> {
  const gameState: PartialGame = {
    balance: new Decimal(0),
    inventory: {},
  };

  const inventorySnapshot = balances[address.toLowerCase()];
  if (inventorySnapshot) {
    gameState.inventory = Object.keys(inventorySnapshot).reduce(
      (items, itemName) => ({
        ...items,
        [itemName]: new Decimal(
          inventorySnapshot[itemName as InventoryItemName] as string
        ),
      }),
      {} as Inventory
    ) as Inventory;
  }

  const liquidityPool = POOL_BALANCE[address];
  if (liquidityPool) {
    gameState.balance.add(liquidityPool);
  }

  const balance = await loadV1Balance(address);
  if (balance) {
    gameState.balance = new Decimal(fromWei(balance));
  }

  const fields = await loadV1Farm(address);
  gameState.inventory = makeInventory(fields, gameState.inventory);

  console.info(
    `Sunflower Farmers Migration ${address}`,
    JSON.stringify(gameState, null, 2)
  );

  return gameState;
}

/**
 * Generates an inventory based on the V1 fields they had
 */
export function makeInventory(fields: Square[], inventory: Inventory) {
  const updatedInventory = { ...inventory };
  if (fields.length > 5) {
    updatedInventory["Pumpkin Soup"] = new Decimal(1);
  }

  if (fields.length > 8) {
    updatedInventory["Sauerkraut"] = new Decimal(1);
  }

  if (fields.length > 11) {
    updatedInventory["Roasted Cauliflower"] = new Decimal(1);
  }

  if (fields.length > 14) {
    // TODO give them statue
    updatedInventory["Sunflower Tombstone"] = new Decimal(1);
  }

  fields.forEach((field) => {
    const crop = CROP_CONVERSION[field.fruit];
    updatedInventory[crop] = (updatedInventory[crop] || new Decimal(0)).add(1);
  });

  return updatedInventory;
}
