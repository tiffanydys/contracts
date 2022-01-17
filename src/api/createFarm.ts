import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { encodeParameters, sign } from "../lib/sign";

type Body = {
  charity: string;
  donation: number;
};

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  if (!event.body) {
    throw new Error("No body found in event");
  }

  const body: Body = JSON.parse(event.body);

  if (!body.charity) {
    throw new Error("No charity found in event");
  }

  // TODO - validate amount

  // SunflowerLand.createFarm function signature
  const encodedParameters = encodeParameters(
    ["address", "uint256"],
    [body.charity, body.donation]
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
