import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import Joi from "joi";
import { getChangeset } from "../domain/game/sync";
import { syncSignature } from "../services/web3/signatures";
import { verifyJwt } from "../services/jwt";
import { canSync } from "../constants/whitelist";
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

  console.log({ event });
  const { address } = await verifyJwt(event.headers.authorization as string);

  const body: SyncBody = JSON.parse(event.body);
  logInfo("Sync API: ", { body });

  const valid = schema.validate(body);
  if (valid.error) {
    throw new Error(valid.error.message);
  }

  if (process.env.NETWORK !== "mumbai") {
    if (!canSync(address)) {
      throw new Error("Not on whitelist");
    }
  }

  const changeset = await getChangeset({
    id: Number(body.farmId),
    owner: address,
  });

  const signature = await syncSignature({
    sender: address,
    farmId: body.farmId,
    sessionId: body.sessionId,
    sfl: changeset.balance,
    inventory: changeset.inventory,
  });

<<<<<<< HEAD
  logInfo(
    `Synced ${body.sender} for ${body.farmId}`,
=======
  console.info(
    `Synced ${address} for ${body.farmId}`,
>>>>>>> 743663b (Add JWT support)
    JSON.stringify(changeset, null, 2)
  );

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...signature,
    }),
  };
};
