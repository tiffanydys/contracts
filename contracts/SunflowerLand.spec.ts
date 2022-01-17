import Web3 from "web3";
import contracts from "../bin/contracts/combined.json";
import { deployContract, gasLimit, TestAccount } from "./test-support";

describe("SunflowerLand contract", () => {
  it("deploys with total supply zero", async function() {
    const web3 = new Web3(new Web3.providers.HttpProvider(process.env.ETH_NETWORK!));
    const game = TestAccount.ACCOUNT_0;

    const { farm } = await deployGameContract(web3, game);

    const farmInitialTotalSupply = await farm.methods.totalSupply().call({ from: game.address });
    expect(farmInitialTotalSupply).toEqual("0");
  });

  it("mints new farm to player account", async () => {
    const web3 = new Web3(new Web3.providers.HttpProvider(process.env.ETH_NETWORK!));
    const game = TestAccount.ACCOUNT_0;
    const charity = TestAccount.ACCOUNT_1;
    const player = TestAccount.ACCOUNT_2;
    const donation = 0;
    const { gameContract, farm } = await deployGameContract(web3, game);

    const signature = await sign(web3, game, charity.address, donation)
    await gameContract.methods.createFarm(signature, charity.address, donation).send({
      from: player.address,
      gasPrice: await web3.eth.getGasPrice(),
      gas: gasLimit
    });

    const farmUpdatedTotalSupply = await farm.methods.totalSupply().call({ from: game.address });
    expect(farmUpdatedTotalSupply).toEqual("1");

    const owner = await farm.methods.ownerOf(1).call({ from: game.address });
    expect(owner).toEqual(player.address);
  });

  async function deployGameContract(web3: Web3, game: TestAccount) {
    const inventory = await deployContract(web3, contracts.contracts["contracts/Inventory.sol:SunflowerLandInventory"], game.address);
    const token = await deployContract(web3, contracts.contracts["contracts/Token.sol:SunflowerLandToken"], game.address);
    const farm = await deployContract(web3, contracts.contracts["contracts/Farm.sol:SunflowerLandFarm"], game.address);
    const gameContract = await deployContract(web3, contracts.contracts["contracts/SunflowerLand.sol:SunflowerLand"], game.address, [
      inventory.options.address,
      token.options.address,
      farm.options.address
    ]);

    await farm.methods.passGameRole(gameContract.options.address).send({ from: game.address });

    return { gameContract, farm, token, inventory };
  }

  async function sign(web3: Web3, game: TestAccount, ...args: any) {
    const txHash = web3.utils.keccak256(web3.utils.encodePacked(...args)!);
    const { signature } = await web3.eth.accounts.sign(txHash, game.privateKey);

    return signature
  }
});
