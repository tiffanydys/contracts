const WHITELIST = [
  "0xD755984F4A5D885919451eD25e1a854daa5086C9",
  "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
];

export function isWhitelisted(address: string) {
  return WHITELIST.includes(address);
}
