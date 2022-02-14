import FarmABI from "../../../contracts/abis/Farm.json";
import TokenABI from "../../../contracts/abis/Token.json";
import InventoryABI from "../../../contracts/abis/Inventory.json";
import SunflowerFarmersABI from "../../../contracts/abis/SunflowerFarmers.json";
import { Web3Service, Network } from "./Web3Service";
import { Square } from "./types";

const network = process.env.NETWORK;

const sunflowerLandWeb3 = new Web3Service(network as Network);

const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS;
const FARM_ADDRESS = process.env.FARM_ADDRESS;
const INVENTORY_ADDRESS = process.env.INVENTORY_ADDRESS;

export type FarmNFT = { owner: string; account: string; tokenId: number };
export async function loadNFTFarm(id: number) {
  const farmNFT: FarmNFT = await sunflowerLandWeb3.call({
    abi: FarmABI as any,
    address: FARM_ADDRESS as string,
    method: "getFarm",
    args: [id],
  });

  return farmNFT;
}

export async function loadBalance(address: string): Promise<string> {
  const balance: string = await sunflowerLandWeb3.call({
    abi: TokenABI as any,
    address: TOKEN_ADDRESS as string,
    method: "balanceOf",
    args: [address],
  });

  return balance;
}

export async function loadInventory(
  ids: number[],
  address: string
): Promise<string[]> {
  const addresses = ids.map(() => address);

  const inventory: string[] = await sunflowerLandWeb3.call({
    abi: InventoryABI as any,
    address: INVENTORY_ADDRESS as string,
    method: "balanceOfBatch",
    args: [addresses, ids],
  });

  return inventory;
}

export async function loadItemSupply(id: number): Promise<string> {
  const supply: string = await sunflowerLandWeb3.call({
    abi: InventoryABI as any,
    address: INVENTORY_ADDRESS as string,
    method: "totalSupply",
    args: [id],
  });

  return supply;
}

// Always from mainnet to read snapshot
const sunflowerFarmersWeb3 = new Web3Service("mainnet");

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
  const balance: string = await sunflowerFarmersWeb3.call({
    // Use other ABI as it is also a ERC20 token
    abi: TokenABI as any,
    address: SFF_TOKEN_ADDRESS as string,
    method: "balanceOf",
    args: [address],
    blockNumber: RECOVERY_BLOCK_NUMBER,
  });

  return balance;
}

export async function loadV1Farm(address: string): Promise<Square[]> {
  const fields: Square[] = await sunflowerFarmersWeb3.call({
    // Use other ABI as it is also a ERC20 token
    abi: SunflowerFarmersABI as any,
    address: SFF_FARM_ADDRESS as string,
    method: "getLand",
    args: [address],
    blockNumber: RECOVERY_BLOCK_NUMBER,
  });

  return fields;
}
