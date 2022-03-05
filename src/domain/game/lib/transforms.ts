import Decimal from "decimal.js-light";
import { fromWei } from "web3-utils";

import { Account } from "../../../repository/farms";
import { getItemUnit } from "../../../services/web3/utils";
import { KNOWN_IDS } from "../types";
import {
  GameState,
  Inventory,
  InventoryItemName,
  Rock,
  Tree,
} from "../types/game";
import {
  INITIAL_GOLD,
  INITIAL_IRON,
  INITIAL_STONE,
  INITIAL_TREES,
} from "./constants";

export function makeGame(gameState: Account["gameState"]): GameState {
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

  // Convert the string values into decimals
  const stock = Object.keys(gameState.stock).reduce(
    (items, itemName) => ({
      ...items,
      [itemName]: new Decimal(
        gameState.stock[itemName as InventoryItemName] || 0
      ),
    }),
    {} as Record<InventoryItemName, Decimal>
  );

  const dbTrees = gameState.trees || INITIAL_TREES;
  // Convert the string values into decimals
  const trees = Object.keys(dbTrees).reduce((items, index) => {
    const dbTree = dbTrees[Number(index)];
    const tree: Tree = {
      choppedAt: dbTree.choppedAt,
      wood: new Decimal(dbTree.wood),
    };

    return {
      ...items,
      [Number(index)]: tree,
    };
  }, {} as Record<InventoryItemName, Decimal>);

  const dbStones = gameState.stones || INITIAL_STONE;
  // Convert the string values into decimals
  const stones = Object.keys(dbStones).reduce((items, index) => {
    const dbStone = dbStones[Number(index)];
    const rock: Rock = {
      minedAt: dbStone.minedAt,
      amount: new Decimal(dbStone.amount),
    };

    return {
      ...items,
      [Number(index)]: rock,
    };
  }, {} as Record<InventoryItemName, Decimal>);

  const dbIron = gameState.iron || INITIAL_IRON;
  // Convert the string values into decimals
  const iron = Object.keys(dbIron).reduce((items, index) => {
    const dbValue = dbIron[Number(index)];
    const rock: Rock = {
      minedAt: dbValue.minedAt,
      amount: new Decimal(dbValue.amount),
    };

    return {
      ...items,
      [Number(index)]: rock,
    };
  }, {} as Record<InventoryItemName, Decimal>);

  const dbGold = gameState.gold || INITIAL_GOLD;
  // Convert the string values into decimals
  const gold = Object.keys(dbGold).reduce((items, index) => {
    const dbValue = dbGold[Number(index)];
    const rock: Rock = {
      minedAt: dbValue.minedAt,
      amount: new Decimal(dbValue.amount),
    };

    return {
      ...items,
      [Number(index)]: rock,
    };
  }, {} as Record<InventoryItemName, Decimal>);

  return {
    ...gameState,
    balance: new Decimal(gameState.balance),
    inventory,
    stock,
    trees,
    stones,
    iron,
    gold,
  };
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
