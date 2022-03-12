import { canSync, canWithdraw } from "../../constants/whitelist";
import { authorize, getRoles } from "../../services/discord";

export type UserAccess = {
  withdraw: boolean;
  createFarm: boolean;
  sync: boolean;
  mintCollectible: boolean;
};

export function getUserAccess(address: string): UserAccess {
  return {
    withdraw: canWithdraw(address),
    sync: canSync(address),
    mintCollectible: canWithdraw(address),
    // Unless authorized with Discord, this will be false
    createFarm: false,
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
