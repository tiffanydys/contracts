import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import Joi from "joi";
import { getChangeset } from "../domain/game/game";
import { KNOWN_IDS } from "../domain/game/types";
import { syncSignature, verifyAccount } from "../web3/signatures";

const schema = Joi.object({
  sessionId: Joi.string().required(),
  farmId: Joi.number().required(),
  sender: Joi.string().required(),
  signature: Joi.string().required(),
});

export type SyncBody = {
  farmId: number;
  sessionId: string;
  sender: string;
  signature: string;
};

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  if (!event.body) {
    throw new Error("No body found in event");
  }

  const body: SyncBody = JSON.parse(event.body);
  const valid = schema.validate(body);
  if (valid.error) {
    throw new Error(valid.error.message);
  }

  verifyAccount({
    address: body.sender,
    farmId: body.farmId,
    signature: body.signature,
  });

  const changeset = await getChangeset({
    id: Number(body.farmId),
    owner: body.sender,
  });

  const signature = await syncSignature({
    sender: body.sender,
    farmId: body.farmId,
    sessionId: body.sessionId,
    sfl: changeset.balance,
    inventory: changeset.inventory,
  });

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...signature,
    }),
  };
};
