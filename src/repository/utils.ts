import { GameState, InventoryItemName } from "../domain/game/types/game";

import { FarmSession } from "./types";

/**
 * Santize the farm data
 */
export function makeDBItem(farm: GameState): FarmSession {
  const inventory = Object.keys(farm.inventory).reduce((items, itemName) => {
    const value = farm.inventory[itemName as InventoryItemName];

    if (!value || value.lessThanOrEqualTo(0)) {
      return items;
    }

    return {
      ...items,
      [itemName]: value.toString(),
    };
  }, {} as Record<InventoryItemName, string>);

  return {
    ...farm,
    balance: farm.balance.toString(),
    inventory,
  };
}
