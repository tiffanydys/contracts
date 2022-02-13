import Decimal from "decimal.js-light";
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
import { startSession } from "./session";

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
        fields: {
          "0": {
            name: "Sunflower",
            plantedAt: 0,
          },
          "1": {
            name: "Sunflower",
            plantedAt: 0,
          },
          "10": {
            name: "Cauliflower",
            plantedAt: 0,
          },
          "11": {
            name: "Beetroot",
            plantedAt: 0,
          },
          "16": {
            name: "Parsnip",
            plantedAt: 0,
          },
          "17": {
            name: "Radish",
            plantedAt: 0,
          },
          "2": {
            name: "Sunflower",
            plantedAt: 0,
          },
          "5": {
            name: "Carrot",
            plantedAt: 0,
          },
          "6": {
            name: "Cabbage",
            plantedAt: 0,
          },
        },
        id: 1,
        inventory: {},
        stock: {
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
        },
      };

      // Initial farm values
      expect(createMock).toHaveBeenCalledWith({
        createdAt: expect.any(String),
        gameState,
        id: 13,
        owner: "0x71ce61c1a29959797493f882F01961567bE56f6E",
        previousGameState: {
          balance: "2.99999999999999999",
          fields: {
            "0": {
              name: "Sunflower",
              plantedAt: 0,
            },
            "1": {
              name: "Sunflower",
              plantedAt: 0,
            },
            "10": {
              name: "Cauliflower",
              plantedAt: 0,
            },
            "11": {
              name: "Beetroot",
              plantedAt: 0,
            },
            "16": {
              name: "Parsnip",
              plantedAt: 0,
            },
            "17": {
              name: "Radish",
              plantedAt: 0,
            },
            "2": {
              name: "Sunflower",
              plantedAt: 0,
            },
            "5": {
              name: "Carrot",
              plantedAt: 0,
            },
            "6": {
              name: "Cabbage",
              plantedAt: 0,
            },
          },
          id: 1,
          inventory: {
            "Sunflower Seed": "3",
          },
          stock: {
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
          },
        },
        sessionId:
          "0x0000000000000000000000000000000000000000000000000000000000000000",
        updatedAt: expect.any(String),
      });

      expect(session).toEqual({
        balance: new Decimal(60),
        fields: {
          "0": {
            name: "Sunflower",
            plantedAt: 0,
          },
          "1": {
            name: "Sunflower",
            plantedAt: 0,
          },
          "10": {
            name: "Cauliflower",
            plantedAt: 0,
          },
          "11": {
            name: "Beetroot",
            plantedAt: 0,
          },
          "16": {
            name: "Parsnip",
            plantedAt: 0,
          },
          "17": {
            name: "Radish",
            plantedAt: 0,
          },
          "2": {
            name: "Sunflower",
            plantedAt: 0,
          },
          "5": {
            name: "Carrot",
            plantedAt: 0,
          },
          "6": {
            name: "Cabbage",
            plantedAt: 0,
          },
        },
        id: 1,
        inventory: {},
        stock: {
          Axe: new Decimal("50"),
          "Beetroot Seed": new Decimal("80"),
          "Cabbage Seed": new Decimal("90"),
          "Carrot Seed": new Decimal("100"),
          "Cauliflower Seed": new Decimal("70"),
          "Iron Pickaxe": new Decimal("50"),
          "Parsnip Seed": new Decimal("50"),
          Pickaxe: new Decimal("50"),
          "Potato Seed": new Decimal("300"),
          "Pumpkin Seed": new Decimal("200"),
          "Pumpkin Soup": new Decimal("1"),
          "Radish Seed": new Decimal("40"),
          "Roasted Cauliflower": new Decimal("1"),
          Sauerkraut: new Decimal("1"),
          "Stone Pickaxe": new Decimal("50"),
          "Sunflower Seed": new Decimal("1000"),
          "Wheat Seed": new Decimal("0"),
        },
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
          fields: {
            "0": {
              name: "Sunflower",
              plantedAt: 0,
            },
            "1": {
              name: "Sunflower",
              plantedAt: 0,
            },
            "10": {
              name: "Cauliflower",
              plantedAt: 0,
            },
            "11": {
              name: "Beetroot",
              plantedAt: 0,
            },
            "16": {
              name: "Parsnip",
              plantedAt: 0,
            },
            "17": {
              name: "Radish",
              plantedAt: 0,
            },
            "2": {
              name: "Sunflower",
              plantedAt: 0,
            },
            "5": {
              name: "Carrot",
              plantedAt: 0,
            },
            "6": {
              name: "Cabbage",
              plantedAt: 0,
            },
          },
          id: 1,
          inventory: {
            "Sunflower Seed": "3",
          },
          stock: {
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
          },
        },
        id: 13,
        owner: "0x71ce61c1a29959797493f882F01961567bE56f6E",
        previousGameState: {
          balance: "2.99999999999999999",
          fields: {
            "0": {
              name: "Sunflower",
              plantedAt: 0,
            },
            "1": {
              name: "Sunflower",
              plantedAt: 0,
            },
            "10": {
              name: "Cauliflower",
              plantedAt: 0,
            },
            "11": {
              name: "Beetroot",
              plantedAt: 0,
            },
            "16": {
              name: "Parsnip",
              plantedAt: 0,
            },
            "17": {
              name: "Radish",
              plantedAt: 0,
            },
            "2": {
              name: "Sunflower",
              plantedAt: 0,
            },
            "5": {
              name: "Carrot",
              plantedAt: 0,
            },
            "6": {
              name: "Cabbage",
              plantedAt: 0,
            },
          },
          id: 1,
          inventory: {
            "Sunflower Seed": "3",
          },
          stock: {
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
          },
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
          stock: {
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
          },
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
        stock: {
          Axe: new Decimal("50"),
          "Beetroot Seed": new Decimal("80"),
          "Cabbage Seed": new Decimal("90"),
          "Carrot Seed": new Decimal("100"),
          "Cauliflower Seed": new Decimal("70"),
          "Iron Pickaxe": new Decimal("50"),
          "Parsnip Seed": new Decimal("50"),
          Pickaxe: new Decimal("50"),
          "Potato Seed": new Decimal("300"),
          "Pumpkin Seed": new Decimal("200"),
          "Pumpkin Soup": new Decimal("1"),
          "Radish Seed": new Decimal("40"),
          "Roasted Cauliflower": new Decimal("1"),
          Sauerkraut: new Decimal("1"),
          "Stone Pickaxe": new Decimal("50"),
          "Sunflower Seed": new Decimal("1000"),
          "Wheat Seed": new Decimal("0"),
        },
      });
    });
  });
});
