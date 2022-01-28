import Decimal from "decimal.js-light";
import { fromWei, toWei } from "web3-utils";
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
    // In case they somehow transferred resources to their farm before playing the game :/
    const onChainData = await fetchOnChainData({
      sender: sender,
      farmId: farmId,
    });

    const initialFarm: GameState = {
      // Keep the planted fields
      ...INITIAL_FARM,
      // Load the token + NFT balances
      balance: new Decimal(fromWei(onChainData.balance.toString(), "ether")),
      // TODO - inventory: onChainData.inventory,
    };

    session = await createSession({
      id: farmId,
      createdBy: sender,
      farm: initialFarm,

      // Will be 0 but still let UI pass it in
      sessionId: sessionId,
    });

    const farm = makeFarm(session.farm);

    return farm;
  }

  let farmState = makeFarm(session.farm);

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
    // Set the snapshot for the beginning of the session
    oldFarm: farm,
    sessionId: sessionId,
    updatedBy: sender,
  });

  return farm;
}

function makeFarm(farm: Session["farm"]): GameState {
  return {
    ...farm,
    balance: new Decimal(farm.balance),
    // TODO - inventory: farm.inventory,
  };
}

type Changeset = {
  mintTokens: string;
  burnTokens: string;
  // Inventory
  mintIds: string[];
  mintAmounts: string[];
  burnIds: string[];
  burnAmounts: string[];
};
export async function calculateChangeset(id: number): Promise<Changeset> {
  let session = await getSessionByFarmId(id);

  if (!session) {
    throw new Error("Farm does not exist");
  }

  const farm = makeFarm(session.farm);
  const snapshot = makeFarm(session.oldFarm);

  const balance = farm.balance.minus(snapshot.balance);
  console.log({ balance: balance.toString() });
  console.log({ farm: farm.balance.toString() });
  console.log({ snapshot: farm.balance.toString() });

  const wei = toWei(balance.abs().toString());

  return {
    mintTokens: balance.isPositive() ? wei : "0",
    burnTokens: balance.isNegative() ? wei : "0",
    mintIds: [],
    mintAmounts: [],
    burnIds: [],
    burnAmounts: [],
  };
}
