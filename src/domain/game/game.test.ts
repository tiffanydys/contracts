import Decimal from "decimal.js-light";
import { createMock, getFarmsMock } from "../../repository/__mocks__/db";
import {
  loadNFTFarmMock,
  loadV1FarmMock,
  loadV1BalanceMock,
} from "../../services/web3/__mocks__/polygon";
import { INITIAL_FARM } from "./lib/constants";
import { processActions, startSession } from "./game";
import { V1Fruit } from "../../services/web3/polygon";

describe("game", () => {
  describe("processActions", () => {
    it("processes an event", () => {
      const state = processActions(INITIAL_FARM, [
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
      const state = processActions(
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

    it("ensures events are not in the future", () => {
      expect(() =>
        processActions(
          { ...INITIAL_FARM, inventory: { "Sunflower Seed": new Decimal(1) } },
          [
            {
              type: "item.planted",
              index: 4,
              item: "Sunflower Seed",
              createdAt: new Date(Date.now() + 5).toISOString(),
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
      expect(() =>
        processActions(
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
              createdAt: new Date(Date.now() - 5).toISOString(),
            },
          ]
        )
      ).toThrow("Event fired too quickly");
    });

    it("ensures all events are done in a time humanly possible", () => {
      expect(() =>
        processActions(
          {
            ...INITIAL_FARM,
            inventory: { Sunflower: new Decimal(1000) },
          },
          [
            {
              type: "item.sell",
              item: "Sunflower",
              amount: 1,
              createdAt: new Date(Date.now() - 400).toISOString(),
            },
            {
              type: "item.sell",
              item: "Sunflower",
              amount: 1,
              createdAt: new Date(Date.now() - 250).toISOString(),
            },
            {
              type: "item.sell",
              item: "Sunflower",
              amount: 1,
              createdAt: new Date(Date.now() - 50).toISOString(),
            },
          ]
        )
      ).toThrow("Too many events in a short time");
    });
  });

  describe("save", () => {
    it("throws an error if farm does not exist", () => {});

    it("saves a farm into the DB", () => {});
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
            "Beetroot Seed": "2",
            "Cabbage Seed": "3",
            "Carrot Seed": "2",
            "Cauliflower Seed": "100",
            "Chicken Coop": "1",
            "Christmas Tree": "1",
            "Farm Cat": "1",
            "Farm Dog": "1",
            Gnome: "1",
            "Gold Egg": "1",
            "Pumpkin Soup": "1",
            "Roasted Cauliflower": "2",
            Scarecrow: "1",
            "Sunflower Rock": "1",
            "Sunflower Seed": "3",
            "Sunflower Statue": "1",
            "Sunflower Tombstone": "1",
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

      expect(session).toEqual(gameState);
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
            "Beetroot Seed": "2",
            "Cabbage Seed": "3",
            "Carrot Seed": "2",
            "Cauliflower Seed": "100",
            "Chicken Coop": "1",
            "Christmas Tree": "1",
            "Farm Cat": "1",
            "Farm Dog": "1",
            Gnome: "1",
            "Gold Egg": "1",
            "Pumpkin Soup": "1",
            "Roasted Cauliflower": "2",
            Scarecrow: "1",
            "Sunflower Rock": "1",
            "Sunflower Seed": "3",
            "Sunflower Statue": "1",
            "Sunflower Tombstone": "1",
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
  });
});
