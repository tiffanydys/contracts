import Decimal from "decimal.js-light";
import { getFarmsByAccount, updateFarm } from "../../repository/farms";
import { EVENTS, GameEvent } from "./events";
import { GameState, InventoryItemName } from "./types/game";

type GameAction = GameEvent & {
  createdAt: number;
};

function processEvent(state: GameState, action: GameAction): GameState {
  const handler = EVENTS[action.type];

  if (!handler) {
    throw new Error(`Unknown event type: ${action}`);
  }

  return handler({
    state,
    createdAt: action.createdAt,
    // TODO - fix this type error
    action: action as never,
  });
}

// An event must be saved within 5 minutes before it is considered stale
const MINUTES_TO_SAVE = 5;

export function processActions(state: GameState, actions: GameAction[]) {
  // Validate actions
  if (!Array.isArray(actions)) {
    throw new Error("Expected actions to be an array");
  }

  return actions.reduce((farm, action, index) => {
    if (index > 0) {
      const previousAction = actions[index - 1];
      if (previousAction.createdAt > action.createdAt) {
        throw new Error("Events must be in chronological order");
      }
    }

    if (action.createdAt > Date.now()) {
      throw new Error("Event cannot be in the future");
    }

    if (action.createdAt < Date.now() - MINUTES_TO_SAVE * 60 * 1000) {
      throw new Error("Event is too old");
    }

    return processEvent(farm, action);
  }, state);
}

type SaveArgs = {
  farmId: number;
  account: string;
  actions: GameAction[];
};

export async function save({ farmId, account, actions }: SaveArgs) {
  const farms = await getFarmsByAccount(account);
  const farm = farms.find((f) => f.id === farmId);
  if (!farm) {
    throw new Error("Farm does not exist!");
  }

  // Reuse deserialization

  // Pass numbers into a safe format before processing.
  const gameState: GameState = {
    ...farm.gameState,
    balance: new Decimal(farm.gameState.balance),
    inventory: Object.keys(farm.gameState.inventory).reduce(
      (items, itemName) => ({
        ...items,
        [itemName]: new Decimal(
          farm.gameState.inventory[itemName as InventoryItemName] || 0
        ),
      }),
      {} as Record<InventoryItemName, Decimal>
    ),
  };

  console.log({
    process: gameState,
  });

  const newGameState = processActions(gameState, actions);

  await updateFarm({
    id: farmId,
    gameState: newGameState,
    owner: account,
  });

  return newGameState;
}
