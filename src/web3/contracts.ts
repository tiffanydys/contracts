import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { createAlchemyWeb3 } from "@alch/alchemy-web3";

import FarmABI from "../../contracts/abis/Farm.json";
import TokenABI from "../../contracts/abis/Token.json";
import InventoryABI from "../../contracts/abis/Inventory.json";

import { GameState } from "../domain/game/types/game";
import { IDS } from "../domain/game/types";

const web3 = createAlchemyWeb3(
  // Mainnet - "https://polygon-mainnet.g.alchemy.com/v2/8IHJGDFw1iw3FQE8lCYAgp1530mXzT1-"
  "https://polygon-mumbai.g.alchemy.com/v2/8IHJGDFw1iw3FQE8lCYAgp1530mXzT1-"
);

const TESTNET_TOKEN_ADDRESS = "0x74909542f6Aa557eC1ef30e633F3d027e18888E2";
const TESTNET_FARM_ADDRESS = "0x7f6279D037587d647b529F1C6ACA43E4E314d392";
const TESTNET_INVENTORY_ADDRESS = "0x28f123423a76443D45e4BA96A512ffd42759BBCb";

type Options = {
  sender: string;
  farmId: number;
};

export async function fetchOnChainData({
  sender,
  farmId,
}: Options): Promise<GameState> {
  const farmContract = new web3.eth.Contract(
    FarmABI as any,
    TESTNET_FARM_ADDRESS
  );

  const farmNFT: { owner: string; account: string } = await farmContract.methods
    .getFarm(farmId)
    .call();

  if (farmNFT.owner !== sender) {
    throw new Error("Farm is not owned by you");
  }

  const tokenContract = new web3.eth.Contract(
    TokenABI as any,
    TESTNET_TOKEN_ADDRESS
  );

  const balance = await tokenContract.methods.balanceOf(farmNFT.account).call();

  const inventoryContract = new web3.eth.Contract(
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
