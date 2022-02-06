import Accounts from "web3-eth-accounts";
import { soliditySha3, toWei } from "web3-utils";
import { sign } from "../services/kms";

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

type CreateFarmArgs = {
  charity: string;
  donation: number;
  address: string;
};

export async function createFarmSignature({
  charity,
  donation,
  address,
}: CreateFarmArgs) {
  console.log({ charity, donation, address });
  const wei = toWei(donation.toString());

  const shad = soliditySha3(
    {
      type: "address",
      value: charity,
    },
    {
      type: "uint",
      value: wei as any,
    },
    {
      type: "address",
      value: address,
    }
  );

  const { signature } = await sign(shad as string);

  return { signature, donation: wei, charity };
}

type SaveArgs = {
  sessionId: string;
  sender: string;
  farmId: number;
  sfl: number;
  ids: number[];
  amounts: number[];
};

export async function saveSignature({
  sessionId,
  sender,
  farmId,
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
      type: "address",
      value: sender,
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

  const { signature } = await sign(shad as string);

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
