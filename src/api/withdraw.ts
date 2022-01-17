import { APIGatewayProxyHandlerV2 } from "aws-lambda";

import { encodeParameters, sign } from "../lib/sign";

type Body = {
  to: string;
  farmId: number;
  ids: number[];
  amounts: number[];
  tokens: number;
};

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  if (!event.body) {
    throw new Error("No body found in event");
  }

  const body: Body = JSON.parse(event.body);

  // TODO - validate payload
  if (!body.to) {
    throw new Error("No to found in event");
  }

  // TODO - check if there is a game in progress (make them save first)

  // SunflowerLand.withdraw function signature
  const encodedParameters = encodeParameters(
    ["uint256", "address", "uint256[]", "uint256[]", "uint256"],
    [body.farmId, body.to, body.ids, body.amounts, body.tokens]
  );

  const signature = sign(encodedParameters);

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      signature,
    }),
  };
};
