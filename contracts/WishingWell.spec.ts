import Web3 from "web3";
import { soliditySha3 } from "web3-utils";
import {
  deploySFLContracts,
  deployWishingWellContracts,
  gasLimit,
  TestAccount,
} from "./test-support";

/**
 * For testing we use the SunflowerLandToken since it is ERC20
 * In production, the token will be the SFL/MATIC ERC20 pair
 */
describe("Wishing Well contract", () => {
  // Reusable function that approves and then throws in
  const throwIn = async (
    amount: number,
    liquidityToken: any,
    wishingWell: any,
    web3: any,
    address = TestAccount.PLAYER.address
  ) => {
    await liquidityToken.methods.mint(address, 1000).send({
      from: address,
      gasPrice: await web3.eth.getGasPrice(),
      gas: gasLimit,
    });

    await liquidityToken.methods
      .approve(wishingWell.options.address, amount)
      .send({
        from: address,
        gasPrice: await web3.eth.getGasPrice(),
        gas: gasLimit,
      });

    await wishingWell.methods.throwTokens(amount).send({
      from: address,
      gasPrice: await web3.eth.getGasPrice(),
      gas: gasLimit,
    });
  };

  function increaseTime(web3: any, seconds: number) {
    const id = Date.now();
    return new Promise((resolve, reject) => {
      web3.currentProvider.send(
        {
          jsonrpc: "2.0",
          method: "evm_increaseTime",
          params: [seconds],
          id: id,
        },
        (err1) => {
          if (err1) return reject(err1);

          web3.currentProvider.send(
            {
              jsonrpc: "2.0",
              method: "evm_mine",
              id: id + 1,
            },
            (err2, res) => {
              return err2 ? reject(err2) : resolve(res);
            }
          );
        }
      );
    });
  }

  it("does not throw tokens a user does not have", async () => {
    const web3 = new Web3(
      new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
    );
    const { wishingWell } = await deployWishingWellContracts(web3);

    const result = wishingWell.methods.throwTokens(100000).send({
      from: TestAccount.PLAYER.address,
      gasPrice: await web3.eth.getGasPrice(),
      gas: gasLimit,
    });

    await expect(
      result.catch((e: Error) => Promise.reject(e.message))
    ).rejects.toContain("ERC20: transfer amount exceeds balance");
  });

  it("throws tokens in", async () => {
    const web3 = new Web3(
      new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
    );
    const { wishingWell, liquidityTestToken } =
      await deployWishingWellContracts(web3);

    await throwIn(300, liquidityTestToken, wishingWell, web3);

    let tokenBalance = await liquidityTestToken.methods
      .balanceOf(TestAccount.PLAYER.address)
      .call({ from: TestAccount.PLAYER.address });

    expect(tokenBalance).toEqual("700");

    let wishingWellBalance = await wishingWell.methods
      .balanceOf(TestAccount.PLAYER.address)
      .call({ from: TestAccount.PLAYER.address });

    expect(wishingWellBalance).toEqual("300");
  });

  it("waits 3 days before collecting", async () => {
    const web3 = new Web3(
      new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
    );
    const { wishingWell, liquidityTestToken } =
      await deployWishingWellContracts(web3);

    await throwIn(300, liquidityTestToken, wishingWell, web3);

    const result = wishingWell.methods.collectFromWell().send({
      from: TestAccount.PLAYER.address,
      gasPrice: await web3.eth.getGasPrice(),
      gas: gasLimit,
    });

    await expect(
      result.catch((e: Error) => Promise.reject(e.message))
    ).rejects.toContain("WishingWell: Good things come for those who wait");
  });

  it("ensures a user has tokens", () => {});

  it("collects nothing", async () => {
    const web3 = new Web3(
      new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
    );
    const { wishingWell, liquidityTestToken } =
      await deployWishingWellContracts(web3);

    await throwIn(300, liquidityTestToken, wishingWell, web3);

    await increaseTime(web3, 3 * 24 * 60 * 60 + 1);

    const result = wishingWell.methods.collectFromWell().send({
      from: TestAccount.PLAYER.address,
      gasPrice: await web3.eth.getGasPrice(),
      gas: gasLimit,
    });

    await expect(
      result.catch((e: Error) => Promise.reject(e.message))
    ).rejects.toContain("WishingWell: Nothing today");
  });

  it("collects after 3 days", async () => {
    const web3 = new Web3(
      new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
    );
    const { wishingWell, liquidityTestToken, token } =
      await deployWishingWellContracts(web3);

    await throwIn(300, liquidityTestToken, wishingWell, web3);

    // Put some tokens into the well
    await token.methods.gameMint(wishingWell.options.address, 500).send({
      from: TestAccount.TEAM.address,
      gasPrice: await web3.eth.getGasPrice(),
      gas: gasLimit,
    });

    await increaseTime(web3, 3 * 24 * 60 * 60 + 1);

    await wishingWell.methods.collectFromWell().send({
      from: TestAccount.PLAYER.address,
      gasPrice: await web3.eth.getGasPrice(),
      gas: gasLimit,
    });

    const tokenBalance = await token.methods
      .balanceOf(TestAccount.PLAYER.address)
      .call({ from: TestAccount.PLAYER.address });

    expect(tokenBalance).toBe("500");

    const wishingWillBalance = await token.methods
      .balanceOf(wishingWell.options.address)
      .call({ from: TestAccount.PLAYER.address });
    expect(wishingWillBalance).toBe("0");
  });

  it("rewards a user proportionally", async () => {
    const web3 = new Web3(
      new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
    );
    const { wishingWell, liquidityTestToken, token } =
      await deployWishingWellContracts(web3);

    await throwIn(300, liquidityTestToken, wishingWell, web3);

    await throwIn(
      200,
      liquidityTestToken,
      wishingWell,
      web3,
      TestAccount.CHARITY.address
    );

    // Put some tokens into the well
    await token.methods.gameMint(wishingWell.options.address, 1000).send({
      from: TestAccount.TEAM.address,
      gasPrice: await web3.eth.getGasPrice(),
      gas: gasLimit,
    });

    await increaseTime(web3, 3 * 24 * 60 * 60 + 1);

    await wishingWell.methods.collectFromWell().send({
      from: TestAccount.PLAYER.address,
      gasPrice: await web3.eth.getGasPrice(),
      gas: gasLimit,
    });

    const userBalance = await token.methods
      .balanceOf(TestAccount.PLAYER.address)
      .call({ from: TestAccount.PLAYER.address });

    let wishingWillBalance = await token.methods
      .balanceOf(wishingWell.options.address)
      .call({ from: TestAccount.PLAYER.address });

    expect(userBalance).toBe("600");
    expect(wishingWillBalance).toBe("400");

    await wishingWell.methods.collectFromWell().send({
      from: TestAccount.CHARITY.address,
      gasPrice: await web3.eth.getGasPrice(),
      gas: gasLimit,
    });

    const secondUserBalance = await token.methods
      .balanceOf(TestAccount.CHARITY.address)
      .call({ from: TestAccount.CHARITY.address });

    wishingWillBalance = await token.methods
      .balanceOf(wishingWell.options.address)
      .call({ from: TestAccount.PLAYER.address });

    // Remember, it is a percentage of what is left ;)
    expect(secondUserBalance).toBe("160");
    expect(wishingWillBalance).toBe("240");
  });

  it("rewards a user over multiple days", async () => {
    const web3 = new Web3(
      new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
    );
    const { wishingWell, liquidityTestToken, token } =
      await deployWishingWellContracts(web3);

    await throwIn(200, liquidityTestToken, wishingWell, web3);

    // Put some tokens into the well
    await token.methods.gameMint(wishingWell.options.address, 1000).send({
      from: TestAccount.TEAM.address,
      gasPrice: await web3.eth.getGasPrice(),
      gas: gasLimit,
    });

    await increaseTime(web3, 3 * 24 * 60 * 60 + 1);

    await wishingWell.methods.collectFromWell().send({
      from: TestAccount.PLAYER.address,
      gasPrice: await web3.eth.getGasPrice(),
      gas: gasLimit,
    });

    let userBalance = await token.methods
      .balanceOf(TestAccount.PLAYER.address)
      .call({ from: TestAccount.PLAYER.address });

    expect(userBalance).toBe("1000");

    // Put some more tokens into the well
    await token.methods.gameMint(wishingWell.options.address, 500).send({
      from: TestAccount.TEAM.address,
      gasPrice: await web3.eth.getGasPrice(),
      gas: gasLimit,
    });

    // Try pull out too fast
    const result = wishingWell.methods.collectFromWell().send({
      from: TestAccount.PLAYER.address,
      gasPrice: await web3.eth.getGasPrice(),
      gas: gasLimit,
    });

    await expect(
      result.catch((e: Error) => Promise.reject(e.message))
    ).rejects.toContain("WishingWell: Good things come for those who wait");

    await increaseTime(web3, 3 * 24 * 60 * 60 + 1);

    await wishingWell.methods.collectFromWell().send({
      from: TestAccount.PLAYER.address,
      gasPrice: await web3.eth.getGasPrice(),
      gas: gasLimit,
    });

    userBalance = await token.methods
      .balanceOf(TestAccount.PLAYER.address)
      .call({ from: TestAccount.PLAYER.address });

    expect(userBalance).toBe("1500");
  });

  it("ensure tokens have been deposited for at least 3 days before taking out", async () => {
    const web3 = new Web3(
      new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
    );
    const { wishingWell, liquidityTestToken } =
      await deployWishingWellContracts(web3);

    await throwIn(300, liquidityTestToken, wishingWell, web3);

    const result = wishingWell.methods.takeOut(300).send({
      from: TestAccount.PLAYER.address,
      gasPrice: await web3.eth.getGasPrice(),
      gas: gasLimit,
    });

    await expect(
      result.catch((e: Error) => Promise.reject(e.message))
    ).rejects.toContain(
      "WishingWell: Wait 3 days after throwing in or collecting"
    );
  });

  it("ensures user hasn't collected rewards within 3 days of depositing", async () => {
    const web3 = new Web3(
      new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
    );
    const { wishingWell, liquidityTestToken, token } =
      await deployWishingWellContracts(web3);

    await throwIn(300, liquidityTestToken, wishingWell, web3);

    // Put some tokens into the well
    await token.methods.gameMint(wishingWell.options.address, 500).send({
      from: TestAccount.TEAM.address,
      gasPrice: await web3.eth.getGasPrice(),
      gas: gasLimit,
    });

    await increaseTime(web3, 3 * 24 * 60 * 60 + 1);

    await wishingWell.methods.collectFromWell().send({
      from: TestAccount.PLAYER.address,
      gasPrice: await web3.eth.getGasPrice(),
      gas: gasLimit,
    });

    const result = wishingWell.methods.takeOut(300).send({
      from: TestAccount.PLAYER.address,
      gasPrice: await web3.eth.getGasPrice(),
      gas: gasLimit,
    });

    await expect(
      result.catch((e: Error) => Promise.reject(e.message))
    ).rejects.toContain(
      "WishingWell: Wait 3 days after throwing in or collecting"
    );
  });

  it("does not allow a user to pull out more than they have", async () => {
    const web3 = new Web3(
      new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
    );

    const { wishingWell, liquidityTestToken, token } =
      await deployWishingWellContracts(web3);

    await throwIn(300, liquidityTestToken, wishingWell, web3);

    // Some other player throws in as well
    await throwIn(
      500,
      liquidityTestToken,
      wishingWell,
      web3,
      TestAccount.CHARITY.address
    );

    await increaseTime(web3, 3 * 24 * 60 * 60 + 1);

    const result = wishingWell.methods.takeOut(500).send({
      from: TestAccount.PLAYER.address,
      gasPrice: await web3.eth.getGasPrice(),
      gas: gasLimit,
    });

    await expect(
      result.catch((e: Error) => Promise.reject(e.message))
    ).rejects.toContain("ERC20: burn amount exceeds balance");
  });

  it("pulls out tokens from well", async () => {
    const web3 = new Web3(
      new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
    );

    const { wishingWell, liquidityTestToken, token } =
      await deployWishingWellContracts(web3);

    await throwIn(300, liquidityTestToken, wishingWell, web3);

    // Some other player throws in as well
    await throwIn(
      500,
      liquidityTestToken,
      wishingWell,
      web3,
      TestAccount.CHARITY.address
    );

    await increaseTime(web3, 3 * 24 * 60 * 60 + 1);

    await wishingWell.methods.takeOut(200).send({
      from: TestAccount.PLAYER.address,
      gasPrice: await web3.eth.getGasPrice(),
      gas: gasLimit,
    });

    let tokenBalance = await liquidityTestToken.methods
      .balanceOf(TestAccount.PLAYER.address)
      .call({ from: TestAccount.PLAYER.address });

    expect(tokenBalance).toEqual("900");
  });

  it("cannot collect rewards after pulling out tokens", async () => {
    const web3 = new Web3(
      new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
    );

    const { wishingWell, liquidityTestToken, token } =
      await deployWishingWellContracts(web3);

    await throwIn(300, liquidityTestToken, wishingWell, web3);

    // Some other player throws in as well
    await throwIn(
      500,
      liquidityTestToken,
      wishingWell,
      web3,
      TestAccount.CHARITY.address
    );

    await increaseTime(web3, 3 * 24 * 60 * 60 + 1);

    await wishingWell.methods.takeOut(200).send({
      from: TestAccount.PLAYER.address,
      gasPrice: await web3.eth.getGasPrice(),
      gas: gasLimit,
    });

    let tokenBalance = await liquidityTestToken.methods
      .balanceOf(TestAccount.PLAYER.address)
      .call({ from: TestAccount.PLAYER.address });

    expect(tokenBalance).toEqual("900");

    const result = wishingWell.methods.takeOut(300).send({
      from: TestAccount.PLAYER.address,
      gasPrice: await web3.eth.getGasPrice(),
      gas: gasLimit,
    });

    await expect(
      result.catch((e: Error) => Promise.reject(e.message))
    ).rejects.toContain(
      "WishingWell: Wait 3 days after throwing in or collecting"
    );
  });
});
