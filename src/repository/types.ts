import {
  GameState,
  InventoryItemName,
  Rock,
  Tree,
} from "../domain/game/types/game";

export type SanitizedTree = Omit<Tree, "wood"> & {
  wood: string;
};

export type SanitizedRock = Omit<Rock, "amount"> & {
  amount: string;
};

/**
 * We need to stringify Decimal values before committing otherwise they get saved as objects
 */
export type FarmSession = Omit<
  GameState,
  | "balance"
  | "skills"
  | "inventory"
  | "stock"
  | "trees"
  | "stones"
  | "iron"
  | "gold"
> & {
  balance: string;
  skills: {
    farming: string;
    gathering: string;
  };
  inventory: Partial<Record<InventoryItemName, string>>;
  stock: Partial<Record<InventoryItemName, string>>;
  trees: Record<number, SanitizedTree>;
  stones: Record<number, SanitizedRock>;
  iron: Record<number, SanitizedRock>;
  gold: Record<number, SanitizedRock>;
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
