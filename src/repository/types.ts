import { GameState, InventoryItemName, Tree } from "../domain/game/types/game";

export type SanitizedTree = Omit<Tree, "wood"> & {
  wood: string;
};

// Store decimal values as strings instead
export type FarmSession = Omit<
  GameState,
  "balance" | "inventory" | "stock" | "trees"
> & {
  balance: string;
  inventory: Partial<Record<InventoryItemName, string>>;
  stock: Partial<Record<InventoryItemName, string>>;
  trees: Record<number, SanitizedTree>;
};

export type Account = {
  id: number;
  sessionId: string;

  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;

  gameState: FarmSession;
  previousGameState: FarmSession;

  version: number;
  flaggedCount: number;
  blacklistedAt?: string;

  // Future timestamp where they need to solve captcha before being able to continue
  verifyAt: string;
};
