import Accounts from "web3-eth-accounts";
import { sha3, soliditySha3 } from "web3-utils";

// Fake key for testing
const PRIVATE_KEY =
  "8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f";
const PUBLIC_KEY = "0x63FaC9201494f0bd17B9892B9fae4d52fe3BD377";

type VerifyAccountArgs = {
  farmId: number;
  address: string;
  signature: string;
};
export function verifyAccount({
  farmId,
  address,
  signature,
}: VerifyAccountArgs) {
  const message = generateMessage({ farmId, address });
  // HACK - Web3 incorrectly types the default class export: use any
  const owner = new (Accounts as any)().recover(message, signature);

  if (address !== owner) {
    throw new Error("Unable to verify account");
  }
}

function sign(data: string) {
  // HACK - Web3 incorrectly types the default class export: use any
  const signature = new (Accounts as any)().sign(data, PRIVATE_KEY);
  return signature;
}

type CreateFarmArgs = {
  charity: string;
  donation: number;
  address: string;
};

export function createFarmSignature({
  charity,
  donation,
  address,
}: CreateFarmArgs) {
  const shad = soliditySha3(
    {
      type: "address",
      value: charity,
    },
    {
      type: "uint",
      value: donation as any,
    },
    {
      type: "address",
      value: address,
    }
  );

  const { signature } = sign(shad as string);

  return signature;
}

type SaveArgs = {
  sessionId: string;
  farmId: number;
  sender: string;
  sfl: number;
  ids: number[];
  amounts: number[];
};

export function saveSignature({
  sessionId,
  farmId,
  sender,
  sfl,
  ids,
  amounts,
}: SaveArgs) {
  const shad = soliditySha3(
    {
      type: "bytes32",
      value: sessionId,
    },
    {
      type: "uint256",
      value: farmId.toString(),
    },
    {
      type: "int256",
      value: sfl.toString(),
    },
    {
      type: "uint256[]",
      value: ids as any,
    },
    {
      type: "int256[]",
      value: amounts as any,
    }
  );

  const { signature } = sign(shad as string);

  return signature;
}

type HashArgs = {
  address: string;
  farmId: number;
};

export function generateMessage({ address, farmId }: HashArgs) {
  const MESSAGE = [
    "Welcome to Sunflower Land!",
    "Click to sign in and accept the Sunflower Land Terms of Service: https://docs.sunflower-land.com/support/terms-of-service",
    "This request will not trigger a blockchain transaction or cost any gas fees.",
    "Your authentication status will reset after each session.",
    `Wallet address: ${address}`,
    `Farm ID: ${farmId}`,
  ].join("\n\n");

  return MESSAGE;
}
