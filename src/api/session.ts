import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { INITIAL_FARM } from "../lib/constants";

import { verify } from "../lib/sign";
import { Farm, FieldItem } from "../types/game";
import { fetchOnChainData } from "../web3/contracts";

/**
 *
 * Dummy function that returns farm from our 'DB'
 */
export function loadFarm(sender: string, farmId: number): Farm {
  // Check if farm exists in DB

  // Found farm, return it
  return INITIAL_FARM;
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

  let farm = loadFarm(body.sender, body.farmId);

  // Does the session ID match?
  const sessionMatches = false;

  if (!sessionMatches) {
    // No - Load farm from blockchain
    const onChainData = await fetchOnChainData({
      sender: body.sender,
      farmId: body.farmId,
    });

    farm = {
      // Keep the planted fields
      ...farm,
      // Load the token + NFT balances
      balance: onChainData.balance,
      // TODO - inventory: onChainData.inventory,
    };
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      farm,
    }),
  };
};
