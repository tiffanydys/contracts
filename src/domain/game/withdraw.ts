import Decimal from "decimal.js-light";
import { fromWei, toWei } from "web3-utils";
import { storeWithdraw } from "../../repository/eventStore";
import { getFarmById } from "../../repository/farms";

import { withdrawSignature } from "../../services/web3/signatures";
import { isBlackListed } from "./lib/blacklist";
import { makeGame } from "./lib/transforms";

/**
 * Returns the tax rate when withdrawing SFL
 * Smart contract uses a base rate of 1000 for decimal precision. 10% = 100
 */
export function getTax(sfl: string) {
  const amount = new Decimal(fromWei(sfl));

  if (amount.lessThan(10)) {
    // 30%
    return 300;
  }

  if (amount.lessThan(100)) {
    // 25%
    return 250;
  }

  if (amount.lessThan(1000)) {
    // 20%
    return 200;
  }

  if (amount.lessThan(5000)) {
    // 15%
    return 150;
  }

  // 10%
  return 100;
}

type Options = {
  sender: string;
  farmId: number;
  sfl: string;
  ids: number[];
  amounts: string[];
};

export async function withdraw({ sender, farmId, sfl, ids, amounts }: Options) {
  const farm = await getFarmById(farmId);
  if (!farm || farm.updatedBy !== sender) {
    throw new Error("Farm does not exist");
  }

  const blacklisted = await isBlackListed(farm);
  if (blacklisted) {
    throw new Error(`Farm #${farmId} - ${farm.updatedBy} is blacklisted`);
  }

  const balance = new Decimal(toWei(farm.gameState.balance));
  if (balance.lessThan(sfl)) {
    throw new Error("Not enough SFL");
  }

  // TODO inventory validation in future - smart contract ERC20 protocols won't enable this though

  // Smart contract does balance validation so don't worry about it here
  const signature = await withdrawSignature({
    sender: sender,
    farmId: farmId,
    // Always make sure we don't use what they pass us
    sessionId: farm.sessionId,
    sfl: sfl,
    ids: ids,
    amounts: amounts,
    tax: getTax(sfl),
  });

  await storeWithdraw({
    account: sender,
    sessionId: farm.sessionId,
    farmId,
    sfl,
    ids,
    amounts,
    version: farm.version,
  });

  return signature;
}
