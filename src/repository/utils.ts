import { GameState, InventoryItemName, Tree } from "../domain/game/types/game";

import { FarmSession, SanitizedTree } from "./types";

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

  const stock = Object.keys(farm.stock).reduce((items, itemName) => {
    const value = farm.stock[itemName as InventoryItemName];

    if (!value || value.lessThanOrEqualTo(0)) {
      return items;
    }

    return {
      ...items,
      [itemName]: value.toString(),
    };
  }, {} as Record<InventoryItemName, string>);

  const trees = Object.keys(farm.trees).reduce((items, index) => {
    const tree = farm.trees[Number(index)];

    return {
      ...items,
      [index]: {
        ...tree,
        wood: tree.wood.toString(),
      } as SanitizedTree,
    };
  }, {} as Record<number, SanitizedTree>);

  return {
    ...farm,
    balance: farm.balance.toString(),
    inventory,
    stock,
    trees,
  };
}
