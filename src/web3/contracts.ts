import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { createAlchemyWeb3 } from "@alch/alchemy-web3";

import FarmABI from "../../contracts/abis/Farm.json";
import TokenABI from "../../contracts/abis/Token.json";
import InventoryABI from "../../contracts/abis/Inventory.json";
import SunflowerFarmersABI from "../../contracts/abis/SunflowerFarmers.json";

import { GameState } from "../domain/game/types/game";
import { IDS } from "../domain/game/types";
import Decimal from "decimal.js-light";

const testnet = createAlchemyWeb3(
  "https://polygon-mumbai.g.alchemy.com/v2/8IHJGDFw1iw3FQE8lCYAgp1530mXzT1-"
);

const mainnet = createAlchemyWeb3(
  "https://polygon-mainnet.g.alchemy.com/v2/8IHJGDFw1iw3FQE8lCYAgp1530mXzT1-"
);

const TESTNET_TOKEN_ADDRESS = "0x74909542f6Aa557eC1ef30e633F3d027e18888E2";
const TESTNET_FARM_ADDRESS = "0x7f6279D037587d647b529F1C6ACA43E4E314d392";
const TESTNET_INVENTORY_ADDRESS = "0x28f123423a76443D45e4BA96A512ffd42759BBCb";

type Options = {
  sender: string;
  farmId: number;
};

export async function loadNFTFarm(id: number) {
  const farmContract = new testnet.eth.Contract(
    FarmABI as any,
    TESTNET_FARM_ADDRESS
  );
  const farmNFT: { owner: string; account: string } = await farmContract.methods
    .getFarm(id)
    .call();

  return farmNFT;
}

export async function fetchOnChainData({
  sender,
  farmId,
}: Options): Promise<GameState> {
  const farmContract = new testnet.eth.Contract(
    FarmABI as any,
    TESTNET_FARM_ADDRESS
  );

  const farmNFT = await loadNFTFarm(farmId);

  if (farmNFT.owner !== sender) {
    throw new Error("Farm is not owned by you");
  }

  const tokenContract = new testnet.eth.Contract(
    TokenABI as any,
    TESTNET_TOKEN_ADDRESS
  );

  const balance = await tokenContract.methods.balanceOf(farmNFT.account).call();

  const inventoryContract = new testnet.eth.Contract(
    InventoryABI as any,
    TESTNET_INVENTORY_ADDRESS
  );

  const addresses = IDS.map(() => farmNFT.account);

  // TODO loop through all tokens and get the balances
  const inventory = await inventoryContract.methods
    .balanceOfBatch(addresses, IDS)
    .call();

  console.log({ inventory });

  return {
    balance,
    inventory: {},
    id: farmId,
    address: farmNFT.account,
    // Not used
    fields: {},
  } as GameState;
}

const SFF_TOKEN_ADDRESS = "0xdf9B4b57865B403e08c85568442f95c26b7896b0";
const SFF_FARM_ADDRESS = "0x6e5Fa679211d7F6b54e14E187D34bA547c5d3fe0";

// Announced Block number to pause the game
const BLOCK_NUMBER = 23451693;

export async function loadV1Balance(address: string): Promise<string> {
  const tokenContract = new mainnet.eth.Contract(
    // Use other ABI as it is also a ERC20 token
    TokenABI as any,
    SFF_TOKEN_ADDRESS
  );
  console.log("INITIED###");

  const balance = await tokenContract.methods
    .balanceOf(address)
    .call({ blockNumber: BLOCK_NUMBER }, BLOCK_NUMBER);
  console.log({ balance });
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

interface Square {
  fruit: V1Fruit;
  createdAt: number;
}

export async function loadV1Farm(address: string): Promise<Square[]> {
  const farmContract = new mainnet.eth.Contract(
    SunflowerFarmersABI as any,
    SFF_FARM_ADDRESS
  );

  const fields = await farmContract.methods
    .getLand(address)
    .call({ blockNumber: BLOCK_NUMBER }, BLOCK_NUMBER);

  return fields;
}
