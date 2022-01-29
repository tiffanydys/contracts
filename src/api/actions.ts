import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { processActions } from "../domain/game/reducer";
import { GameEvent } from "../domain/game/events";
import {
  getFarmsByAccount,
  updateFarm,
  updateSession,
} from "../repository/sessions";
import Decimal from "decimal.js-light";

type Body = {
  actions: GameEvent[];
  farmId: number;
  sender: string;
  sessionId: string;
  signature: string;
};

/**
 * Handler which processes actions and returns the new state of the farm
 */
export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  // Verify signed transaction - requester owns the farm
  if (!event.body) {
    throw new Error("No body found in event");
  }

  const body: Body = JSON.parse(event.body);

  if (!body.actions) {
    throw new Error("No actions found in event");
  }

  if (!body.farmId) {
    throw new Error("No farmId found in event");
  }

  if (!body.sender) {
    throw new Error("Missing sender");
  }

  // Verify the user signature can actually make actions
  // const address = verify(body.sessionId, body.signature);

  // if (address !== body.sender) {
  //   throw new Error("Signature is invalid");
  // }

  // Verify they are the owner of the farm - How do we do this without a web3 call?

  // Anyone could just sign a farmID and pass it up to the server

  const farms = await getFarmsByAccount(body.sender);
  const farm = farms.find((f) => f.id === body.farmId);
  console.log({ farm });
  if (!farm) {
    throw new Error("Farm does not exist!");
  }

  // TODO - check session ID is the same

  // Pass numbers into a safe format before processing.
  const gameState = {
    ...farm.gameState,
    balance: new Decimal(farm.gameState.balance),
  };

  const newGameState = processActions(gameState, body.actions);

  await updateFarm({
    id: body.farmId,
    gameState: newGameState,
    owner: body.sender,
  });

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      farm: gameState,
    }),
  };
};
