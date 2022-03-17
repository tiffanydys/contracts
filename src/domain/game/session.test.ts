import Decimal from "decimal.js-light";
import { toWei } from "web3-utils";
import {
  createMock,
  createSessionMock,
  getFarmMock,
} from "../../repository/__mocks__/db";
import {
  loadNFTFarmMock,
  loadV1FarmMock,
  loadV1BalanceMock,
  loadBalanceMock,
  loadInventoryMock,
  loadSessionMock,
} from "../../services/web3/__mocks__/polygon";
import { getMigrationEventMock } from "../../repository/__mocks__/eventStore";
import {
  INITIAL_FIELDS,
  INITIAL_GOLD,
  INITIAL_IRON,
  INITIAL_STOCK,
  INITIAL_STONE,
  INITIAL_TREES,
} from "./lib/constants";
import { fetchOnChainData, startSession } from "./session";

const initialStockJSON = {
  "Cauliflower Seed": "80",
  "Iron Pickaxe": "5",
  "Parsnip Seed": "40",
  Pickaxe: "30",
  "Potato Seed": "200",
  "Pumpkin Seed": "100",
  "Stone Pickaxe": "10",
  "Sunflower Seed": "400",
  Axe: "50",
  "Beetroot Seed": "80",
  "Cabbage Seed": "90",
  "Carrot Seed": "100",
  "Pumpkin Soup": "1",
  "Radish Seed": "40",
  "Roasted Cauliflower": "1",
  Sauerkraut: "1",
};

const initialTreeJSON = {
  0: {
    wood: "3",
    choppedAt: 0,
  },
  1: {
    wood: "4",
    choppedAt: 0,
  },
  2: {
    wood: "5",
    choppedAt: 0,
  },
  3: {
    wood: "5",
    choppedAt: 0,
  },
  4: {
    wood: "3",
    choppedAt: 0,
  },
};

const initialStoneJson = {
  0: {
    amount: "2",
    minedAt: 0,
  },
  1: {
    amount: "3",
    minedAt: 0,
  },
  2: {
    amount: "4",
    minedAt: 0,
  },
};

const initialIronJson = {
  0: {
    amount: "2",
    minedAt: 0,
  },
  1: {
    amount: "3",
    minedAt: 0,
  },
};

const initialGoldJson = {
  0: {
    amount: "2",
    minedAt: 0,
  },
};

describe("game", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("startSession", () => {
    const sender = "0x71ce61c1a29959797493f882F01961567bE56f6E";

    beforeEach(() => {
      loadNFTFarmMock.mockReturnValue({
        owner: sender,
        account: "0x71ce61c1a29959797493f882F01961567bE56f6E",
        id: 13,
      });
    });

    it("throws an error if user does not own the farm", async () => {
      loadNFTFarmMock.mockReturnValue({
        owner: "0xD755984F4A5D885919451eD25e1a854daa5086C9",
        account: "0x29d7d1dd5b6f9c864d9db560d72a247c178ae86b",
      });

      const result = startSession({
        farmId: 13,
        sender: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
        sessionId:
          "0x0000000000000000000000000000000000000000000000000000000000000000",
      });

      await expect(
        result.catch((e: Error) => Promise.reject(e.message))
      ).rejects.toContain("You do not own this farm");
    });

    it("creates a farm if no session exists", async () => {
      getFarmMock.mockReturnValueOnce(null);

      // This should not come through
      loadV1FarmMock.mockReturnValueOnce([]);
      loadV1BalanceMock.mockReturnValueOnce("60000000000000000000");

      const { gameState: session } = await startSession({
        farmId: 13,
        sender,
        sessionId:
          "0x0000000000000000000000000000000000000000000000000000000000000000",
      });

      const gameState = {
        balance: "60",
        fields: INITIAL_FIELDS,
        inventory: {},
        stock: initialStockJSON,
        trees: initialTreeJSON,
        stones: initialStoneJson,
        iron: initialIronJson,
        gold: initialGoldJson,
        skills: {
          farming: "0",
          gathering: "0",
        },
      };

      // Initial farm values
      expect(createMock).toHaveBeenCalledWith({
        createdAt: expect.any(String),
        gameState,
        id: 13,
        createdBy: "0x71ce61c1a29959797493f882F01961567bE56f6E",
        updatedBy: "0x71ce61c1a29959797493f882F01961567bE56f6E",
        previousGameState: {
          balance: "0",
          skills: {
            farming: "0",
            gathering: "0",
          },
          fields: INITIAL_FIELDS,
          inventory: {},
          stock: initialStockJSON,
          trees: initialTreeJSON,
          stones: initialStoneJson,
          iron: initialIronJson,
          gold: initialGoldJson,
        },
        sessionId:
          "0x0000000000000000000000000000000000000000000000000000000000000000",
        updatedAt: expect.any(String),
        verifyAt: expect.any(String),
        flaggedCount: 0,
        version: 1,
      });

      expect(session).toEqual({
        balance: new Decimal(60),
        fields: INITIAL_FIELDS,
        inventory: {},
        stock: INITIAL_STOCK,
        trees: INITIAL_TREES,
        stones: INITIAL_STONE,
        iron: INITIAL_IRON,
        gold: INITIAL_GOLD,
        skills: {
          farming: new Decimal(0),
          gathering: new Decimal(0),
        },
      });
    });

    it("does not migrate if farm already exists", async () => {
      // This should not come through
      loadV1BalanceMock.mockReturnValueOnce("60000000000000000000");
      getMigrationEventMock.mockReturnValue({ balance: "1" });

      await startSession({
        farmId: 13,
        sender,
        sessionId:
          "0x0000000000000000000000000000000000000000000000000000000000000000",
      });

      // Initial farm values
      expect(createMock).toHaveBeenCalledWith({
        createdAt: expect.any(String),
        gameState: {
          balance: "0",
          fields: INITIAL_FIELDS,
          inventory: {},
          stock: initialStockJSON,
          trees: initialTreeJSON,
          stones: initialStoneJson,
          iron: initialIronJson,
          gold: initialGoldJson,
          skills: {
            farming: "0",
            gathering: "0",
          },
        },
        id: 13,
        createdBy: "0x71ce61c1a29959797493f882F01961567bE56f6E",
        updatedBy: "0x71ce61c1a29959797493f882F01961567bE56f6E",
        previousGameState: {
          balance: "0",
          fields: INITIAL_FIELDS,
          inventory: {},
          stock: initialStockJSON,
          trees: initialTreeJSON,
          stones: initialStoneJson,
          iron: initialIronJson,
          gold: initialGoldJson,
          skills: {
            farming: "0",
            gathering: "0",
          },
        },
        sessionId:
          "0x0000000000000000000000000000000000000000000000000000000000000000",
        updatedAt: expect.any(String),
        verifyAt: expect.any(String),
        version: 1,
        flaggedCount: 0,
      });
    });

    it("loads data from on chain if session ID is different", async () => {
      // Avoid migrations
      process.env.NETWORK = "mainnet";

      getFarmMock.mockReturnValueOnce({
        id: 13,
        session:
          "0x0000000000000000000000000000000000000000000000000000000000000000",
        gameState: {
          fields: {},
          inventory: {},
          stock: {},
          balance: "20",
          skills: {
            farming: "16",
            gathering: "10.5",
          },
          trees: initialTreeJSON,
          stones: initialStoneJson,
          iron: initialIronJson,
          gold: initialGoldJson,
        },
        updatedBy: sender,
        version: 3,
      });

      loadBalanceMock.mockReturnValue("120000000000000000000");
      loadInventoryMock.mockReturnValue([toWei("1"), toWei("2")]);
      loadSessionMock.mockReturnValue("0x123");

      const { gameState: session } = await startSession({
        farmId: 13,
        sender,
        // Different sessionID
        sessionId: "0x123",
      });

      expect(createSessionMock).toHaveBeenCalledWith({
        id: 13,
        owner: "0x71ce61c1a29959797493f882F01961567bE56f6E",
        session: {
          balance: "120",
          skills: {
            farming: "16",
            gathering: "10.5",
          },
          fields: {},
          inventory: {
            "Potato Seed": "2",
            "Sunflower Seed": "1",
          },
          stock: initialStockJSON,
          trees: initialTreeJSON,
          stones: initialStoneJson,
          iron: initialIronJson,
          gold: initialGoldJson,
        },
        sessionId: "0x123",
        version: 4,
      });

      expect(session).toEqual({
        balance: new Decimal(120),
        skills: {
          farming: new Decimal(16),
          gathering: new Decimal(10.5),
        },
        fields: {},
        inventory: {
          "Potato Seed": new Decimal(2),
          "Sunflower Seed": new Decimal(1),
        },
        stock: INITIAL_STOCK,
        trees: INITIAL_TREES,
        stones: INITIAL_STONE,
        iron: INITIAL_IRON,
        gold: INITIAL_GOLD,
      });
    });
  });

  describe("fetchOnChainData", () => {
    it("throws an error if the session does not match", async () => {
      loadBalanceMock.mockReturnValue(toWei("35"));
      loadInventoryMock.mockReturnValue([]);
      loadSessionMock.mockReturnValue("0xabc");
      loadNFTFarmMock.mockReturnValue({
        owner: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
        account: "0x71ce61c1a29959797493f882F01961567bE56f6E",
        id: 2,
      });

      const result = fetchOnChainData({
        farmId: 13,
        sessionId: "0x123",
        sender: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
        // farm: {
        //   account: "0xD7123601239123",
        //   owner: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
        //   tokenId: 2,
        // },
      });

      await expect(
        result.catch((e: Error) => Promise.reject(e.message))
      ).rejects.toContain("Session ID does not match");
    });

    it("loads balance from on chain", async () => {
      loadBalanceMock.mockReturnValue(toWei("35"));
      loadInventoryMock.mockReturnValue([]);
      loadSessionMock.mockReturnValue("0x123");
      loadNFTFarmMock.mockReturnValue({
        owner: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
        account: "0x71ce61c1a29959797493f882F01961567bE56f6E",
        id: 2,
      });

      const result = await fetchOnChainData({
        farmId: 13,
        sessionId: "0x123",
        sender: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",

        // farm: {
        //   account: "0xD7123601239123",
        //   owner: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
        //   tokenId: 2,
        // },
      });

      expect(result.balance).toEqual(new Decimal("35"));
      expect(result.inventory).toEqual({});
    });

    /**
     * Hardcoded data but we should test every item here
     */
    it("loads inventory from on chain", async () => {
      loadBalanceMock.mockReturnValue(toWei("0"));
      loadInventoryMock.mockReturnValue([
        // Seeds
        toWei("10"),
        toWei("20"),
        toWei("60"),
        toWei("4"),
        toWei("5"),
        toWei("6"),
        toWei("20"),
        toWei("23"),
        toWei("10"),
        toWei("10023"),
        // Crops
        toWei("20"),
        toWei("1"),
        toWei("1"),
        toWei("22"),
        toWei("45"),
        toWei("99"),
        toWei("30"),
        toWei("80"),
        toWei("33"),
        toWei("2022"),
        // Tools
        toWei("2"),
        toWei("30"),
        toWei("45"),
        toWei("1"),
        toWei("340"),
        toWei("20"),
        // Limited items
        "1",
        "1",
        "1",
        "1",
        "1",
        "1",
        "1",
        "1",
        "1",
        "1",
        "1",
        "1",
        "1",
        "1",
        "1",
        "1",
        "1",
        "1",
        // Resources
        toWei("20"),
        toWei("125"),
        toWei("34"),
        toWei("30"),
        toWei("80"),
        toWei("2000"),
      ]);
      loadNFTFarmMock.mockReturnValue({
        owner: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
        account: "0x71ce61c1a29959797493f882F01961567bE56f6E",
        id: 2,
      });
      loadSessionMock.mockReturnValue("0x123");

      const result = await fetchOnChainData({
        farmId: 13,
        sessionId: "0x123",
        sender: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",

        // farm: {
        //   account: "0xD7123601239123",
        //   owner: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
        //   tokenId: 2,
        // },
      });

      expect(result.balance).toEqual(new Decimal(0));
      expect(result.inventory).toEqual({
        Axe: new Decimal("2"),
        Beetroot: new Decimal("99"),
        "Beetroot Seed": new Decimal("6"),
        Cabbage: new Decimal("45"),
        "Cabbage Seed": new Decimal("5"),
        Carrot: new Decimal("22"),
        "Carrot Seed": new Decimal("4"),
        Cauliflower: new Decimal("30"),
        "Cauliflower Seed": new Decimal("20"),
        Chicken: new Decimal("2000"),
        "Chicken Coop": new Decimal("1"),
        "Christmas Tree": new Decimal("1"),
        Egg: new Decimal("80"),
        "Farm Cat": new Decimal("1"),
        "Farm Dog": new Decimal("1"),
        Flour: new Decimal("1"),
        Gnome: new Decimal("1"),
        Gold: new Decimal("30"),
        "Gold Egg": new Decimal("1"),
        "Golden Cauliflower": new Decimal("1"),
        Hammer: new Decimal("340"),
        Iron: new Decimal("34"),
        "Iron Pickaxe": new Decimal("1"),
        Parsnip: new Decimal("80"),
        "Parsnip Seed": new Decimal("23"),
        Pickaxe: new Decimal("30"),
        Potato: new Decimal("1"),
        "Potato Seed": new Decimal("20"),
        "Potato Statue": new Decimal("1"),
        Pumpkin: new Decimal("1"),
        "Pumpkin Seed": new Decimal("60"),
        "Pumpkin Soup": new Decimal("1"),
        Radish: new Decimal("33"),
        "Radish Seed": new Decimal("10"),
        "Roasted Cauliflower": new Decimal("1"),
        Rod: new Decimal("20"),
        Sauerkraut: new Decimal("1"),
        Scarecrow: new Decimal("1"),
        Stone: new Decimal("125"),
        "Stone Pickaxe": new Decimal("45"),
        Sunflower: new Decimal("20"),
        "Sunflower Rock": new Decimal("1"),
        "Sunflower Seed": new Decimal("10"),
        "Sunflower Statue": new Decimal("1"),
        "Sunflower Tombstone": new Decimal("1"),
        Wheat: new Decimal("2022"),
        "Wheat Seed": new Decimal("10023"),
        Wood: new Decimal("20"),
        "Goblin Crown": new Decimal("1"),
        Fountain: new Decimal("1"),
      });
    });

    /**
     * Hardcoded data but we should test every item here
     */
    it("loads basic inventory from chain", async () => {
      loadNFTFarmMock.mockReturnValue({
        owner: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
        account: "0x71ce61c1a29959797493f882F01961567bE56f6E",
        id: 2,
      });
      loadBalanceMock.mockReturnValue(toWei("0"));
      loadInventoryMock.mockReturnValue([
        // Seeds
        toWei("3"),
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        // Crops
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        // Tools
        toWei("0"),
        toWei("0"),
        toWei("0"),
        toWei("0"),
        toWei("0"),
        toWei("0"),
        // Limited items
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        // Resources
        toWei("0"),
        toWei("0"),
        toWei("0"),
        toWei("0"),
        toWei("0"),
        toWei("0"),
      ]);
      loadSessionMock.mockReturnValue("0x123");

      const result = await fetchOnChainData({
        farmId: 13,
        sessionId: "0x123",
        sender: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
      });

      expect(result.balance).toEqual(new Decimal(0));
      expect(result.inventory).toEqual({
        "Sunflower Seed": new Decimal("3"),
      });
    });
  });
});
