import Web3 from "web3";
import { AbiItem } from "web3-utils";
import contracts from "../bin/contracts/combined.json";

describe("SimpleStorage contract", () => {
  it("stores a number", async function() {
    const web3 = new Web3(new Web3.providers.HttpProvider(process.env.ETH_NETWORK!));
    const contract = await deployedContract(web3);

    await contract.methods.set(10).send({ from: "0x17e0cC27d7030de22b01a0c235abbb0F99f641ba" });
    expect(await contract.methods.get().call({ from: "0x17e0cC27d7030de22b01a0c235abbb0F99f641ba" })).toEqual("10");

    await contract.methods.set(20).send({ from: "0x17e0cC27d7030de22b01a0c235abbb0F99f641ba" });
    expect(await contract.methods.get().call({ from: "0x17e0cC27d7030de22b01a0c235abbb0F99f641ba" })).toEqual("20");
  });

  async function deployedContract(web3: Web3) {
    const simpleStorageABI = contracts.contracts["contracts/SimpleStorage.sol:SimpleStorage"];
    const simpleStorage = new web3.eth.Contract(simpleStorageABI.abi as AbiItem[]);

    return simpleStorage
      .deploy({
        data: simpleStorageABI.bin,
        arguments: []
      })
      .send({
        from: "0x17e0cC27d7030de22b01a0c235abbb0F99f641ba",
        gasPrice: await web3.eth.getGasPrice(),
        gas: 6721975
      });
  }
});