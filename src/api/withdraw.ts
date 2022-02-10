import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import Joi from "joi";
import { getChangeset } from "../domain/game/game";
import {
  syncSignature,
  verifyAccount,
  withdrawSignature,
} from "../services/web3/signatures";
import { canSync } from "../constants/whitelist";
import { IDS, ITEM_NAMES, KNOWN_IDS } from "../domain/game/types";

const schema = Joi.object<WithdrawBody>({
  sessionId: Joi.string().required(),
  farmId: Joi.number().required(),
  sender: Joi.string().required(),
  signature: Joi.string().required(),
  sfl: Joi.string().required(),
  ids: Joi.array().items().min(0),
  amounts: Joi.array().items(Joi.string()),
});

export type WithdrawBody = {
  farmId: number;
  sessionId: string;
  sender: string;
  signature: string;
  sfl: number;
  ids: number[];
  amounts: string[];
};

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  if (!event.body) {
    throw new Error("No body found in event");
  }

  const body: WithdrawBody = JSON.parse(event.body);
  const valid = schema.validate(body);
  if (valid.error) {
    throw new Error(valid.error.message);
  }

  verifyAccount({
    address: body.sender,
    signature: body.signature,
  });

  // TODO - new can withdraw
  if (process.env.NETWORK !== "mumbai") {
    if (!canSync(body.sender)) {
      throw new Error("Not on whitelist");
    }
  }

  // Smart contract does balance validation so don't worry about it here
  const signature = await withdrawSignature({
    sender: body.sender,
    farmId: body.farmId,
    sessionId: body.sessionId,
    sfl: body.sfl,
    ids: body.ids,
    amounts: body.amounts,
    // TODO
    tax: 50,
  });

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...signature,
    }),
  };
};
