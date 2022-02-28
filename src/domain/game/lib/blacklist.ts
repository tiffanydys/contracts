import { blacklistFarm } from "../../../repository/farms";
import { Account } from "../../../repository/types";

// After 10 flags, they are done
const FLAG_COUNT = 10;
export async function isBlackListed(account: Account) {
  if (account.blacklistedAt) {
    return true;
  }

  // Not yet blacklisted but should be
  if (account.flaggedCount > FLAG_COUNT) {
    await blacklistFarm(account);

    return true;
  }

  return false;
}
