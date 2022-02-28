import { blacklistFarm } from "../../../repository/farms";
import { Account } from "../../../repository/types";

// After 10 flags, they are done
const FLAG_COUNT = 10;
export async function isBlackListed(account: Account) {
  if (account.blacklistedAt) {
    // TODO turn on blacklisting in future
    //return true;
    return false;
  }

  // Not yet blacklisted but should be
  if (account.flaggedCount > FLAG_COUNT) {
    await blacklistFarm(account);

    // TODO turn on blacklisting in future
    //return true;
    return false;
  }

  return false;
}
