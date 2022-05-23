import Web3 from "web3";
import {
  TestAccount,
  deployMutantCropContracts,
  gasLimit,
} from "./test-support";

describe("Million on Mars contract", () => {
  it("deploys with total supply zero", async function () {
    const web3 = new Web3(
      new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
    );

    const { mutantCrops } = await deployMutantCropContracts(web3);

    expect(
      await mutantCrops.methods
        .totalSupply()
        .call({ from: TestAccount.TEAM.address })
    ).toEqual("0");
  });
});
