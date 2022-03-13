import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import Joi from "joi";

import { verifyJwt } from "../services/jwt";

import { KNOWN_IDS } from "../domain/game/types";
import { TOOLS, LimitedItems } from "../domain/game/types/craftables";
import { InventoryItemName } from "../domain/game/types/game";
import { withdraw } from "../domain/game/withdraw";
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
  // TODO - remove this
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

  const { address, userAccess } = await verifyJwt(
    event.headers.authorization as string
  );
  const body: WithdrawBody = JSON.parse(event.body);
  logInfo("Withdraw", JSON.stringify(body, null, 2));

  const valid = schema.validate(body);
  if (valid.error) {
    throw new Error(valid.error.message);
  }

  if (!userAccess.withdraw) {
    throw new Error(`${address} does not have permissions to withdraw`);
  }

  // TODO - validate they are the right session and have enough to withdraw

  // Smart contract does balance validation so don't worry about it here
  const signature = await withdraw({
    sender: address,
    farmId: body.farmId,
    sfl: body.sfl,
    ids: body.ids,
    amounts: body.amounts,
  });

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...signature,
    }),
  };
};
