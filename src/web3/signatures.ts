import Accounts from "web3-eth-accounts";
import { soliditySha3, toWei } from "web3-utils";
import { KNOWN_IDS } from "../domain/game/types";
import { Inventory, InventoryItemName } from "../domain/game/types/game";
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

export type SyncArgs = {
  sessionId: string;
  deadline: number;
  sender: string;
  farmId: number;
  mintIds: number[];
  mintAmounts: string[];
  burnIds: number[];
  burnAmounts: string[];
  tokens: string;
};

export function encodeSyncFunction({
  sessionId,
  deadline,
  sender,
  farmId,
  mintIds,
  mintAmounts,
  burnIds,
  burnAmounts,
  tokens,
}: SyncArgs) {
  return soliditySha3(
    {
      type: "bytes32",
      value: sessionId,
    },
    {
      type: "uint256",
      value: deadline.toString(),
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
      type: "uint256[]",
      value: mintIds as any,
    },
    {
      type: "uint256[]",
      value: mintAmounts as any,
    },
    {
      type: "uint256[]",
      value: burnIds as any,
    },
    {
      type: "uint256[]",
      value: burnAmounts as any,
    },
    {
      type: "int256",
      value: tokens.toString(),
    }
  );
}

const SYNC_DEADLINE_MINUTES = 5;

type SyncSignature = {
  sessionId: string;
  sender: string;
  farmId: number;
  sfl: number;
  inventory: Inventory;
};

type InventoryArgs = Pick<
  SyncArgs,
  "mintIds" | "mintAmounts" | "burnIds" | "burnAmounts"
>;
export async function syncSignature({
  farmId,
  inventory,
  sender,
  sessionId,
  sfl,
}: SyncSignature) {
  const deadline = Math.floor(Date.now() / 1000 + SYNC_DEADLINE_MINUTES * 60);

  const names = Object.keys(inventory) as InventoryItemName[];

  // Convert the inventory into the parameters required for the smart contract function
  const inventoryChange: InventoryArgs = names.reduce(
    (changes, name) => {
      const amount = inventory[name as InventoryItemName];
      const id = KNOWN_IDS[name];

      if (amount?.greaterThan(0)) {
        return {
          ...changes,
          mintIds: [...changes.mintIds, id],
          mintAmounts: [...changes.mintAmounts, amount.toString()],
        };
      }

      if (amount?.lessThan(0)) {
        return {
          ...changes,
          burnIds: [...changes.burnIds, id],
          burnAmounts: [...changes.burnAmounts, amount?.toString()],
        };
      }

      return changes;
    },
    {
      mintIds: [],
      mintAmounts: [],
      burnIds: [],
      burnAmounts: [],
    } as InventoryArgs
  ) as InventoryArgs;

  const args = {
    sessionId: sessionId,
    farmId: farmId,
    sender: sender,
    tokens: sfl.toString(),
    deadline,
    ...inventoryChange,
  };
  const shad = encodeSyncFunction(args);

  const { signature } = await sign(shad as string);

  return {
    ...args,
    signature,
  };
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
  ].join("\n\n");

  return MESSAGE;
}
