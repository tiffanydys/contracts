import {
  APIGatewayProxyHandlerV2,
  APIGatewayProxyStructuredResultV2,
} from "aws-lambda";
import Joi from "joi";

import { mint } from "../domain/game/sync";
import { LimitedItem } from "../domain/game/types/craftables";
import { logInfo } from "../services/logger";
import { verifyJwt } from "../services/jwt";
import { syncSignature } from "../services/web3/signatures";

const VALID_ITEMS: LimitedItem[] = [
  "Chicken Coop",
  "Gold Egg",
  "Golden Cauliflower",
  "Potato Statue",
  "Scarecrow",
  "Sunflower Rock",
  "Sunflower Statue",
  "Fountain",
  "Goblin Crown",
];

const schema = Joi.object<MintBody>({
  sessionId: Joi.string().required(),
  farmId: Joi.number().required(),
  item: Joi.string()
    .required()
    .valid(...VALID_ITEMS),
});

export type MintBody = {
  farmId: number;
  sessionId: string;
  item: LimitedItem;
};

export const handler: APIGatewayProxyHandlerV2 = async (
  event
): Promise<APIGatewayProxyStructuredResultV2> => {
  if (!event.body) {
    throw new Error("No body found in event");
  }

  const { address, userAccess } = await verifyJwt(
    event.headers.authorization as string
  );

  const body: MintBody = JSON.parse(event.body);
  logInfo("Mint API: ", { body });

  const valid = schema.validate(body);
  if (valid.error) {
    throw new Error(valid.error.message);
  }

  if (userAccess.mintCollectible) {
    throw new Error("Not on whitelist");
  }

  const changeset = await mint({
    farmId: Number(body.farmId),
    account: address,
    item: body.item,
  });

  // TODO - move into mint function
  // Once an NFT is minted they need to immediately sync to the Blockchain
  const signature = await syncSignature({
    sender: address,
    farmId: body.farmId,
    sessionId: body.sessionId,
    sfl: changeset.balance,
    inventory: changeset.inventory,
  });

  logInfo(
    `Minted ${body.item} for ${address} at ${body.farmId}`,
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
