import { blacklistFarm } from "../../../repository/farms";
import { Account } from "../../../repository/types";

// After 10 flags, they are done
const FLAG_COUNT = 10;

// Blacklisted for 3 days
const BLACKLISTED_MS = 1000 * 60 * 60 * 24 * 3;

export async function isBlackListed(account: Account) {
  if (!account) {
    return false;
  }

  if (account.blacklistedAt) {
    // TODO turn on blacklisting in future
    return (
      Date.now() < new Date(account.blacklistedAt).getTime() + BLACKLISTED_MS
    );
  }

  // Not yet blacklisted but should be
  if (account.flaggedCount > FLAG_COUNT) {
    await blacklistFarm(account);

    // TODO turn on blacklisting in future
    return true;
  }

  return false;
}
