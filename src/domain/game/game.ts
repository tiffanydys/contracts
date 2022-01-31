import Decimal from "decimal.js-light";
import { getFarmsByAccount, updateFarm } from "../../repository/farms";
import { GameEvent, processEvent } from "./events";
import { GameState } from "./types/game";

function processActions(state: GameState, actions: GameEvent[]) {
  // Validate actions
  if (!Array.isArray(actions)) {
    throw new Error("Expected actions to be an array");
  }

  return actions.reduce((farm, action) => {
    return processEvent(farm, action);
  }, state);
}

type SaveArgs = {
  farmId: number;
  account: string;
  actions: GameEvent[];
};
export async function save({ farmId, account, actions }: SaveArgs) {
  const farms = await getFarmsByAccount(account);
  const farm = farms.find((f) => f.id === farmId);
  if (!farm) {
    throw new Error("Farm does not exist!");
  }

  // Pass numbers into a safe format before processing.
  const gameState = {
    ...farm.gameState,
    balance: new Decimal(farm.gameState.balance),
  };

  const newGameState = processActions(gameState, actions);

  await updateFarm({
    id: farmId,
    gameState: newGameState,
    owner: account,
  });

  return newGameState;
}
