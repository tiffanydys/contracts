import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import Joi from "joi";

import { CHARITIES } from "../constants/charities";
import { canCreateFarm } from "../constants/whitelist";
import { logInfo } from "../services/logger";

import { verifyJwt } from "../services/jwt";
import { createFarmSignature } from "../services/web3/signatures";

const schema = Joi.object<CreateFarmBody>({
  charity: Joi.string()
    .required()
    .valid(...CHARITIES),
  donation: Joi.number().required().min(1),
});

export type CreateFarmBody = {
  charity: string;
  donation: number;
};

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  if (!event.body) {
    throw new Error("No body found in event");
  }

  const { address } = await verifyJwt(event.headers.authorization as string);

  const body: CreateFarmBody = JSON.parse(event.body);
  logInfo("Create Farm", JSON.stringify(body, null, 2));

  const valid = schema.validate(body);
  if (valid.error) {
    throw new Error(valid.error.message);
  }

  if (!canCreateFarm(address)) {
    throw new Error("Not on whitelist");
  }

  // No signature validation as not needed

  // Whitelist farms

  const { signature, charity, donation } = await createFarmSignature({
    address,
    donation: body.donation,
    charity: body.charity,
  });

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      signature,
      charity,
      donation,
    }),
  };
};
