const WITHDRAW_WHITELIST = [
  "0xD755984F4A5D885919451eD25e1a854daa5086C9",
  "0xc23Ea4b3fFA70DF89874ff65759031d78e40251d",
  "0x481a58b9385868267Ff39ab285D22234B50871eD",
  "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
  "0x95485461fc996a39a4f60749489b93ad2d835452",
];

export function canMint(address: string) {
  const network = process.env.NETWORK as "mumbai" | "mainnet";
  if (network !== "mainnet") {
    return true;
  }
  return WITHDRAW_WHITELIST.includes(address);
}

export function canWithdraw(address: string) {
  const network = process.env.NETWORK as "mumbai" | "mainnet";
  if (network !== "mainnet") {
    return true;
  }
  return WITHDRAW_WHITELIST.includes(address);
}
