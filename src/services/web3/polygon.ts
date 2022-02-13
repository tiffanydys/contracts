import { createAlchemyWeb3 } from "@alch/alchemy-web3";

import FarmABI from "../../../contracts/abis/Farm.json";
import TokenABI from "../../../contracts/abis/Token.json";
import InventoryABI from "../../../contracts/abis/Inventory.json";
import SunflowerFarmersABI from "../../../contracts/abis/SunflowerFarmers.json";

const alchemyKey = process.env.ALCHEMY_KEY;
const network = process.env.NETWORK;

const sunflowerLandWeb3 = createAlchemyWeb3(
  `https://polygon-${network}.g.alchemy.com/v2/${alchemyKey}`
);

const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS;
const FARM_ADDRESS = process.env.FARM_ADDRESS;
const INVENTORY_ADDRESS = process.env.INVENTORY_ADDRESS;

export type FarmNFT = { owner: string; account: string; tokenId: number };
export async function loadNFTFarm(id: number) {
  const farmContract = new sunflowerLandWeb3.eth.Contract(
    FarmABI as any,
    FARM_ADDRESS
  );

  const farmNFT: FarmNFT = await farmContract.methods.getFarm(id).call();

  return farmNFT;
}

export async function loadBalance(address: string): Promise<string> {
  const tokenContract = new sunflowerLandWeb3.eth.Contract(
    TokenABI as any,
    TOKEN_ADDRESS
  );

  const balance: string = await tokenContract.methods.balanceOf(address).call();

  return balance;
}

export async function loadInventory(
  ids: number[],
  address: string
): Promise<string[]> {
  const inventoryContract = new sunflowerLandWeb3.eth.Contract(
    InventoryABI as any,
    INVENTORY_ADDRESS
  );

  const addresses = ids.map(() => address);

  const inventory: string[] = await inventoryContract.methods
    .balanceOfBatch(addresses, ids)
    .call();

  return inventory;
}

// Always from mainnet
const sunflowerFarmersWeb3 = createAlchemyWeb3(
  `https://polygon-mainnet.g.alchemy.com/v2/${alchemyKey}`
);

const SFF_TOKEN_ADDRESS = "0xdf9B4b57865B403e08c85568442f95c26b7896b0";
const SFF_FARM_ADDRESS = "0x6e5Fa679211d7F6b54e14E187D34bA547c5d3fe0";

/**
 * Random block chosen
 * (Jan-28-2022 02:00:44 AM +UTC)
 * Gives leeway for people who accidentally exchanged tokens
 * Also gave time for people to withdraw LP
 */
const RECOVERY_BLOCK_NUMBER = 24247919;

export async function loadV1Balance(address: string): Promise<string> {
  const tokenContract = new sunflowerFarmersWeb3.eth.Contract(
    // Use other ABI as it is also a ERC20 token
    TokenABI as any,
    SFF_TOKEN_ADDRESS
  );

  const balance = await tokenContract.methods
    .balanceOf(address)
    .call({ blockNumber: RECOVERY_BLOCK_NUMBER }, RECOVERY_BLOCK_NUMBER);

  return balance;
}

export enum V1Fruit {
  None = "0",
  Sunflower = "1",
  Potato = "2",
  Pumpkin = "3",
  Beetroot = "4",
  Cauliflower = "5",
  Parsnip = "6",
  Radish = "7",
}

export interface Square {
  fruit: V1Fruit;
  createdAt: number;
}

export async function loadV1Farm(address: string): Promise<Square[]> {
  const farmContract = new sunflowerFarmersWeb3.eth.Contract(
    SunflowerFarmersABI as any,
    SFF_FARM_ADDRESS
  );

  const fields = await farmContract.methods
    .getLand(address)
    .call({ blockNumber: RECOVERY_BLOCK_NUMBER }, RECOVERY_BLOCK_NUMBER);

  return fields;
}
