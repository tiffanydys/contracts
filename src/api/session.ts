import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import Joi from "joi";
import { startSession } from "../domain/session/session";
import { verifyAccount } from "../web3/sign";

const schema = Joi.object({
  sessionId: Joi.string().required(),
  farmId: Joi.number().required(),
  sender: Joi.string().required(),
  signature: Joi.string().required(),
  hasV1Farm: Joi.boolean().required(),
  hasV1Tokens: Joi.boolean().required(),
});

type Body = {
  sessionId: string;
  farmId: number;
  sender: string;
  signature: string;
  hasV1Farm: boolean;
  hasV1Tokens: boolean;
};

// Token.sol - 0x75e0ae699d64520136b047b4a82703aa5e8c01f00003046d64de9085c69b5ecb
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

  const farm = await startSession({
    farmId: body.farmId,
    sessionId: body.sessionId,
    sender: body.sender,
    hasV1Farm: body.hasV1Farm,
    hasV1Tokens: body.hasV1Tokens,
  });

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      farm,
    }),
  };
};
