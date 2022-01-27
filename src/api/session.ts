import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { startSession } from "../domain/session/session";

type Body = {
  sessionId: string;
  farmId: number;
  sender: string;
  signature: string;
  hash: string;
};

// Token.sol - 0x75e0ae699d64520136b047b4a82703aa5e8c01f00003046d64de9085c69b5ecb
export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  console.log({ event });
  // Verify signed transaction - requester owns the farm
  if (!event.body) {
    throw new Error("No body found in event");
  }

  const body: Body = JSON.parse(event.body);

  // Verify the user is sending this transaction
  // const address = verify(body.hash, body.signature);

  // console.log({ address });
  // if (address !== body.sender) {
  //   throw new Error("Signature is invalid");
  // }

  console.log("init farmContract");

  const farm = await startSession({
    farmId: body.farmId,
    sessionId: body.sessionId,
    sender: body.sender,
  });

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      farm,
    }),
  };
};
