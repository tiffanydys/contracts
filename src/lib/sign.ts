import Accounts from "web3-eth-accounts";
import Encoder from "web3-eth-abi";

// Fake key for testing
const PRIVATE_KEY =
  "8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f";
const PUBLIC_KEY = "0x63FaC9201494f0bd17B9892B9fae4d52fe3BD377";

export function sign(data: string) {
  // HACK - Web3 incorrectly types the default class export: use any
  const signature = new (Accounts as any)().sign(data, PRIVATE_KEY);
  return signature;
}

export function encodeParameters(
  parameterTypes: string[],
  parameterValues: any[]
) {
  // HACK - Web3 incorrectly types the default class export: use any
  const encodedParameters = (Encoder as any).encodeParameters(
    parameterTypes,
    parameterValues
  );

  return encodedParameters;
}

export function verify(data: string, signature: string) {
  // HACK - Web3 incorrectly types the default class export: use any
  const address = new (Accounts as any)().recover(data, signature);
  return address;
}
