import Decimal from "decimal.js-light";
import { toWei } from "web3-utils";
import {
  createMock,
  createSessionMock,
  getFarmsMock,
} from "../../repository/__mocks__/db";
import {
  loadNFTFarmMock,
  loadV1FarmMock,
  loadV1BalanceMock,
  loadBalanceMock,
  loadInventoryMock,
} from "../../services/web3/__mocks__/polygon";
import { INITIAL_FIELDS, INITIAL_STOCK } from "./lib/constants";
import { fetchOnChainData, startSession } from "./session";

const initialStockJSON = {
  Axe: "50",
  "Beetroot Seed": "80",
  "Cabbage Seed": "90",
  "Carrot Seed": "100",
  "Cauliflower Seed": "70",
  "Iron Pickaxe": "50",
  "Parsnip Seed": "50",
  Pickaxe: "50",
  "Potato Seed": "300",
  "Pumpkin Seed": "200",
  "Pumpkin Soup": "1",
  "Radish Seed": "40",
  "Roasted Cauliflower": "1",
  Sauerkraut: "1",
  "Stone Pickaxe": "50",
  "Sunflower Seed": "1000",
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
      getFarmsMock.mockReturnValueOnce([]);

      // This should not come through
      loadV1FarmMock.mockReturnValueOnce([]);
      loadV1BalanceMock.mockReturnValueOnce("60000000000000000000");

      const session = await startSession({
        farmId: 13,
        sender,
        sessionId:
          "0x0000000000000000000000000000000000000000000000000000000000000000",
      });

      const gameState = {
        balance: "60",
        fields: INITIAL_FIELDS,
        id: 1,
        inventory: {},
        stock: initialStockJSON,
      };

      // Initial farm values
      expect(createMock).toHaveBeenCalledWith({
        createdAt: expect.any(String),
        gameState,
        id: 13,
        owner: "0x71ce61c1a29959797493f882F01961567bE56f6E",
        previousGameState: {
          balance: "0",
          fields: INITIAL_FIELDS,
          id: 1,
          inventory: {},
          stock: initialStockJSON,
        },
        sessionId:
          "0x0000000000000000000000000000000000000000000000000000000000000000",
        updatedAt: expect.any(String),
      });

      expect(session).toEqual({
        balance: new Decimal(60),
        fields: INITIAL_FIELDS,
        id: 1,
        inventory: {},
        stock: INITIAL_STOCK,
      });
    });

    it("does not migrate if farm already exists", async () => {
      getFarmsMock.mockReturnValueOnce([
        {
          farmId: 13,
        },
      ]);
      // This should not come through
      loadV1BalanceMock.mockReturnValueOnce("60000000000000000000");

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
          id: 1,
          inventory: {},
          stock: initialStockJSON,
        },
        id: 13,
        owner: "0x71ce61c1a29959797493f882F01961567bE56f6E",
        previousGameState: {
          balance: "0",
          fields: INITIAL_FIELDS,
          id: 1,
          inventory: {},
          stock: initialStockJSON,
        },
        sessionId:
          "0x0000000000000000000000000000000000000000000000000000000000000000",
        updatedAt: expect.any(String),
      });
    });

    it("loads data from on chain if session ID is different", async () => {
      // Avoid migrations
      process.env.NETWORK = "mainnet";

      getFarmsMock.mockReturnValueOnce([
        {
          id: 13,
          session:
            "0x0000000000000000000000000000000000000000000000000000000000000000",
          gameState: {
            fields: {},
            inventory: {},
            stock: {},
            balance: "20",
          },
        },
      ]);

      loadBalanceMock.mockReturnValue("120000000000000000000");
      loadInventoryMock.mockReturnValue(["1", "2"]);

      const session = await startSession({
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
          fields: {},
          inventory: {
            "Potato Seed": "2",
            "Sunflower Seed": "1",
          },
          stock: initialStockJSON,
        },
        sessionId: "0x123",
      });

      expect(session).toEqual({
        balance: new Decimal(120),
        fields: {},
        inventory: {
          "Potato Seed": new Decimal(2),
          "Sunflower Seed": new Decimal(1),
        },
        stock: INITIAL_STOCK,
      });
    });
  });

  describe("fetchOnChainData", () => {
    it("loads balance from on chain", async () => {
      loadBalanceMock.mockReturnValue(toWei("35"));
      loadInventoryMock.mockReturnValue([]);

      const result = await fetchOnChainData({
        farmId: 13,
        sender: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
        farm: {
          account: "0xD7123601239123",
          owner: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
          tokenId: 2,
        },
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
        "10",
        "20",
        "60",
        "4",
        "5",
        "6",
        "20",
        "23",
        "10",
        "10023",
        // Crops
        "20",
        "1",
        "1",
        "22",
        "45",
        "99",
        "30",
        "80",
        "33",
        "2022",
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
        // Resources
        toWei("20"),
        toWei("125"),
        toWei("34"),
        toWei("30"),
        toWei("80"),
        toWei("2000"),
      ]);

      const result = await fetchOnChainData({
        farmId: 13,
        sender: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
        farm: {
          account: "0xD7123601239123",
          owner: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
          tokenId: 2,
        },
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
      });
    });

    /**
     * Hardcoded data but we should test every item here
     */
    it("loads basic inventory from chain", async () => {
      loadBalanceMock.mockReturnValue(toWei("0"));
      loadInventoryMock.mockReturnValue([
        // Seeds
        "3",
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

      const result = await fetchOnChainData({
        farmId: 13,
        sender: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
        farm: {
          account: "0xD7123601239123",
          owner: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
          tokenId: 2,
        },
      });

      expect(result.balance).toEqual(new Decimal(0));
      expect(result.inventory).toEqual({
        "Sunflower Seed": new Decimal(3),
      });
    });
  });
});
