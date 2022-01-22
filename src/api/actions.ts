import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { loadFarm } from "./session";
import { processActions } from "../lib/reducer";
import { verify } from "../lib/sign";
import { GameEvent } from "../lib/events";

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

  // Verify the user signature can actually make actions
  // const address = verify(body.sessionId, body.signature);

  // if (address !== body.sender) {
  //   throw new Error("Signature is invalid");
  // }

  // TODO - has the session ID changed?

  const farm = loadFarm(body.sender, body.farmId);

  if (!farm) {
    throw new Error("No session exists for this farm");
  }

  const updated = processActions(farm, body.actions);

  // Update session in DB (insert if does not exist yet)

  // Optional - store actions in DB (for auditing)

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      farm: updated,
    }),
  };
};
