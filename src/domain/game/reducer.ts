import { GameState } from "./types/game";
import { GameEvent, processEvent } from "./events";

export function processActions(state: GameState, actions: GameEvent[]) {
  // Validate actions
  if (!Array.isArray(actions)) {
    throw new Error("Expected actions to be an array");
  }

  return actions.reduce((farm, action) => {
    return processEvent(farm, action);
  }, state);
}
