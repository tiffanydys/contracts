import { APIGatewayProxyHandlerV2 } from "aws-lambda";

import { verify } from "../lib/sign";
import { Farm } from "../lib/types";
import { fetchOnChainData } from "../web3/contracts";

/**
 * Dummy function that returns farm from our 'DB'
 */
export function loadSession(sender: string, sessionId: string): Farm {
  // Check if farm exists in DB

  // Found farm, return it
  return {
    balance: 10,
    // 5 empty fields
    fields: [
      {
        fieldIndex: 0,
      },
      {
        fieldIndex: 1,
      },
      {
        fieldIndex: 2,
      },
      {
        fieldIndex: 3,
      },
      {
        fieldIndex: 4,
      },
    ],
    inventory: {
      wood: 5,
    },
  };
}

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
  const address = verify(body.hash, body.signature);

  console.log({ address });
  if (address !== body.sender) {
    throw new Error("Signature is invalid");
  }

  console.log("init farmContract");

  // TODO - check if session exists in DB - if so return that

  // Load farm from blockchain
  const session = await fetchOnChainData({
    sender: body.sender,
    farmId: body.farmId,
  });

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      farm: session,
    }),
  };
};
