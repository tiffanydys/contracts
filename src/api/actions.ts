import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { processActions } from "../domain/game/reducer";
import { GameEvent } from "../domain/game/events";
import { getSessionByFarmId, updateSession } from "../repository/sessions";
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

  const session = await getSessionByFarmId(body.farmId);
  console.log({ session });
  if (!session) {
    throw new Error("Farm does not exist!");
  }

  // TODO - check session ID is the same

  // Pass numbers into a safe format before processing.
  const farm = {
    ...session.farm,
    balance: new Decimal(session.farm.balance),
  };

  const gameState = processActions(farm, body.actions);

  await updateSession({
    id: body.farmId,
    farm: gameState,
    sessionId: body.sessionId,
    updatedBy: body.sender,
  });

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      farm: gameState,
    }),
  };
};
