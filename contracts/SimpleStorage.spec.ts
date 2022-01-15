import Web3 from "web3";
import contracts from "../bin/contracts/combined.json";
import {deployContract, TestAccount} from "./test-support";

describe("SimpleStorage contract", () => {
  it("stores a number", async function() {
    const web3 = new Web3(new Web3.providers.HttpProvider(process.env.ETH_NETWORK!));
    const contract = await deployContract(web3, contracts.contracts["contracts/SimpleStorage.sol:SimpleStorage"])
    const account = TestAccount.ACCOUNT_0;

    await contract.methods.set(10).send({ from: account.address });
    expect(await contract.methods.get().call({ from: account.address })).toEqual("10");

    await contract.methods.set(20).send({ from: account.address });
    expect(await contract.methods.get().call({ from: account.address })).toEqual("20");
  });
});