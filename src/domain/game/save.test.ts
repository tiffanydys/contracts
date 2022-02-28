import Decimal from "decimal.js-light";
import {
  getFarmMock,
  getFarmsMock,
  updateGameStateMock,
} from "../../repository/__mocks__/db";
import "../../repository/__mocks__/eventStore";
import {
  loadBalanceMock,
  loadInventoryMock,
} from "../../services/web3/__mocks__/polygon";
import { INITIAL_FARM } from "./lib/constants";
import { processActions, save } from "./save";

describe("game", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("processActions", () => {
    it("processes an event", () => {
      const { state } = processActions(INITIAL_FARM, [
        {
          type: "item.harvested",
          index: 0,
          createdAt: new Date().toISOString(),
        },
      ]);

      expect(state.inventory.Sunflower).toEqual(new Decimal(1));
      expect(state.fields[0]).toBeUndefined();
    });

    it("processes multiple events", () => {
      const { state } = processActions(
        { ...INITIAL_FARM, inventory: { "Sunflower Seed": new Decimal(1) } },
        [
          {
            type: "item.planted",
            index: 4,
            item: "Sunflower Seed",
            createdAt: new Date(Date.now() - 60 * 1000).toISOString(),
          },
          {
            type: "item.harvested",
            index: 4,
            createdAt: new Date().toISOString(),
          },
        ]
      );

      expect(state.inventory.Sunflower).toEqual(new Decimal(1));
    });

    it("ensures events are in order", () => {
      expect(() =>
        processActions(
          { ...INITIAL_FARM, inventory: { "Sunflower Seed": new Decimal(1) } },
          [
            {
              type: "item.planted",
              index: 4,
              item: "Sunflower Seed",
              createdAt: new Date().toISOString(),
            },
            {
              type: "item.harvested",
              index: 4,
              createdAt: new Date(Date.now() - 60 * 1000).toISOString(),
            },
          ]
        )
      ).toThrow("Events must be in chronological order");
    });

    it("ensures events are not too far in the future", () => {
      expect(() =>
        processActions(
          { ...INITIAL_FARM, inventory: { "Sunflower Seed": new Decimal(1) } },
          [
            {
              type: "item.planted",
              index: 4,
              item: "Sunflower Seed",
              createdAt: new Date(Date.now() + 2 * 60 * 1000).toISOString(),
            },
          ]
        )
      ).toThrow("Event cannot be in the future");
    });

    it("ensures events are not in the past", () => {
      expect(() =>
        processActions(
          { ...INITIAL_FARM, inventory: { "Sunflower Seed": new Decimal(1) } },
          [
            {
              type: "item.planted",
              index: 4,
              item: "Sunflower Seed",
              // 10 minutes ago
              createdAt: new Date(Date.now() - 60 * 10 * 1000).toISOString(),
            },
          ]
        )
      ).toThrow("Event is too old");
    });

    it("ensures event range is less than 2 minutes", () => {
      // First event to last event are within 2 minutes
      expect(() =>
        processActions(
          { ...INITIAL_FARM, inventory: { "Sunflower Seed": new Decimal(1) } },
          [
            {
              type: "item.planted",
              index: 4,
              item: "Sunflower Seed",
              // 4 minutes ago
              createdAt: new Date(Date.now() - 60 * 4 * 1000).toISOString(),
            },
            {
              type: "item.harvested",
              index: 4,
              // 1 minute ago
              createdAt: new Date(Date.now() - 60 * 1 * 1000).toISOString(),
            },
          ]
        )
      ).toThrow("Event range is too large");
    });

    it("ensures events are not fired too quickly after one another", () => {
      // First event to last event are within 2 minutes
      const { flaggedCount } = processActions(
        {
          ...INITIAL_FARM,
          inventory: { Sunflower: new Decimal(1000) },
        },
        [
          {
            type: "item.sell",
            item: "Sunflower",
            amount: 1,
            createdAt: new Date(Date.now() - 200).toISOString(),
          },
          {
            type: "item.sell",
            item: "Sunflower",
            amount: 1,
            createdAt: new Date(Date.now() - 175).toISOString(),
          },
        ]
      );

      expect(flaggedCount).toEqual(1);
    });

    it("ensures all events are done in a time humanly possible", () => {
      const { flaggedCount } = processActions(
        {
          ...INITIAL_FARM,
          inventory: { Sunflower: new Decimal(1000) },
        },
        [
          {
            type: "item.sell",
            item: "Sunflower",
            amount: 1,
            createdAt: new Date(Date.now() - 100).toISOString(),
          },
          {
            type: "item.sell",
            item: "Sunflower",
            amount: 1,
            createdAt: new Date(Date.now() - 75).toISOString(),
          },
          {
            type: "item.sell",
            item: "Sunflower",
            amount: 1,
            createdAt: new Date(Date.now() - 50).toISOString(),
          },
        ]
      );

      expect(flaggedCount).toEqual(3);
    });

    it("ensures wood is not chopped too quickly", () => {
      const { flaggedCount } = processActions(
        {
          ...INITIAL_FARM,
          inventory: { Axe: new Decimal(5) },
        },
        [
          {
            type: "tree.chopped",
            index: 1,
            item: "Axe",
            createdAt: new Date(Date.now() - 800).toISOString(),
          },
          {
            type: "tree.chopped",
            index: 2,
            item: "Axe",
            createdAt: new Date().toISOString(),
          },
        ]
      );

      expect(flaggedCount).toEqual(1);
    });

    it("allows wood to be chopped after time", () => {
      const { state } = processActions(
        {
          ...INITIAL_FARM,
          inventory: { Axe: new Decimal(5) },
        },
        [
          {
            type: "tree.chopped",
            index: 1,
            item: "Axe",
            createdAt: new Date(Date.now() - 3000).toISOString(),
          },
          {
            type: "tree.chopped",
            index: 2,
            item: "Axe",
            createdAt: new Date().toISOString(),
          },
        ]
      );

      expect(state.inventory.Axe).toEqual(new Decimal(3));
    });
  });

  describe("save", () => {
    it("throws an error if the farm does not exist", async () => {
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
            trees: {},
          },
        },
      ]);

      const result = save({
        farmId: 13,
        account: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
        actions: [],
      });

      await expect(
        result.catch((e: Error) => Promise.reject(e.message))
      ).rejects.toContain("Farm does not exist");
    });

    it("saves a farm", async () => {
      // Avoid migrations
      process.env.NETWORK = "mainnet";

      getFarmMock.mockReturnValueOnce({
        id: 13,
        updatedBy: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
        sessionId:
          "0x0000000000000000000000000000000000000000000000000000000000000000",
        gameState: {
          fields: {},
          inventory: {},
          stock: {
            "Potato Seed": "7",
          },
          balance: "20",
          trees: {},
        },
        flaggedCount: 0,
        // Account is verified
        verifyAt: "2030-01-01T00:00:00.000Z",
      });

      loadBalanceMock.mockReturnValue("120000000000000000000");
      loadInventoryMock.mockReturnValue(["1", "2"]);

      const session = await save({
        farmId: 13,
        account: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
        actions: [
          {
            type: "item.crafted",
            item: "Potato Seed",
            amount: 5,
            createdAt: new Date().toISOString(),
          },
        ],
      });

      expect(updateGameStateMock).toHaveBeenCalledWith({
        id: 13,
        owner: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
        session: {
          balance: "19.9",
          fields: {},
          inventory: {
            "Potato Seed": "5",
          },
          stock: {
            "Potato Seed": "2",
          },
          trees: {},
        },
        flaggedCount: 0,
      });

      expect(session).toEqual({
        state: {
          balance: new Decimal(19.9),
          fields: {},
          inventory: {
            "Potato Seed": new Decimal(5),
          },
          stock: {
            "Potato Seed": new Decimal(2),
          },
          trees: {},
        },
        verified: true,
      });
    });

    /**
     * Ensure no one goes through the autosave process to craft a limited item
     */
    it("does not craft a limited edition item", async () => {
      process.env.NETWORK = "mainnet";

      getFarmMock.mockReturnValueOnce({
        id: 13,
        updatedBy: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
        session:
          "0x0000000000000000000000000000000000000000000000000000000000000000",
        gameState: {
          fields: {},
          inventory: {},
          stock: {
            "Potato Seed": "7",
          },
          balance: "20",
          trees: {},
        },
        // Account is verified
        verifyAt: "2030-01-01T00:00:00.000Z",
      });

      loadBalanceMock.mockReturnValue("120000000000000000000");
      loadInventoryMock.mockReturnValue(["1", "2"]);

      const result = save({
        farmId: 13,
        account: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
        actions: [
          {
            type: "item.crafted",
            item: "Chicken Coop",
            amount: 1,
            createdAt: new Date().toISOString(),
          },
        ],
      });

      await expect(
        result.catch((e: Error) => Promise.reject(e.message))
      ).rejects.toContain("This item is not craftable: Chicken Coop");
    });
  });
});
