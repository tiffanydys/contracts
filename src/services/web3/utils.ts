import { InventoryItemName } from "../../domain/game/types/game";
import { FOODS, LimitedItems } from "../../domain/game/types/craftables";

/**
 * Food and limited items have a unit of 1
 * Other items use 18 decimals for decimal point storage
 */
export function getItemUnit(name: InventoryItemName) {
  if (name in FOODS || name in LimitedItems) {
    return "wei";
  }

  return "ether";
}
