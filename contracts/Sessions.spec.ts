import Web3 from "web3";
import { soliditySha3 } from "web3-utils";
import { deploySFLContracts, gasLimit, TestAccount } from "./test-support";

describe("Session contract", () => {
  // 10 seconds in the future
  const validDeadline = Math.floor(Date.now() / 1000 + 100);

  describe("sync", () => {
    it("requires the transaction is submitted before the deadline", async () => {
      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.ETH_NETWORK!)
      );
      const { session } = await deploySFLContracts(web3);

      const sessionId = web3.utils.keccak256("0");

      // 10 seconds to late :(
      const deadline = Math.floor(Date.now() / 1000 - 10);

      const signature = await sign(web3, {
        sessionId,
        deadline,
        sender: TestAccount.PLAYER.address,
        farmId: 1,
        mintIds: [],
        mintAmounts: [],
        burnIds: [],
        burnAmounts: [],
        tokens: 10,
      });

      const result = session.methods
        .sync(signature, sessionId, deadline, 1, [], [], [], [], -10)
        .send({
          from: TestAccount.PLAYER.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
        });

      await expect(
        result.catch((e: Error) => Promise.reject(e.message))
      ).rejects.toContain("SunflowerLand: Deadline Passed");
    });

    it("requires the session ID matches", async () => {
      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.ETH_NETWORK!)
      );
      const { session } = await deploySFLContracts(web3);

      const sessionId = web3.utils.keccak256("randomID");

      const signature = await sign(web3, {
        sessionId,
        deadline: validDeadline,
        sender: TestAccount.PLAYER.address,
        farmId: 1,
        mintIds: [],
        mintAmounts: [],
        burnIds: [],
        burnAmounts: [],
        tokens: 10,
      });

      const result = session.methods
        .sync(signature, sessionId, validDeadline, 1, [], [], [], [], 10)
        .send({
          from: TestAccount.PLAYER.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
        });

      await expect(
        result.catch((e: Error) => Promise.reject(e.message))
      ).rejects.toContain("SunflowerLand: Session has changed");
    });

    it("requires the sender owns the farm", async () => {
      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.ETH_NETWORK!)
      );
      const { session, farm } = await deploySFLContracts(web3);

      // Mint it to the team address (not the player)
      await farm.methods.mint(TestAccount.TEAM.address).send({
        from: TestAccount.TEAM.address,
        gasPrice: await web3.eth.getGasPrice(),
        gas: gasLimit,
      });

      const sessionId = await session.methods
        .getSessionId(1)
        .call({ from: TestAccount.PLAYER.address });

      const signature = await sign(web3, {
        sessionId,
        deadline: validDeadline,
        sender: TestAccount.PLAYER.address,
        farmId: 1,
        mintIds: [],
        mintAmounts: [],
        burnIds: [],
        burnAmounts: [],
        tokens: 10,
      });

      const result = session.methods
        .sync(signature, sessionId, validDeadline, 1, [], [], [], [], 10)
        .send({
          from: TestAccount.PLAYER.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
        });

      await expect(
        result.catch((e: Error) => Promise.reject(e.message))
      ).rejects.toContain("SunflowerLand: You do not own this farm");
    });

    it("mints items for a farm", async () => {
      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.ETH_NETWORK!)
      );
      const { session, farm, inventory, token } = await deploySFLContracts(
        web3
      );

      await farm.methods.mint(TestAccount.PLAYER.address).send({
        from: TestAccount.TEAM.address,
        gasPrice: await web3.eth.getGasPrice(),
        gas: gasLimit,
      });

      const farmNFT = await farm.methods
        .getFarm(1)
        .call({ from: TestAccount.PLAYER.address });

      let tokenBalance = await token.methods
        .balanceOf(farmNFT.account)
        .call({ from: TestAccount.PLAYER.address });

      expect(tokenBalance).toEqual("0");

      let inventoryBalance = await inventory.methods
        .balanceOf(farmNFT.account, 1)
        .call({ from: TestAccount.PLAYER.address });

      expect(inventoryBalance).toEqual("0");

      const sessionId = await session.methods
        .getSessionId(1)
        .call({ from: TestAccount.PLAYER.address });

      const signature = await sign(web3, {
        sessionId,
        deadline: validDeadline,
        sender: TestAccount.PLAYER.address,
        farmId: 1,
        mintIds: [1],
        mintAmounts: [500],
        burnIds: [],
        burnAmounts: [],
        tokens: 60,
      });

      await session.methods
        .sync(signature, sessionId, validDeadline, 1, [1], [500], [], [], 60)
        .send({
          from: TestAccount.PLAYER.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
        });

      tokenBalance = await token.methods
        .balanceOf(farmNFT.account)
        .call({ from: TestAccount.PLAYER.address });

      expect(tokenBalance).toEqual("60");

      inventoryBalance = await inventory.methods
        .balanceOf(farmNFT.account, 1)
        .call({ from: TestAccount.PLAYER.address });

      expect(inventoryBalance).toEqual("500");
    });

    it("requires the mint IDs are in the signature", async () => {
      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.ETH_NETWORK!)
      );
      const { session, farm } = await deploySFLContracts(web3);

      // Mint it to the team address (not the player)
      await farm.methods.mint(TestAccount.TEAM.address).send({
        from: TestAccount.TEAM.address,
        gasPrice: await web3.eth.getGasPrice(),
        gas: gasLimit,
      });

      const sessionId = await session.methods
        .getSessionId(1)
        .call({ from: TestAccount.PLAYER.address });

      const signature = await sign(web3, {
        sessionId,
        deadline: validDeadline,
        sender: TestAccount.PLAYER.address,
        farmId: 1,
        mintIds: [],
        mintAmounts: [],
        burnIds: [],
        burnAmounts: [],
        // Only 10 tokens
        tokens: 10,
      });

      const result = session.methods
        .sync(
          signature,
          sessionId,
          validDeadline,
          1,
          [],
          [],
          [],
          [],
          // Something dodgy!
          65000000000000
        )
        .send({
          from: TestAccount.PLAYER.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
        });

      await expect(
        result.catch((e: Error) => Promise.reject(e.message))
      ).rejects.toContain("SunflowerLand: Unauthorised");
    });

    it("burns items for a farm", async () => {
      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.ETH_NETWORK!)
      );
      const { session, farm, inventory, token } = await deploySFLContracts(
        web3
      );

      await farm.methods.mint(TestAccount.PLAYER.address).send({
        from: TestAccount.TEAM.address,
        gasPrice: await web3.eth.getGasPrice(),
        gas: gasLimit,
      });

      const farmNFT = await farm.methods
        .getFarm(1)
        .call({ from: TestAccount.PLAYER.address });

      // Mint some items
      await token.methods.gameMint(farmNFT.account, 200).send({
        from: TestAccount.TEAM.address,
        gasPrice: await web3.eth.getGasPrice(),
        gas: gasLimit,
      });

      await inventory.methods
        .gameMint(farmNFT.account, [1], [500], web3.utils.keccak256("randomID"))
        .send({
          from: TestAccount.TEAM.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
        });

      const sessionId = await session.methods
        .getSessionId(1)
        .call({ from: TestAccount.PLAYER.address });

      const signature = await sign(web3, {
        sessionId,
        deadline: validDeadline,
        sender: TestAccount.PLAYER.address,
        farmId: 1,
        mintIds: [],
        mintAmounts: [],
        burnIds: [1],
        burnAmounts: [300],
        tokens: -50,
      });

      await session.methods
        .sync(signature, sessionId, validDeadline, 1, [], [], [1], [300], -50)
        .send({
          from: TestAccount.PLAYER.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
        });

      const tokenBalance = await token.methods
        .balanceOf(farmNFT.account)
        .call({ from: TestAccount.PLAYER.address });

      expect(tokenBalance).toEqual("150");

      const inventoryBalance = await inventory.methods
        .balanceOf(farmNFT.account, 1)
        .call({ from: TestAccount.PLAYER.address });

      expect(inventoryBalance).toEqual("200");
    });

    it("requires the burn IDs are in the signature", async () => {
      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.ETH_NETWORK!)
      );
      const { session, farm } = await deploySFLContracts(web3);

      // Mint it to the team address (not the player)
      await farm.methods.mint(TestAccount.TEAM.address).send({
        from: TestAccount.TEAM.address,
        gasPrice: await web3.eth.getGasPrice(),
        gas: gasLimit,
      });

      const sessionId = await session.methods
        .getSessionId(1)
        .call({ from: TestAccount.PLAYER.address });

      const signature = await sign(web3, {
        sessionId,
        deadline: validDeadline,
        sender: TestAccount.PLAYER.address,
        farmId: 1,
        mintIds: [],
        mintAmounts: [],
        burnIds: [1],
        burnAmounts: [20000000],
        tokens: 0,
      });

      const result = session.methods
        .sync(
          signature,
          sessionId,
          validDeadline,
          1,
          [],
          [],
          [1],
          // Something dodgy!
          [5],
          0
        )
        .send({
          from: TestAccount.PLAYER.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
        });

      await expect(
        result.catch((e: Error) => Promise.reject(e.message))
      ).rejects.toContain("SunflowerLand: Unauthorised");
    });

    it("requires a new the session ID", async () => {
      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.ETH_NETWORK!)
      );
      const { session, farm, inventory, token } = await deploySFLContracts(
        web3
      );

      await farm.methods.mint(TestAccount.PLAYER.address).send({
        from: TestAccount.TEAM.address,
        gasPrice: await web3.eth.getGasPrice(),
        gas: gasLimit,
      });

      const farmNFT = await farm.methods
        .getFarm(1)
        .call({ from: TestAccount.PLAYER.address });

      const sessionId = await session.methods
        .getSessionId(1)
        .call({ from: TestAccount.PLAYER.address });

      const signature = await sign(web3, {
        sessionId,
        deadline: validDeadline,
        sender: TestAccount.PLAYER.address,
        farmId: 1,
        mintIds: [1],
        mintAmounts: [500],
        burnIds: [],
        burnAmounts: [],
        tokens: 60,
      });

      await session.methods
        .sync(signature, sessionId, validDeadline, 1, [1], [500], [], [], 60)
        .send({
          from: TestAccount.PLAYER.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
        });

      // Try again with same session ID
      const result = session.methods
        .sync(signature, sessionId, validDeadline, 1, [1], [200], [], [], 99)
        .send({
          from: TestAccount.PLAYER.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
        });

      await expect(
        result.catch((e: Error) => Promise.reject(e.message))
      ).rejects.toContain("SunflowerLand: Session has changed");

      const newSessionId = await session.methods
        .getSessionId(1)
        .call({ from: TestAccount.PLAYER.address });

      const newSignature = await sign(web3, {
        sessionId: newSessionId,
        deadline: validDeadline,
        sender: TestAccount.PLAYER.address,
        farmId: 1,
        mintIds: [1],
        mintAmounts: [500],
        burnIds: [],
        burnAmounts: [],
        tokens: 60,
      });

      await session.methods
        .sync(
          newSignature,
          newSessionId,
          validDeadline,
          1,
          [1],
          [500],
          [],
          [],
          60
        )
        .send({
          from: TestAccount.PLAYER.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
        });

      const tokenBalance = await token.methods
        .balanceOf(farmNFT.account)
        .call({ from: TestAccount.PLAYER.address });

      expect(tokenBalance).toEqual("120");
    });
  });

  type SyncArgs = {
    sessionId: string;
    deadline: number;
    sender: string;
    farmId: number;
    mintIds: number[];
    mintAmounts: number[];
    burnIds: number[];
    burnAmounts: number[];
    tokens: number;
  };

  function encodeSyncFunction({
    sessionId,
    deadline,
    sender,
    farmId,
    mintIds,
    mintAmounts,
    burnIds,
    burnAmounts,
    tokens,
  }: SyncArgs) {
    return soliditySha3(
      {
        type: "bytes32",
        value: sessionId,
      },
      {
        type: "uint256",
        value: deadline.toString(),
      },
      {
        type: "address",
        value: sender,
      },
      {
        type: "uint256",
        value: farmId.toString(),
      },
      {
        type: "uint256[]",
        value: mintIds as any,
      },
      {
        type: "uint256[]",
        value: mintAmounts as any,
      },
      {
        type: "uint256[]",
        value: burnIds as any,
      },
      {
        type: "uint256[]",
        value: burnAmounts as any,
      },
      {
        type: "int256",
        value: tokens as any,
      }
    );
  }

  async function sign(web3: Web3, args: SyncArgs) {
    const sha = encodeSyncFunction(args);
    const { signature } = await web3.eth.accounts.sign(
      sha,
      TestAccount.TEAM.privateKey
    );

    return signature;
  }
});
