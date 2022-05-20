import Web3 from "web3";
import { TestAccount, deployMoMContracts } from "./test-support";

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

    millionOnMarsNFT.methods
      .addGameRole(TestAccount.TEAM.address)
      .call({ from: TestAccount.TEAM.address });

    await millionOnMarsNFT.methods
      .mint(["0x5DD6c98eF2F48a31a3B2fd81ad8c1dbD5C7410Db"])
      .call({ from: TestAccount.TEAM.address });

    expect(
      await millionOnMarsNFT.methods
        .balanceOf("0x5DD6c98eF2F48a31a3B2fd81ad8c1dbD5C7410Db")
        .call({ from: TestAccount.TEAM.address })
    ).toEqual("1");

    expect(
      await millionOnMarsNFT.methods
        .totalSupply()
        .call({ from: TestAccount.TEAM.address })
    ).toEqual("1");
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
      .mint([
        "0x5DD6c98eF2F48a31a3B2fd81ad8c1dbD5C7410Db",
        "0x5001FD9F7EcF5aC206F499fB93b6728Dca319165",
      ])
      .call({ from: TestAccount.TEAM.address });

    expect(
      await millionOnMarsNFT.methods
        .balanceOf("0x5DD6c98eF2F48a31a3B2fd81ad8c1dbD5C7410Db")
        .call({ from: TestAccount.TEAM.address })
    ).toEqual("1");

    expect(
      await millionOnMarsNFT.methods
        .balanceOf("0x5001FD9F7EcF5aC206F499fB93b6728Dca319165")
        .call({ from: TestAccount.TEAM.address })
    ).toEqual("1");

    expect(
      await millionOnMarsNFT.methods
        .totalSupply()
        .call({ from: TestAccount.TEAM.address })
    ).toEqual("2");
  });

  it("does not let user trade MoM NFT directly", async () => {
    const web3 = new Web3(
      new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
    );

    const { millionOnMarsNFT } = await deployMoMContracts(web3);

    millionOnMarsNFT.methods
      .addGameRole(TestAccount.TEAM.address)
      .call({ from: TestAccount.TEAM.address });

    const result = millionOnMarsNFT.methods
      .transferFrom(
        TestAccount.TEAM.address,
        "0x5001FD9F7EcF5aC206F499fB93b6728Dca319165",
        1
      )
      .call({ from: TestAccount.TEAM.address });

    await expect(
      result.catch((e: Error) => Promise.reject(e.message))
    ).rejects.toContain("MoMNFT: You can not transfer this");
  });

  it("does not trade for Sunflower Land item if they don't have MoM NFT", async () => {
    const web3 = new Web3(
      new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
    );

    const { millionOnMarsNFT } = await deployMoMContracts(web3);

    const result = millionOnMarsNFT.methods
      .trade(1)
      .call({ from: TestAccount.TEAM.address });

    await expect(
      result.catch((e: Error) => Promise.reject(e.message))
    ).rejects.toContain("MoMNFT: Player does not have NFT to trade");
  });

  it("trades for Sunflower Land item", () => {});
});
