import {
  APIGatewayProxyHandlerV2,
  APIGatewayProxyStructuredResultV2,
} from "aws-lambda";
import Joi from "joi";

import { generateJwt } from "../services/jwt";
import { verifyAccount } from "../services/web3/signatures";

const schema = Joi.object<LoginBody>({
  sender: Joi.string().required(),
  signature: Joi.string().required(),
});

export type LoginBody = {
  sender: string;
  signature: string;
};

export const handler: APIGatewayProxyHandlerV2 = async (
  event
): Promise<APIGatewayProxyStructuredResultV2> => {
  if (!event.body) {
    throw new Error("No body found in event");
  }

  const body: LoginBody = JSON.parse(event.body);
  console.log({ body });

  const valid = schema.validate(body);
  if (valid.error) {
    throw new Error(valid.error.message);
  }

  verifyAccount({
    address: body.sender,
    signature: body.signature,
  });

  const token = generateJwt({
    address: body.sender,
  });

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token,
    }),
  };
};
