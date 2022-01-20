import Web3 from "web3";
import { deploySFLContracts, TestAccount } from "./test-support";

describe("Farm contract", () => {
  it("deploys with total supply zero", async function () {
    const web3 = new Web3(
      new Web3.providers.HttpProvider(process.env.ETH_NETWORK!)
    );

    const { farm } = await deploySFLContracts(web3);

    expect(
      await farm.methods.totalSupply().call({ from: TestAccount.TEAM.address })
    ).toEqual("0");
  });
});
