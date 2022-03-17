import DiscordOauth2, { Member, TokenRequestResult } from "discord-oauth2";
import fetch from "node-fetch";
import { URLSearchParams } from "url";

// Sunflower Land Server ID
const GUILD_ID = "880987707214544966";

export async function authorize(
  code: string
): Promise<{ access_token: string }> {
  const options = {
    url: "https://discord.com/api/oauth2/token",
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID as string,
      client_secret: process.env.DISCORD_CLIENT_SECRET as string,
      grant_type: "authorization_code",
      code: code,
      redirect_uri: process.env.DISCORD_REDIRECT_URI as string,
      scope: "guilds.members.read",
    }),
  };

  console.log({ options });

  const discordData = await fetch(
    "https://discord.com/api/oauth2/token",
    options
  )
    .then((response) => {
      return response.json();
    })
    .then((response) => {
      return response;
    });
  console.log({ discordData });

  return discordData;
}

type DiscordRole =
  | "beta"
  | "golden egg"
  | "international ambasssador"
  | "ambassador"
  | "moderator"
  | "hodl";

const ROLES: Record<string, DiscordRole> = {
  "935397030027747348": "beta",
  "927745651259879476": "golden egg",
  "927131260843864144": "ambassador",
  "927775987024924713": "international ambasssador",
  "925391410969071628": "moderator",
  "927763667586527272": "hodl",
};

export async function requestRoles(accessToken: string) {
  const options = {
    method: "GET",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      authorization: `Bearer ${accessToken}`, // Define the authorization
    },
  };

  const discordRoles = await fetch(
    `https://discord.com/api//users/@me/guilds/${GUILD_ID}/member`,
    options
  )
    .then((response) => {
      return response.json();
    })
    .then((response) => {
      return response;
    });
  console.log({ discordRoles });

  return discordRoles;
}

export async function getRoles(
  accessToken: string
): Promise<{ roles: DiscordRole[]; id: string }> {
  const guildMember: Member = await requestRoles(accessToken);

  console.log({ guildMember });

  const roles = guildMember.roles.map((roleId) => ROLES[roleId]);

  return {
    id: guildMember?.user?.id as string,
    roles,
  };
}
