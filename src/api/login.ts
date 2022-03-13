import {
  APIGatewayProxyHandlerV2,
  APIGatewayProxyStructuredResultV2,
} from "aws-lambda";
import Joi from "joi";
import { getUserAccess } from "../domain/auth/userAccess";

import { generateJwt } from "../services/jwt";
import { verifyAccount } from "../services/web3/signatures";

const schema = Joi.object<LoginBody>({
  address: Joi.string().required(),
  signature: Joi.string().required(),
  discord_access_code: Joi.string(),
});

export type LoginBody = {
  address: string;
  signature: string;
  discord_access_code: string;
};

export const handler: APIGatewayProxyHandlerV2 = async (
  event
): Promise<APIGatewayProxyStructuredResultV2> => {
  if (!event.body) {
    throw new Error("No body found in event");
  }

  const body: LoginBody = JSON.parse(event.body);

  const valid = schema.validate(body);
  if (valid.error) {
    throw new Error(valid.error.message);
  }

  verifyAccount({
    address: body.address,
    signature: body.signature,
  });

  const userAccess = await getUserAccess(body.address);

  const { token } = await generateJwt({
    address: body.address,
    userAccess,
  });

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token,
    }),
  };
};
