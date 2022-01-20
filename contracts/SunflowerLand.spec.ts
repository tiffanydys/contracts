import Web3 from "web3";
import abijson from "../bin/contracts/combined.json";
import { deployContract, gasLimit, TestAccount } from "./test-support";

describe("SunflowerLand contract", () => {
  it("deploys with total supply zero", async function() {
    const web3 = new Web3(new Web3.providers.HttpProvider(process.env.ETH_NETWORK!));

    const { farm } = await deployGameContract(web3);

    expect(await farm.methods.totalSupply().call({ from: TestAccount.TEAM.address })).toEqual("0");
  });

  it("mints new farm to player account", async () => {
    const web3 = new Web3(new Web3.providers.HttpProvider(process.env.ETH_NETWORK!));
    const donation = 0;
    const { game, farm } = await deployGameContract(web3);

    const signature = await sign(web3, TestAccount.CHARITY.address, donation);
    await game.methods.createFarm(signature, TestAccount.CHARITY.address, donation).send({
      from: TestAccount.PLAYER.address,
      gasPrice: await web3.eth.getGasPrice(),
      gas: gasLimit
    });

    expect(await farm.methods.totalSupply().call({ from: TestAccount.TEAM.address })).toEqual("1");
    expect(await farm.methods.ownerOf(1).call({ from: TestAccount.TEAM.address })).toEqual(TestAccount.PLAYER.address);
  });

  it("requires signature charity address to match in order to create a farm", async () => {
    const web3 = new Web3(new Web3.providers.HttpProvider(process.env.ETH_NETWORK!));
    const { game } = await deployGameContract(web3);

    const someOtherAddress = "0x6eF5dBF9902AD320Fe49216D086B2b50AbC9328f";
    const donation = 0;
    const signature = await sign(web3, someOtherAddress, donation);
    const result = game.methods.createFarm(signature, TestAccount.CHARITY.address, donation).send({
      from: TestAccount.PLAYER.address,
      gasPrice: await web3.eth.getGasPrice(),
      gas: gasLimit
    })

    await expect(result.catch((e: Error) => Promise.reject(e.message))).rejects.toContain("SunflowerLand: Unauthorised");
  });

  it("requires signature donation to match in order to create a farm", async () => {
    const web3 = new Web3(new Web3.providers.HttpProvider(process.env.ETH_NETWORK!));
    const { game } = await deployGameContract(web3);

    const someOtherDonation = 1;
    const donation = 0;
    const signature = await sign(web3, TestAccount.CHARITY.address, someOtherDonation);
    const result = game.methods.createFarm(signature, TestAccount.CHARITY.address, donation).send({
      from: TestAccount.PLAYER.address,
      gasPrice: await web3.eth.getGasPrice(),
      gas: gasLimit
    })

    await expect(result.catch((e: Error) => Promise.reject(e.message))).rejects.toContain("SunflowerLand: Unauthorised");
  });

  async function deployGameContract(web3: Web3) {
    const inventory = await deployContract(web3, abijson.contracts["contracts/Inventory.sol:SunflowerLandInventory"], TestAccount.TEAM.address);
    const token = await deployContract(web3, abijson.contracts["contracts/Token.sol:SunflowerLandToken"], TestAccount.TEAM.address);
    const farm = await deployContract(web3, abijson.contracts["contracts/Farm.sol:SunflowerLandFarm"], TestAccount.TEAM.address);
    const game = await deployContract(web3, abijson.contracts["contracts/SunflowerLand.sol:SunflowerLand"], TestAccount.TEAM.address, [
      inventory.options.address,
      token.options.address,
      farm.options.address
    ]);

    await farm.methods.addGameRole(game.options.address).send({ from: TestAccount.TEAM.address });
    await token.methods.addGameRole(game.options.address).send({ from: TestAccount.TEAM.address });
    await inventory.methods.passGameRole(game.options.address).send({ from: TestAccount.TEAM.address });

    return { game, farm, token, inventory };
  }

  async function sign(web3: Web3, ...args: any) {
    const txHash = web3.utils.keccak256(web3.utils.encodePacked(...args)!);
    const { signature } = await web3.eth.accounts.sign(txHash, TestAccount.TEAM.privateKey);

    return signature;
  }
});
