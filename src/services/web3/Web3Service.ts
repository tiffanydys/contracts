import { AlchemyWeb3, createAlchemyWeb3 } from "@alch/alchemy-web3";
import Web3 from "web3";
import { AbiItem } from "web3-utils";

const alchemyKey = process.env.ALCHEMY_KEY;

export type Network = "mainnet" | "mumbai";

/**
 * Wrapper class for swapping between node providers
 */
export class Web3Service {
  private service: "alchemy" | "infura" = "alchemy";
  private web3: Web3 | AlchemyWeb3;
  private network: Network;

  constructor(network: Network) {
    this.web3 = createAlchemyWeb3(
      `https://polygon-${network}.g.alchemy.com/v2/${alchemyKey}`
    );
    this.network = network;
  }

  public async call({
    abi,
    address,
    method,
    args,
    blockNumber,
  }: {
    abi: AbiItem;
    address: string;
    method: string;
    args: any[];
    blockNumber?: number;
  }): Promise<any> {
    const contract = new this.web3.eth.Contract(abi, address);

    try {
      const result = await contract.methods[method](...args).call(
        {
          blockNumber,
        },
        blockNumber
      );

      if (this.service === "alchemy") {
        throw new Error("Not implemented");
      }

      return result;
    } catch (e) {
      console.error(e);

      // Change network and retry
      if (this.service === "alchemy") {
        await this.fallback();
        return this.call({
          abi,
          address,
          method,
          args,
          blockNumber,
        });
      }

      throw e;
    }
  }

  /**
   * Fallback to infura
   */
  private async fallback() {
    const ethNetwork = `https://polygon-${this.network}.infura.io/v3/f57b519b7c524724b8322b66c77dcb99`;
    this.web3 = new Web3(new Web3.providers.HttpProvider(ethNetwork));
    this.service = "infura";
  }
}
