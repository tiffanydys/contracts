import Web3 from "web3";
import { AbiItem } from "web3-utils";

export class TestAccount {
  static readonly ACCOUNT_0  = new TestAccount(
    "0x17e0cC27d7030de22b01a0c235abbb0F99f641ba",
    "0x50a9586d7081c9d61233bcb23853e10bb4c97fdfc4212b8c050fd90d92e65c20",
    );

  static readonly ACCOUNT_1  = new TestAccount(
    "0xA0C98e54Ac289A886C8a4eD93AC2F3ecE8acF65f",
    "0xd4f9fd3336dc904874ea88f88dbbc476648766c394f37b2f6f9dc62900e1e5e4",
  );

  private constructor(public readonly address: string, public readonly privateKey: any) {
  }
}

export async function deployContract(web3: Web3, contract: { abi: {}; bin: string }, address: string) {
  const simpleStorage = new web3.eth.Contract(contract.abi as AbiItem[]);

  return simpleStorage
    .deploy({
      data: contract.bin,
      arguments: []
    })
    .send({
      from: address,
      gasPrice: await web3.eth.getGasPrice(),
      gas: 6721975
    });
}