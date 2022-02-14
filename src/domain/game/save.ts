import { updateFarm, getFarmById } from "../../repository/farms";
import { EVENTS, GameEvent } from "./events";
import { GameState } from "./types/game";

import { makeGame } from "./lib/transforms";
import { storeEvents } from "../../repository/eventStore";

export type GameAction = GameEvent & {
  createdAt: string;
};

function processEvent(state: GameState, action: GameAction): GameState {
  const handler = EVENTS[action.type];

  if (!handler) {
    throw new Error(`Unknown event type: ${action}`);
  }

  const payload = {
    state,
    createdAt: new Date(action.createdAt).getTime(),
    // TODO - fix this type error
    action: action as never,
  };

  return handler(payload);
}

// An event must be saved within 5 minutes before it is considered stale
export const MILLISECONDS_TO_SAVE = 5 * 60 * 1000;

// The events cannot span wider than a 2 minute time range
export const MAX_SECONDS_RANGE = 2 * 60;

// Humanly possible time before executing 2 distinct actions
const HUMAN_BUFFER_MILLSECONDS = 200;

export function processActions(state: GameState, actions: GameAction[]) {
  // Validate actions
  if (!Array.isArray(actions)) {
    throw new Error("Expected actions to be an array");
  }

  const timeRange =
    new Date(actions[actions.length - 1].createdAt).getTime() -
    new Date(actions[0].createdAt).getTime();

  if (timeRange >= MAX_SECONDS_RANGE * 1000) {
    throw new Error("Event range is too large");
  }

  // If they have done multiple actions, make sure it is humanly possible
  if (actions.length > 2) {
    const average = timeRange / actions.length;
    if (average < HUMAN_BUFFER_MILLSECONDS) {
      throw new Error("Too many events in a short time");
    }
  }

  return actions.reduce((farm, action, index) => {
    const createdAt = new Date(action.createdAt);
    if (index > 0) {
      const previousAction = actions[index - 1];
      if (new Date(previousAction.createdAt) > createdAt) {
        throw new Error("Events must be in chronological order");
      }

      const difference =
        createdAt.getTime() - new Date(previousAction.createdAt).getTime();

      if (difference < 100) {
        throw new Error("Event fired too quickly");
      }
    }

    const now = new Date();
    if (createdAt > now) {
      throw new Error("Event cannot be in the future");
    }

    if (createdAt.getTime() < now.getTime() - MILLISECONDS_TO_SAVE) {
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
  let farm = await getFarmById(account, farmId);
  if (!farm) {
    throw new Error("Farm does not exist");
  }

  // Pass numbers into a safe format before processing.
  const gameState = makeGame(farm.gameState);

  const newGameState = processActions(gameState, actions);

  await updateFarm({
    id: farmId,
    gameState: newGameState,
    owner: account,
  });

  await storeEvents({
    account,
    farmId,
    events: actions,
    state: newGameState,
  });

  return newGameState;
}
