import { InventoryItemName } from "../../domain/game/types/game";
import { RESOURCES } from "../../domain/game/types/resources";
import { CROPS } from "../../domain/game/types/crops";

/**
 * Tools and resources have 18 decimal places
 * Other items (NFTs) and collectibles have 1
 */
export function getItemUnit(name: InventoryItemName) {
  if (name in CROPS() || name in RESOURCES) {
    return "ether";
  }

  return "wei";
}
