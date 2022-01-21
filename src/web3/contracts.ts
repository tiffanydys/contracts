import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { createAlchemyWeb3 } from "@alch/alchemy-web3";
import FarmABI from "../../contracts/abis/Farm.json";

import { verify } from "../lib/sign";
import { Farm } from "../lib/types";

const web3 = createAlchemyWeb3(
  // Mainnet - "https://polygon-mainnet.g.alchemy.com/v2/8IHJGDFw1iw3FQE8lCYAgp1530mXzT1-"
  "https://polygon-mumbai.g.alchemy.com/v2/8IHJGDFw1iw3FQE8lCYAgp1530mXzT1-"
);

const TESTNET_TOKEN_ADDRESS = "0x5776d2DB624b6CFFEC7DdD5ba79885811c83A572";
const TESTNET_FARM_ADDRESS = "0x1C7942d78A3267555a3e523bfA48ce5682206CD7";

type Options = {
  sender: string;
  farmId: number;
};
export async function fetchOnChainData({ sender, farmId }: Options) {
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
    FarmABI as any,
    TESTNET_TOKEN_ADDRESS
  );

  const balance = await tokenContract.methods.balanceOf(farmNFT.account).call();

  console.log({ balance });

  const farm: Farm = {
    balance,
    fields: [],
    inventory: {},
  };
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      farm,
    }),
  };
}
