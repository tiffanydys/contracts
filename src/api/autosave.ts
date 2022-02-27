import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import Joi from "joi";

import {
  FUTURE_SAVE_BUFFER_MS,
  GameAction,
  MILLISECONDS_TO_SAVE,
  save,
} from "../domain/game/save";
import { logInfo } from "../services/logger";
import { verifyJwt } from "../services/jwt";

const eventTimeValidation = () => {
  return Joi.date()
    .iso()
    .greater(Date.now() - MILLISECONDS_TO_SAVE)
    .less(Date.now() + FUTURE_SAVE_BUFFER_MS);
};

// Thunk it so we can get the current time on runtime
const schema = () =>
  Joi.object<AutosaveBody>({
    actions: Joi.array()
      .items(
        Joi.alternatives().try(
          Joi.object({
            type: Joi.string().equal("item.crafted"),
            item: Joi.string(),
            amount: Joi.number().min(1).max(1000).integer(),
            createdAt: eventTimeValidation(),
          }),
          Joi.object({
            type: Joi.string().equal("item.sell"),
            item: Joi.string(),
            amount: Joi.number().min(1).max(1000).integer(),
            createdAt: eventTimeValidation(),
          }),
          Joi.object({
            type: Joi.string().equal("item.planted"),
            item: Joi.string(),
            index: Joi.number().min(0).max(21).integer(),
            createdAt: eventTimeValidation(),
          }),
          Joi.object({
            type: Joi.string().equal("item.harvested"),
            index: Joi.number().min(0).max(21).integer(),
            createdAt: eventTimeValidation(),
          }),
          Joi.object({
            type: Joi.string().equal("tree.chopped"),
            item: Joi.string(),
            index: Joi.number().min(0).max(5).integer(),
            createdAt: eventTimeValidation(),
          })
        )
      )
      .required()
      .min(1),
    farmId: Joi.number().required(),
    sessionId: Joi.string().required(),
    captcha: Joi.string(),
  });

export type AutosaveBody = {
  actions: GameAction[];
  farmId: number;
  // Not actually used, but throw people off the scent of how our sessions work
  sessionId: string;
  captcha?: string;
};

/**
 * Handler which processes actions and returns the new state of the farm
 */
export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  if (!event.body) {
    throw new Error("No body found in event");
  }

  const { address } = await verifyJwt(event.headers.authorization as string);

  const body: AutosaveBody = JSON.parse(event.body);
  logInfo("Autosave", JSON.stringify(body, null, 2));

  const valid = schema().validate(body);
  if (valid.error) {
    throw new Error(valid.error.message);
  }

  const { verified, state } = await save({
    farmId: body.farmId,
    account: address,
    actions: body.actions,
    captcha: body.captcha,
  });

  if (!verified) {
    return {
      statusCode: 429,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        captcha: false,
      }),
    };
  }

  logInfo(
    `Saved ${address} for ${body.farmId}`,
    JSON.stringify(state, null, 2)
  );

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      farm: state,
    }),
  };
};
