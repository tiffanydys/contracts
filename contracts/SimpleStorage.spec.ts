import Web3 from "web3";
import contracts from "../bin/contracts/combined.json";
import {deployContract, TestAccount} from "./test-support";

describe("SimpleStorage contract", () => {
  it("stores a number", async function() {
    const web3 = new Web3(new Web3.providers.HttpProvider(process.env.ETH_NETWORK!));
    const account = TestAccount.ACCOUNT_0;
    const contract = await deployContract(web3, contracts.contracts["contracts/SimpleStorage.sol:SimpleStorage"], account.address)

    await contract.methods.set(10).send({ from: account.address });
    expect(await contract.methods.get().call({ from: account.address })).toEqual("10");

    await contract.methods.set(20).send({ from: account.address });
    expect(await contract.methods.get().call({ from: account.address })).toEqual("20");
  });

  it("only update contract by owner", async function() {
    const web3 = new Web3(new Web3.providers.HttpProvider(process.env.ETH_NETWORK!));
    const accountA = TestAccount.ACCOUNT_0;
    const accountB = TestAccount.ACCOUNT_1;
    const contract = await deployContract(web3, contracts.contracts["contracts/SimpleStorage.sol:SimpleStorage"], accountA.address)

    await expect(contract.methods.set(10).send({ from: accountB.address })).rejects.toEqual(expect.objectContaining({
      message: "Returned error: VM Exception while processing transaction: revert Ownable: caller is not the owner"
    }))
  })

  it("can be read by any account", async function() {
    const web3 = new Web3(new Web3.providers.HttpProvider(process.env.ETH_NETWORK!));
    const accountA = TestAccount.ACCOUNT_0;
    const accountB = TestAccount.ACCOUNT_1;
    const contract = await deployContract(web3, contracts.contracts["contracts/SimpleStorage.sol:SimpleStorage"], accountA.address)

    await contract.methods.set(10).send({ from: accountA.address })
    expect(await contract.methods.get().call({from :accountB.address})).toEqual("10")
  })
});