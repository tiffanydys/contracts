import { updateFarm, getFarmById } from "../../repository/farms";
import { EVENTS, GameEvent } from "./events";
import { GameState } from "./types/game";

import { makeGame } from "./lib/transforms";
import { storeEvents, storeFlaggedEvents } from "../../repository/eventStore";
import { logInfo } from "../../services/logger";
import { verifyCaptcha } from "../../services/captcha";
import { isBlackListed } from "./lib/blacklist";

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
const HUMAN_BUFFER_MILLSECONDS = 50;

// Let them save one minute in the future as well to prevent people with clock issues
export const FUTURE_SAVE_BUFFER_MS = 60 * 1000;

// If they chop faster than 1 seconds something is up
export const TREE_CHOP_TIME = 1000;

type UpdatedGame = {
  state: GameState;
  flaggedCount: number;
};

export function processActions(
  state: GameState,
  actions: GameAction[]
): UpdatedGame {
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

  let flaggedCount = 0;

  // If they have done multiple actions, make sure it is humanly possible
  if (actions.length > 2) {
    const average = timeRange / actions.length;
    if (average < HUMAN_BUFFER_MILLSECONDS) {
      flaggedCount += 1;
    }
  }

  const newState = actions.reduce((farm, action, index) => {
    const createdAt = new Date(action.createdAt);
    if (index > 0) {
      const previousAction = actions[index - 1];
      if (new Date(previousAction.createdAt) > createdAt) {
        throw new Error("Events must be in chronological order");
      }

      const difference =
        createdAt.getTime() - new Date(previousAction.createdAt).getTime();

      if (difference < HUMAN_BUFFER_MILLSECONDS) {
        flaggedCount += 1;
      }

      if (action.type === "tree.chopped" && difference < TREE_CHOP_TIME) {
        flaggedCount += 1;
      }
    }

    const now = new Date();
    if (createdAt.getTime() > now.getTime() + FUTURE_SAVE_BUFFER_MS) {
      throw new Error("Event cannot be in the future");
    }

    if (createdAt.getTime() < now.getTime() - MILLISECONDS_TO_SAVE) {
      throw new Error("Event is too old");
    }

    return processEvent(farm, action);
  }, state);

  return {
    state: newState,
    flaggedCount,
  };
}

type SaveArgs = {
  farmId: number;
  account: string;
  actions: GameAction[];
  captcha?: string;
};

export async function save({ farmId, account, actions, captcha }: SaveArgs) {
  const farm = await getFarmById(farmId);
  if (!farm || farm.updatedBy !== account) {
    throw new Error("Farm does not exist");
  }

  const blacklisted = await isBlackListed(farm);
  if (blacklisted) {
    throw new Error(`Farm #${farmId} - ${account} is blacklisted`);
  }

  const verified = await verifyCaptcha({ farm, captcha });
  if (!verified) {
    return { verified: false };
  }

  // Pass numbers into a safe format before processing.
  const gameState = makeGame(farm.gameState);

  const { state, flaggedCount } = processActions(gameState, actions);

  if (flaggedCount > 0) {
    logInfo(
      `Account ${account} flagged (${flaggedCount}) for: `,
      JSON.stringify(actions, null, 2)
    );

    storeFlaggedEvents({
      account,
      farmId,
      events: actions,
      state,
      version: farm.version,
    });
  }

  await updateFarm({
    id: farmId,
    gameState: state,
    owner: account,
    flaggedCount: farm.flaggedCount + flaggedCount,
  });

  storeEvents({
    account,
    farmId,
    events: actions,
    version: farm.version,
  });

  return { state, verified: true };
}
