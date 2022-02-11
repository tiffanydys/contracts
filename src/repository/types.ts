import { GameState, InventoryItemName } from "../domain/game/types/game";

// Store decimal values as strings instead
export type FarmSession = Omit<GameState, "balance" | "inventory" | "stock"> & {
  balance: string;
  inventory: Partial<Record<InventoryItemName, string>>;
  stock: Partial<Record<InventoryItemName, string>>;
};

export type Account = {
  id: number;
  owner: string;
  sessionId?: string;
  createdAt: string;
  updatedAt: string;
  gameState: FarmSession;
  previousGameState: FarmSession;
};
