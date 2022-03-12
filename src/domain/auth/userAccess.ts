import { canSync, canWithdraw } from "../../constants/whitelist";
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

export async function getDiscordAccess(
  code: string
): Promise<Pick<UserAccess, "createFarm">> {
  const { access_token } = await authorize(code);
  const roles = await getRoles(access_token);
  return {
    createFarm: roles.includes("beta"),
  };
}
