import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import Joi from "joi";

import { createFarmSignature } from "../web3/signatures";

const schema = Joi.object({
  charity: Joi.string().required(),
  donation: Joi.number().required(),
  address: Joi.string().required(),
});

type Body = {
  charity: string;
  donation: number;
  address: string;
};

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  if (!event.body) {
    throw new Error("No body found in event");
  }

  const body: Body = JSON.parse(event.body);
  const valid = schema.validate(body);
  if (valid.error) {
    throw new Error(valid.error.message);
  }

  // No signature validation as not needed

  // Whitelist farms

  const { signature } = await createFarmSignature({
    address: body.address,
    donation: body.donation,
    charity: body.charity,
  });

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      signature,
      charity: body.charity,
      donation: body.donation,
    }),
  };
};
