import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { soliditySha3 } from "web3-utils";
import { diffCheck } from "../lib/diffCheck";
import { encodeParameters, sign } from "../lib/sign";
import { loadFarm } from "./session";

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

  // TODO - verify session exists

  // TODO - Load the farm at the start of the session - from DB or Blockchain?
  const oldFarm = loadFarm(body.sender, body.sessionId);

  const newFarm = loadFarm(body.sender, body.sessionId);

  const changeset = diffCheck({ old: oldFarm, newFarm, id: body.farmId });

  changeset.mintIds = [1];
  changeset.mintAmounts = [50];
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
      mintIds: changeset.mintIds,
      mintAmounts: changeset.mintAmounts,
      burnIds: changeset.burnIds,
      burnAmounts: changeset.burnAmounts,
      mintTokens: 500,
      burnTokens: changeset.burnTokens,
    }),
  };
};
