import { blacklistFarm } from "../../../repository/farms";
import { Account } from "../../../repository/types";

export async function isBlackListed(account: Account) {
  if (account.blacklistedAt) {
    return true;
  }

  // Not yet blacklisted but should be
  if (account.flaggedCount > 10) {
    await blacklistFarm(account);

    return true;
  }

  return false;
}
