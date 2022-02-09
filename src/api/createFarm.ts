import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import Joi from "joi";

import { CHARITIES } from "../constants/charities";
import { canCreateFarm } from "../constants/whitelist";

import {
  createFarmSignature,
  verifyAccount,
} from "../services/web3/signatures";

const schema = Joi.object<CreateFarmBody>({
  charity: Joi.string()
    .required()
    .valid(...CHARITIES),
  donation: Joi.number().required().min(1),
  address: Joi.string().required(),
  signature: Joi.string().required(),
});

export type CreateFarmBody = {
  charity: string;
  donation: number;
  address: string;
  signature: string;
};

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  if (!event.body) {
    throw new Error("No body found in event");
  }

  const body: CreateFarmBody = JSON.parse(event.body);
  const valid = schema.validate(body);
  if (valid.error) {
    throw new Error(valid.error.message);
  }

  verifyAccount({
    address: body.address,
    signature: body.signature,
  });

  if (process.env.NETWORK !== "mumbai") {
    if (!canCreateFarm(body.address)) {
      throw new Error("Not on whitelist");
    }
  }

  // No signature validation as not needed

  // Whitelist farms

  const { signature, charity, donation } = await createFarmSignature({
    address: body.address,
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
