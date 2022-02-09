import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import Joi from "joi";
import { startSession } from "../domain/game/game";
import { verifyAccount } from "../services/web3/signatures";

const schema = Joi.object<SessionBody>({
  sessionId: Joi.string().required(),
  farmId: Joi.number().required(),
  sender: Joi.string().required(),
  signature: Joi.string().required(),
});

export type SessionBody = {
  sessionId: string;
  farmId: number;
  sender: string;
  signature: string;
};

// Token.sol - 0x75e0ae699d64520136b047b4a82703aa5e8c01f00003046d64de9085c69b5ecb
export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  if (!event.body) {
    throw new Error("No body found in event");
  }

  const body: SessionBody = JSON.parse(event.body);
  const valid = schema.validate(body);
  if (valid.error) {
    throw new Error(valid.error.message);
  }

  verifyAccount({
    address: body.sender,
    signature: body.signature,
  });

  const farm = await startSession({
    farmId: body.farmId,
    sessionId: body.sessionId,
    sender: body.sender,
  });

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      farm,
    }),
  };
};
