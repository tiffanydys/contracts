import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { Farm } from "../lib/types";

/**
 * Dummy function that returns farm from our 'DB'
 */
export function loadFarmFromDB(id: number): Farm {
  // Check if farm exists in DB - otherwise return new farm state
  // If new farm, potentially check if the id exists on Farm.sol

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

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  // Does the user have an active session in progress - return farm
  const farm = loadFarmFromDB(Number(event.pathParameters?.id));

  // No session in progress - return farm from blockchain (in case they have withdrawn)

  // How do we check if they have an unsaved session?

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      farm,
    }),
  };
};
