import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import Joi from "joi";

import { processActions } from "../domain/game/reducer";
import { GameEvent } from "../domain/game/events";
import {
  getFarmsByAccount,
  updateFarm,
  updateSession,
} from "../repository/farms";
import Decimal from "decimal.js-light";
import { verifyAccount } from "../web3/sign";
import { save } from "../domain/game/game";

const schema = Joi.object({
  // TODO type these?
  actions: Joi.array(),
  farmId: Joi.number(),
  sender: Joi.string(),
  sessionId: Joi.string(),
  signature: Joi.string(),
});

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
  if (!event.body) {
    throw new Error("No body found in event");
  }

  const body: Body = JSON.parse(event.body);
  const valid = schema.validate(body);
  if (valid.error) {
    throw new Error(valid.error.message);
  }

  verifyAccount({
    address: body.sender,
    farmId: body.farmId,
    signature: body.signature,
  });

  const game = await save({
    farmId: body.farmId,
    account: body.sender,
    actions: body.actions,
  });

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      farm: game,
    }),
  };
};
