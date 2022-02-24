import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import Joi from "joi";
import { startSession } from "../domain/game/session";
import { logInfo } from "../services/logger";
import { verifyJwt } from "../services/jwt";

const schema = Joi.object<SessionBody>({
  sessionId: Joi.string().required(),
  farmId: Joi.number().required(),
});

export type SessionBody = {
  sessionId: string;
  farmId: number;
};

// Token.sol - 0x75e0ae699d64520136b047b4a82703aa5e8c01f00003046d64de9085c69b5ecb
export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  if (!event.body) {
    throw new Error("No body found in event");
  }

  console.log({ event });
  const { address } = await verifyJwt(event.headers.authorization as string);

  const body: SessionBody = JSON.parse(event.body);
  logInfo("Session Start", JSON.stringify(body, null, 2));

  const valid = schema.validate(body);
  if (valid.error) {
    throw new Error(valid.error.message);
  }

  const farm = await startSession({
    farmId: body.farmId,
    sessionId: body.sessionId,
    sender: address,
  });

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      farm,
      startedAt: new Date().toISOString(),
    }),
  };
};
