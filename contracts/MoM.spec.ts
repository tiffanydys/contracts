import Web3 from "web3";
import {
  deploySFLContracts,
  TestAccount,
  gasLimit,
  deployMoMContracts,
} from "./test-support";

describe("Million on Mars contract", () => {
  it("deploys with total supply zero", async function () {
    const web3 = new Web3(
      new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
    );

    const { millionOnMarsNFT } = await deployMoMContracts(web3);

    expect(
      await millionOnMarsNFT.methods
        .totalSupply()
        .call({ from: TestAccount.TEAM.address })
    ).toEqual("0");
  });

  it("does not let users mint an item", async function () {
    const web3 = new Web3(
      new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
    );

    const { millionOnMarsNFT } = await deployMoMContracts(web3);

    const result = millionOnMarsNFT.methods
      .mint([])
      .call({ from: TestAccount.TEAM.address });

    await expect(
      result.catch((e: Error) => Promise.reject(e.message))
    ).rejects.toContain("SunflowerLandGame: You are not the game");
  });

  it("lets MoM mint NFTs", async function () {
    const web3 = new Web3(
      new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
    );

    const { millionOnMarsNFT } = await deployMoMContracts(web3);

    const result = millionOnMarsNFT.methods
      .mint([])
      .call({ from: TestAccount.TEAM.address });

    await expect(
      result.catch((e: Error) => Promise.reject(e.message))
    ).rejects.toContain("SunflowerLandGame: You are not the game");
  });

  it("mints multiple NFTs", async function () {
    const web3 = new Web3(
      new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
    );

    const { millionOnMarsNFT } = await deployMoMContracts(web3);

    millionOnMarsNFT.methods
      .addGameRole(TestAccount.TEAM.address)
      .call({ from: TestAccount.TEAM.address });

    await millionOnMarsNFT.methods
      .mint([])
      .call({ from: TestAccount.TEAM.address });

    expect(
      await millionOnMarsNFT.methods
        .totalSupply()
        .call({ from: TestAccount.TEAM.address })
    ).toEqual("2");
  });

  it("does not let user trade MoM NFT directly", () => {});

  it("does not trade for Sunflower Land item if they don't have MoM NFT", () => {});

  it("trades for Sunflower Land item", () => {});
});
