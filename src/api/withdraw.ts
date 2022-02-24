import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import Joi from "joi";

import { withdrawSignature } from "../services/web3/signatures";
import { verifyJwt } from "../services/jwt";

import { canSync } from "../constants/whitelist";

import { KNOWN_IDS } from "../domain/game/types";
import { TOOLS, LimitedItems } from "../domain/game/types/craftables";
import { InventoryItemName } from "../domain/game/types/game";
import { getTax } from "../domain/game/withdraw";
import { RESOURCES } from "../domain/game/types/resources";
import { logInfo } from "../services/logger";

/**
 * Items like pumpkin soup are non-transferrable
 */
const VALID_ITEMS = Object.keys({
  ...TOOLS,
  ...LimitedItems,
  ...RESOURCES,
}) as InventoryItemName[];

const VALID_IDS = VALID_ITEMS.map((id) => KNOWN_IDS[id]);

const schema = Joi.object<WithdrawBody>({
  sessionId: Joi.string().required(),
  farmId: Joi.number().required(),
  sfl: Joi.string().required(),
  ids: Joi.array()
    .items(Joi.number().valid(...VALID_IDS))
    .required()
    .min(0),
  amounts: Joi.array().items(Joi.string()).required().min(0),
});

export type WithdrawBody = {
  farmId: number;
  sessionId: string;
  sfl: string;
  ids: number[];
  amounts: string[];
};

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  if (!event.body) {
    throw new Error("No body found in event");
  }

  const { address } = await verifyJwt(event.headers.authorization as string);
  const body: WithdrawBody = JSON.parse(event.body);
  logInfo("Withdraw", JSON.stringify(body, null, 2));

  const valid = schema.validate(body);
  if (valid.error) {
    throw new Error(valid.error.message);
  }

  // TODO - new can withdraw
  if (process.env.NETWORK !== "mumbai") {
    if (!canSync(address)) {
      throw new Error("Not on whitelist");
    }
  }

  // Smart contract does balance validation so don't worry about it here
  const signature = await withdrawSignature({
    sender: address,
    farmId: body.farmId,
    sessionId: body.sessionId,
    sfl: body.sfl,
    ids: body.ids,
    amounts: body.amounts,
    tax: getTax(body.sfl),
  });

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...signature,
    }),
  };
};
