import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import Joi from "joi";
import { getChangeset } from "../domain/game/sync";
import { syncSignature, verifyAccount } from "../services/web3/signatures";
import { canSync } from "../constants/whitelist";

const schema = Joi.object<SyncBody>({
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
  console.log({ body });

  const valid = schema.validate(body);
  if (valid.error) {
    throw new Error(valid.error.message);
  }

  verifyAccount({
    address: body.sender,
    signature: body.signature,
  });

  if (process.env.NETWORK !== "mumbai") {
    if (!canSync(body.sender)) {
      throw new Error("Not on whitelist");
    }
  }

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

  console.info(
    `Synced ${body.sender} for ${body.farmId}`,
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
