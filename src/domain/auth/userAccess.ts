import { canSync, canWithdraw } from "../../constants/whitelist";
import { getDiscordUser, createDiscordUser } from "../../repository/db";
import { authorize, getRoles } from "../../services/discord";

export type UserAccess = {
  withdraw: boolean;
  createFarm: boolean;
  sync: boolean;
  mintCollectible: boolean;
};

const network = process.env.NETWORK as "mumbai" | "mainnet";

export function getUserAccess(address: string): UserAccess {
  return {
    withdraw: canWithdraw(address),
    sync: canSync(address),
    mintCollectible: canWithdraw(address),
    /**
     * Users only get createFarm privileges if they have oauthed through Discord
     * Or in develop
     */
    createFarm: network === "mumbai",
  };
}

/**
 * Based on roles in Discord, will return the user's permissions
 * Only 1 Discord account can be used at the moment
 */
export async function getDiscordAccess({
  code,
  address,
}: {
  code: string;
  address: string;
}) {
  const { access_token } = await authorize(code);
  const { id, roles } = await getRoles(access_token);

  const user = await getDiscordUser(id);

  if (user && user.address !== address) {
    throw new Error(`Discord #${id} already exists for ${address}`);
  }

  await createDiscordUser({
    discordId: id,
    address,
    createdAt: new Date().toISOString(),
  });

  return {
    id,
    createFarm:
      roles.includes("beta") ||
      roles.includes("golden egg") ||
      roles.includes("ambassador") ||
      roles.includes("international ambasssador"),
  };
}
