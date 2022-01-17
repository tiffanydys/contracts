import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { verify } from "../lib/sign";
import { Farm } from "../lib/types";

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
    level: 1,
  };
}

/**
 * Load data from Polygon
 * Use alchemy for HTTP requests (we don't have to maintain our own node/Web3 connection)
 */
function loadFarmFromBlockchain(farmId: number) {
  // Load the farm address from Farm.sol
  // Load the token balance from Token.sol using the farm address
  // Load the inventory balance from Inventory.sol using the farm address
}

type Body = {
  sessionId: string;
  farmAddress: string;
  sender: string;
  signature: string;
};

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  // Verify signed transaction - requester owns the farm
  if (!event.body) {
    throw new Error("No body found in event");
  }

  const body: Body = JSON.parse(event.body);

  // Verify the user is sending this transaction
  const address = verify(body.sessionId, body.signature);

  if (address !== body.sender) {
    throw new Error("Signature is invalid");
  }

  // Does the user have an active session in progress - return farm
  const farm = loadSession(body.sender, body.sessionId);

  // No session in progress - return farm from blockchain
  if (!farm) {
    // Farm.sol -> verify the account owns the farmAddress
    // Token.sol -> balanceOf(farmAddress) : load token balance
    // Inventory.sol -> balanceOf(farmAddress) : load inventory balance
    // Save a session
    // Return this farm
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      farm,
    }),
  };
};
