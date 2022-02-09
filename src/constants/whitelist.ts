const SYNC_WHITELIST = [
  "0xD755984F4A5D885919451eD25e1a854daa5086C9",
  "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
];

const CREATE_FARM_WHITELIST = [...SYNC_WHITELIST];

export function canCreateFarm(address: string) {
  return CREATE_FARM_WHITELIST.includes(address);
}

export function canSync(address: string) {
  return SYNC_WHITELIST.includes(address);
}

export function canMint(address: string) {
  return SYNC_WHITELIST.includes(address);
}
