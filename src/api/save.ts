import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { soliditySha3, toWei } from "web3-utils";
import { sign } from "../gameEngine/sign";

type Body = {
  farmId: number;
  sessionId: string;
  sender: string;
};

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  if (!event.body) {
    throw new Error("No body found in event");
  }

  const body: Body = JSON.parse(event.body);

  if (!body.farmId) {
    throw new Error("No farmId found in event");
  }

  console.log({ body });
  // Just a test to see it actually increase
  const mintTokens = toWei("1");

  const shad = soliditySha3(
    {
      type: "bytes32",
      value: body.sessionId,
    },
    {
      type: "uint256",
      value: body.farmId.toString(),
    },
    {
      type: "uint256[]",
      value: [1] as any,
    },
    {
      type: "uint256[]",
      value: [50] as any,
    },
    {
      type: "uint256[]",
      value: [] as any,
    },
    {
      type: "uint256[]",
      value: [] as any,
    },
    {
      type: "uint256",
      value: mintTokens as any,
    },
    {
      type: "uint256",
      value: 0 as any,
    }
  );

  const { signature } = sign(shad as string);

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      signature,
      farmId: body.farmId,
      sessionId: body.sessionId,
      mintIds: [1],
      mintAmounts: [50],
      burnIds: [],
      burnAmounts: [],
      mintTokens: mintTokens,
      burnTokens: 0,
    }),
  };
};
