import { GameState, InventoryItemName, Tree } from "../domain/game/types/game";

import { FarmSession, SanitizedTree, SanitizedRock } from "./types";

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

  const stones = Object.keys(farm.stones).reduce((items, index) => {
    const stone = farm.stones[Number(index)];
    return {
      ...items,
      [index]: {
        ...stone,
        amount: stone.amount.toString(),
      } as SanitizedRock,
    };
  }, {} as Record<number, SanitizedRock>);

  const iron = Object.keys(farm.iron).reduce((items, index) => {
    const rock = farm.iron[Number(index)];
    return {
      ...items,
      [index]: {
        ...rock,
        amount: rock.amount.toString(),
      } as SanitizedRock,
    };
  }, {} as Record<number, SanitizedRock>);

  const gold = Object.keys(farm.gold).reduce((items, index) => {
    const rock = farm.gold[Number(index)];
    return {
      ...items,
      [index]: {
        ...rock,
        amount: rock.amount.toString(),
      } as SanitizedRock,
    };
  }, {} as Record<number, SanitizedRock>);

  return {
    ...farm,
    balance: farm.balance.toString(),
    skills: {
      farming: farm.skills?.farming?.toString() || "0",
      gathering: farm.skills?.gathering?.toString() || "0",
    },

    inventory,
    stock,
    trees,
    stones,
    iron,
    gold,
  };
}

// TODO - validate data going into the DB as well. If this gets corrupted a migration would be extremely
