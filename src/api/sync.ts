import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import Joi from "joi";
import { sync } from "../domain/game/sync";
import { verifyJwt } from "../services/jwt";
import { logInfo } from "../services/logger";

const schema = Joi.object<SyncBody>({
  sessionId: Joi.string().required(),
  farmId: Joi.number().required(),
});

export type SyncBody = {
  farmId: number;
  sessionId: string;
};

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  if (!event.body) {
    throw new Error("No body found in event");
  }

  const { address, userAccess } = await verifyJwt(
    event.headers.authorization as string
  );

  const body: SyncBody = JSON.parse(event.body);
  logInfo("Sync API: ", { body });

  const valid = schema.validate(body);
  if (valid.error) {
    throw new Error(valid.error.message);
  }

  if (!userAccess.sync) {
    throw new Error(`${address} does not have permissions to sync`);
  }

  const signature = await sync({
    id: Number(body.farmId),
    owner: address,
  });

  logInfo(
    `Synced ${address} for ${body.farmId}`,
    JSON.stringify(signature, null, 2)
  );

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...signature,
    }),
  };
};
