import Web3 from "web3";
import { AbiItem } from "web3-utils";

export class TestAccount {
  static readonly ACCOUNT_0  = new TestAccount(
    "0x17e0cC27d7030de22b01a0c235abbb0F99f641ba",
    "0x50a9586d7081c9d61233bcb23853e10bb4c97fdfc4212b8c050fd90d92e65c20",
    );

  private constructor(public readonly address: string, public readonly privateKey: any) {
  }
}

export async function deployContract(web3: Web3, contract: { abi: {}; bin: string }) {
  const simpleStorage = new web3.eth.Contract(contract.abi as AbiItem[]);

  return simpleStorage
    .deploy({
      data: contract.bin,
      arguments: []
    })
    .send({
      from: "0x17e0cC27d7030de22b01a0c235abbb0F99f641ba",
      gasPrice: await web3.eth.getGasPrice(),
      gas: 6721975
    });
}