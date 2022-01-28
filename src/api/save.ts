import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { soliditySha3, toWei } from "web3-utils";
import { calculateChangeset } from "../domain/session/session";
import { sign } from "../web3/sign";

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
  const changeset = await calculateChangeset(Number(body.farmId));

  console.log({ changeset });
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
      value: changeset.mintIds as any,
    },
    {
      type: "uint256[]",
      value: changeset.mintAmounts as any,
    },
    {
      type: "uint256[]",
      value: changeset.burnIds as any,
    },
    {
      type: "uint256[]",
      value: changeset.burnAmounts as any,
    },
    {
      type: "uint256",
      value: changeset.mintTokens as any,
    },
    {
      type: "uint256",
      value: changeset.burnTokens as any,
    }
  );

  console.log({ shad });
  const { signature } = sign(shad as string);
  console.log({ signature });

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      signature,
      farmId: body.farmId,
      sessionId: body.sessionId,
      ...changeset,
    }),
  };
};
