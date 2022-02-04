import Decimal from "decimal.js-light";
import { fromWei } from "web3-utils";
import { loadV1Balance, loadV1Farm, V1Fruit } from "../../web3/contracts";
import { SeedName } from "../game/types/crops";
import { GameState, Inventory, InventoryItemName } from "../game/types/game";

import { balances } from "./constants/balances";
import { POOL_BALANCE } from "./constants/liquidityPools";

const CROP_CONVERSION: Record<V1Fruit, SeedName> = {
  // Even give them some sunflower seeds for their empty fields <3
  "0": "Sunflower Seed",
  "1": "Sunflower Seed",
  "2": "Potato Seed",
  "3": "Pumpkin Seed",
  "4": "Carrot Seed",
  "5": "Cabbage Seed",
  "6": "Beetroot Seed",
  "7": "Cauliflower Seed",
};

type Options = {
  address: string;
  hasFarm: boolean;
  hasTokens: boolean;
};

type PartialGame = Pick<GameState, "balance" | "inventory">;

export async function getV1GameState({
  address,
  hasFarm,
  hasTokens,
}: Options): Promise<PartialGame> {
  const gameState: PartialGame = {
    balance: new Decimal(0),
    inventory: {},
  };

  // Load any liquidity they had at the time of the snapshot
  // Hard coded file

  // TODO FT values with wei conversion?

  // Preload inventory from hard coded file
  const inventorySnapshot = balances[address];
  if (inventorySnapshot) {
    console.log({ inventorySnapshot });
    gameState.inventory = Object.keys(inventorySnapshot).reduce(
      (acc, key) => ({
        ...acc,
        [key]: new Decimal(
          inventorySnapshot[key as InventoryItemName] as string
        ),
      }),
      {} as Inventory
    ) as Inventory;
    console.log({ converted: gameState.inventory });
  }

  const liquidityPool = POOL_BALANCE[address];
  if (liquidityPool) {
    gameState.balance.add(liquidityPool);
  }

  if (hasTokens) {
    const balance = await loadV1Balance(address);

    if (balance) {
      gameState.balance = new Decimal(fromWei(balance));
    }
  }

  if (hasFarm) {
    const fields = await loadV1Farm(address);

    if (fields.length > 5) {
      gameState.inventory["Pumpkin Soup"] = new Decimal(1);
    }

    if (fields.length > 8) {
      gameState.inventory["Sauerkraut"] = new Decimal(1);
    }

    if (fields.length > 11) {
      gameState.inventory["Roasted Cauliflower"] = new Decimal(1);
    }

    if (fields.length > 14) {
      // TODO give them statue
      gameState.inventory["Sunflower Tombstone"] = new Decimal(1);
    }

    fields.forEach((field) => {
      const seed = CROP_CONVERSION[field.fruit];
      gameState.inventory[seed] = (
        gameState.inventory[seed] || new Decimal(0)
      ).add(1);
    });
  }

  return gameState;
}
