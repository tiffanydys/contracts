import Decimal from "decimal.js-light";
import { fromWei } from "web3-utils";
import {
  createSession,
  getSessionByFarmId,
  updateSession,
  Session,
} from "../../repository/sessions";
import { fetchOnChainData } from "../../web3/contracts";
import { INITIAL_FARM } from "../game/lib/constants";
import { GameState } from "../game/types/game";

type StartSessionArgs = {
  farmId: number;
  sessionId: string;
  sender: string;
};

export async function startSession({
  farmId,
  sender,
  sessionId,
}: StartSessionArgs): Promise<GameState> {
  let session = await getSessionByFarmId(farmId);

  // No session was ever created for this farm
  if (!session) {
    // TODO - in future check if farm actually exists on Blockchain

    session = await createSession({
      id: farmId,
      createdBy: sender,
      farm: INITIAL_FARM,
      // Will be 0 but still let UI pass it in
      sessionId: sessionId,
    });

    const farm = makeFarm(session);

    return farm;
  }

  let farmState = makeFarm(session);

  // Does the session ID match?
  const sessionMatches = session.sessionId === sessionId;

  if (sessionMatches) {
    return farmState;
  }

  // We are out of sync with the Blockchain
  const onChainData = await fetchOnChainData({
    sender: sender,
    farmId: farmId,
  });

  const farm: GameState = {
    // Keep the planted fields
    ...session.farm,
    // Load the token + NFT balances
    balance: new Decimal(fromWei(onChainData.balance.toString(), "ether")),
    // TODO - inventory: onChainData.inventory,
  };

  await updateSession({
    id: farmId,
    farm,
    sessionId: sessionId,
    updatedBy: sender,
  });

  return farm;
}

function makeFarm({ farm }: Session): GameState {
  return {
    ...farm,
    balance: new Decimal(farm.balance),
    // TODO - inventory: farm.inventory,
  };
}
