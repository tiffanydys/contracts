import {
  APIGatewayProxyHandlerV2,
  APIGatewayProxyStructuredResultV2,
} from "aws-lambda";
import Joi from "joi";

import { mint } from "../domain/game/game";
import { LimitedItem } from "../domain/game/types/craftables";
import { syncSignature, verifyAccount } from "../web3/signatures";

const VALID_ITEMS: LimitedItem[] = [
  "Chicken Coop",
  "Gold Egg",
  "Golden Cauliflower",
  "Potato Statue",
  "Scarecrow",
  "Sunflower Rock",
  "Sunflower Statue",
];

const schema = Joi.object({
  sessionId: Joi.string().required(),
  farmId: Joi.number().required(),
  sender: Joi.string().required(),
  signature: Joi.string().required(),
  item: Joi.string()
    .required()
    .valid(...VALID_ITEMS),
});

export type MintBody = {
  farmId: number;
  sessionId: string;
  sender: string;
  signature: string;
  item: LimitedItem;
};

export const handler: APIGatewayProxyHandlerV2 = async (
  event
): Promise<APIGatewayProxyStructuredResultV2> => {
  if (!event.body) {
    throw new Error("No body found in event");
  }

  const body: MintBody = JSON.parse(event.body);
  const valid = schema.validate(body);
  if (valid.error) {
    throw new Error(valid.error.message);
  }

  verifyAccount({
    address: body.sender,
    farmId: body.farmId,
    signature: body.signature,
  });
  console.log({ verified: true });

  const db = new AWS.DynamoDB.DocumentClient();

  const changeset = await mint({
    farmId: Number(body.farmId),
    account: body.sender,
    item: body.item,
    db,
  });

  // TODO - check the total supply limit
  console.log({ changeset });

  // Once an NFT is minted they need to immediately sync to the Blockchain
  const signature = await syncSignature({
    sender: body.sender,
    farmId: body.farmId,
    sessionId: body.sessionId,
    sfl: changeset.balance,
    inventory: changeset.inventory,
  });

  console.log({ signature });

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...signature,
    }),
  };
};
