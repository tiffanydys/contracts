import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import Decimal from "decimal.js-light";
import { fromWei } from "web3-utils";
import { createFarm, DBFarm, getFarm, saveFarm } from "../db/farms";
import { INITIAL_FARM } from "../gameEngine/lib/constants";

import { verify } from "../gameEngine/sign";
import { GameState } from "../gameEngine/types/game";
import { fetchOnChainData } from "../web3/contracts";

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

  let session = await getFarm(body.farmId);

  if (!session) {
    // TODO - in future check if farm actually exists on Blockchain

    session = await createFarm({
      id: body.farmId,
      createdBy: body.sender,
      farm: INITIAL_FARM,
      // Will be 0 but still let UI pass it in
      sessionId: body.sessionId,
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        farm: session.farm,
      }),
    };
  }

  let farmState: DBFarm = session.farm;
  // Does the session ID match?
  const sessionMatches = session.sessionId === body.sessionId;

  console.log({ sessionMatches });
  if (!sessionMatches) {
    // No - Load farm from blockchain
    const onChainData = await fetchOnChainData({
      sender: body.sender,
      farmId: body.farmId,
    });

    await saveFarm({
      id: body.farmId,
      farm: onChainData,
      sessionId: body.sessionId,
      updatedBy: body.sender,
    });

    farmState = {
      // Keep the planted fields
      ...session.farm,
      // Load the token + NFT balances
      balance: fromWei(onChainData.balance.toString(), "ether"),
      // TODO - inventory: onChainData.inventory,
    };
  }

  const safeFarm = {
    ...farmState,
    balance: farmState.balance.toString(),
  };

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      farm: safeFarm,
    }),
  };
};
