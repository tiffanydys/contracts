import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import Joi from "joi";

import { logInfo } from "../services/logger";

import { generateJwt, verifyJwt } from "../services/jwt";
import { getDiscordAccess } from "../domain/auth/userAccess";

const schema = Joi.object<OAuthBody>({
  code: Joi.string().required(),
});

export type OAuthBody = {
  code: string;
};

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  if (!event.body) {
    throw new Error("No body found in event");
  }

  const { address, userAccess } = await verifyJwt(
    event.headers.authorization as string
  );

  const body: OAuthBody = JSON.parse(event.body);
  logInfo("OAuth", JSON.stringify(body, null, 2));

  const valid = schema.validate(body);
  if (valid.error) {
    throw new Error(valid.error.message);
  }

  const response = await getDiscordAccess({
    code: body.code,
    address,
  });

  if (response instanceof Error) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        errorCode: "DISCORD_USER_EXISTS",
        errorMessage: "Discord user already exists",
      }),
    };
  }

  const { createFarm, id } = response;

  // Generate new token with Discord permissions
  const { token } = await generateJwt({
    address,
    userAccess: {
      ...userAccess,
      createFarm,
    },
    discordId: id,
  });

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token,
    }),
  };
};
