import { InventoryItemName } from "../../domain/game/types/game";
import { TOOLS } from "../../domain/game/types/craftables";
import { RESOURCES } from "../../domain/game/types/resources";

/**
 * Tools and resources have 18 decimal places
 * Other items (NFTs) and collectibles have 1
 */
export function getItemUnit(name: InventoryItemName) {
  if (name in TOOLS || name in RESOURCES) {
    return "ether";
  }

  return "wei";
}
