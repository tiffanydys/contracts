import Decimal from "decimal.js-light";
import { toWei } from "web3-utils";
import { getFarmMock } from "../../repository/__mocks__/db";
import { loadItemSupplyMock } from "../../services/web3/__mocks__/polygon";
import "../../services/__mocks__/kms";
import "../../repository/__mocks__/eventStore";
import { calculateChangeset, sync, mint } from "./sync";
import { FOODS, LimitedItems, TOOLS } from "./types/craftables";
import { CROPS, SEEDS } from "./types/crops";
import { GameState, Inventory, InventoryItemName } from "./types/game";
import { RESOURCES } from "./types/resources";

describe("game.sync", () => {
  describe("getChangeset", () => {
    it("throws an error if the farm does not exist", async () => {
      getFarmMock.mockReturnValueOnce(null);

      const result = sync({
        id: 13,
        owner: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
      });

      await expect(
        result.catch((e: Error) => Promise.reject(e.message))
      ).rejects.toContain("Farm does not exist");
    });

    it("calculates the changeset from a farm in the DB", async () => {
      getFarmMock.mockReturnValueOnce({
        id: 13,
        sessionId:
          "0x0000000000000000000000000000000000000000000000000000000000000000",
        gameState: {
          balance: "20",
          fields: {},
          inventory: {
            "Potato Seed": "3",
            Sunflower: "5",
            "Farm Cat": "1",
            Gold: "3",
          },
          stock: {
            "Potato Seed": "7",
          },
          trees: {},
        },
        previousGameState: {
          balance: "10",
          fields: {},
          stock: {},
          inventory: {
            "Potato Seed": "7",
            Sunflower: "1",
          },
          trees: {},
        },
        updatedBy: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
      });

      const result = await sync({
        id: 13,
        owner: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
      });

      expect(result).toEqual({
        burnAmounts: ["4000000000000000000"],
        burnIds: [102],
        deadline: expect.any(Number),
        farmId: 13,
        mintAmounts: ["4000000000000000000", "1", "3000000000000000000"],
        mintIds: [201, 405, 604],
        sender: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
        sessionId:
          "0x0000000000000000000000000000000000000000000000000000000000000000",
        signature: "0x0asd0j234nsd0",
        tokens: "10000000000000000000",
      });
    });
  });

  describe("calculateChangeset", () => {
    it("detects an increase in balance", async () => {
      const changeset = await calculateChangeset({
        current: {
          balance: new Decimal(761),
          inventory: {},
        } as GameState,
        previous: {
          balance: new Decimal(540),
          inventory: {},
        } as GameState,
      });

      expect(changeset.balance).toEqual(new Decimal(toWei("221")));
    });

    it("keeps the balance the same", async () => {
      const changeset = await calculateChangeset({
        current: {
          balance: new Decimal(231),
          inventory: {},
        } as GameState,
        previous: {
          balance: new Decimal(231),
          inventory: {},
        } as GameState,
      });

      expect(changeset.balance).toEqual(new Decimal("0"));
    });

    it("detects a decrease in balance", async () => {
      const changeset = await calculateChangeset({
        current: {
          balance: new Decimal(300),
          inventory: {},
        } as GameState,
        previous: {
          balance: new Decimal(541),
          inventory: {},
        } as GameState,
      });

      expect(changeset.balance).toEqual(new Decimal(toWei("-241")));
    });

    it("detects a change in inventory", async () => {
      const changeset = await calculateChangeset({
        current: {
          balance: new Decimal(0),
          inventory: {
            "Beetroot Seed": new Decimal(25),
            Pickaxe: new Decimal(5),
            Wood: new Decimal(10),
            "Sunflower Rock": new Decimal(1),
            Gold: new Decimal(10),
            Sunflower: new Decimal(120),
            "Roasted Cauliflower": new Decimal(1),
            Iron: new Decimal(37),
          },
        } as GameState,
        previous: {
          balance: new Decimal(0),
          inventory: {
            "Beetroot Seed": new Decimal(5),
            Pickaxe: new Decimal(10),
            Wood: new Decimal(5),
            Gold: new Decimal(20),
            "Farm Cat": new Decimal(1),
            Sunflower: new Decimal(50),
            "Roasted Cauliflower": new Decimal(1),
            "Christmas Tree": new Decimal(1),
          },
        } as GameState,
      });

      expect(changeset.inventory).toEqual({
        "Beetroot Seed": new Decimal("20000000000000000000"),
        "Christmas Tree": new Decimal("-1"),
        "Farm Cat": new Decimal("-1"),
        Gold: new Decimal("-10000000000000000000"),
        Iron: new Decimal("37000000000000000000"),
        Pickaxe: new Decimal("-5000000000000000000"),
        Sunflower: new Decimal(toWei("70")),
        "Sunflower Rock": new Decimal("1"),
        Wood: new Decimal("5000000000000000000"),
      });
    });

    it("detects a different change in inventory", async () => {
      const changeset = await calculateChangeset({
        current: {
          balance: new Decimal(0),
          inventory: {
            "Golden Cauliflower": new Decimal(1),
            "Farm Dog": new Decimal(1),
            Cabbage: new Decimal(100),
            Egg: new Decimal(10),
            "Cauliflower Seed": new Decimal(10),
          },
        } as GameState,
        previous: {
          balance: new Decimal(0),
          inventory: {
            "Farm Dog": new Decimal(1),
            Egg: new Decimal(10),
            "Cauliflower Seed": new Decimal(5),
          },
        } as GameState,
      });

      expect(changeset.inventory).toEqual({
        Cabbage: new Decimal(toWei("100")),
        "Cauliflower Seed": new Decimal("5000000000000000000"),
        "Golden Cauliflower": new Decimal("1"),
      });
    });

    it("detects nothing changed in the inventoyr", async () => {
      const changeset = await calculateChangeset({
        current: {
          balance: new Decimal(0),
          inventory: {
            "Gold Egg": new Decimal(1),
            Stone: new Decimal(20),
            Axe: new Decimal(5),
          },
        } as GameState,
        previous: {
          balance: new Decimal(0),
          inventory: {
            "Gold Egg": new Decimal(1),
            Stone: new Decimal(20),
            Axe: new Decimal(5),
          },
        } as GameState,
      });

      expect(changeset.inventory).toEqual({});
    });

    it("uses wei conversion for all crops, seeds, tools and resources", async () => {
      const weiBased = { ...CROPS(), ...RESOURCES, ...SEEDS(), ...TOOLS };

      const increase = Object.keys(weiBased).reduce((acc, key) => {
        acc[key as InventoryItemName] = new Decimal(1);
        return acc;
      }, {} as Inventory);

      const changeset = calculateChangeset({
        current: {
          balance: new Decimal(0),
          inventory: increase,
        } as GameState,
        previous: {
          balance: new Decimal(0),
          inventory: {},
        } as GameState,
      });

      const expected = Object.keys(weiBased).reduce((acc, key) => {
        acc[key] = new Decimal(toWei("1"));
        return acc;
      }, {} as any);

      expect(changeset.inventory).toEqual(expected);
    });

    it("uses eth conversion for all food & NFTs", async () => {
      const ethBased = { ...LimitedItems, ...FOODS };

      const increase = Object.keys(ethBased).reduce((acc, key) => {
        acc[key as InventoryItemName] = new Decimal(1);
        return acc;
      }, {} as Inventory);

      const changeset = calculateChangeset({
        current: {
          balance: new Decimal(0),
          inventory: increase,
        } as GameState,
        previous: {
          balance: new Decimal(0),
          inventory: {},
        } as GameState,
      });

      expect(changeset.inventory).toEqual(increase);
    });
  });

  describe("mint", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      loadItemSupplyMock.mockReturnValue("22");
    });

    it("throws an error if the farm does not exist", async () => {
      getFarmMock.mockReturnValueOnce(null);

      const result = mint({
        farmId: 13,
        item: "Sunflower Rock",
        account: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
      });

      await expect(
        result.catch((e: Error) => Promise.reject(e.message))
      ).rejects.toContain("Farm does not exist");
    });

    it("throws an error if the farm does not exist", async () => {
      getFarmMock.mockReturnValueOnce(null);

      const result = mint({
        farmId: 13,
        item: "Sunflower Rock",
        account: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
      });

      await expect(
        result.catch((e: Error) => Promise.reject(e.message))
      ).rejects.toContain("Farm does not exist");
    });

    it("crafts an item", async () => {
      getFarmMock.mockReturnValueOnce({
        id: 13,
        sessionId:
          "0x0000000000000000000000000000000000000000000000000000000000000000",
        gameState: {
          balance: "2000",
          fields: {},
          inventory: {
            Sunflower: "50000",
            Iron: "200",
            Gold: "3",
            Gnome: "1",
          },
          stock: {
            "Potato Seed": "7",
          },
          trees: {},
        },
        previousGameState: {
          balance: "400",
          fields: {},
          stock: {},
          inventory: {
            Sunflower: "2000",
            "Potato Seed": "7",
            Gnome: "1",
          },
          trees: {},
        },
        updatedBy: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
      });

      const changeset = await mint({
        farmId: 13,
        item: "Sunflower Rock",
        account: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
      });

      expect(changeset.balance).toEqual(new Decimal(toWei("1500")));
      expect(changeset.inventory).toEqual({
        Gold: new Decimal("3000000000000000000"),
        Iron: new Decimal("100000000000000000000"),
        "Potato Seed": new Decimal("-7000000000000000000"),
        Sunflower: new Decimal(toWei("38000")),
        "Sunflower Rock": new Decimal("1"),
      });
    });

    it("does not craft an item without required ingredients", async () => {
      getFarmMock.mockReturnValueOnce({
        id: 13,
        session:
          "0x0000000000000000000000000000000000000000000000000000000000000000",
        gameState: {
          balance: "50",
          fields: {},
          inventory: {},
          stock: {},
          trees: {},
        },
        previousGameState: {
          balance: "400",
          fields: {},
          stock: {},
          inventory: {
            Sunflower: "2000",
            Iron: "700",
          },
          trees: {},
        },
        updatedBy: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
      });

      const result = mint({
        farmId: 13,
        item: "Sunflower Rock",
        account: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
      });

      await expect(
        result.catch((e: Error) => Promise.reject(e.message))
      ).rejects.toContain("Insufficient tokens");
    });

    it("does not craft an item once supply is reached", async () => {
      loadItemSupplyMock.mockReturnValue(LimitedItems["Sunflower Rock"].supply);

      getFarmMock.mockReturnValueOnce({
        id: 13,
        session:
          "0x0000000000000000000000000000000000000000000000000000000000000000",
        gameState: {
          balance: "2000",
          fields: {},
          inventory: {
            Sunflower: "50000",
            Iron: "200",
            Gold: "3",
            Gnome: "1",
          },
          stock: {
            "Potato Seed": "7",
          },
          trees: {},
        },
        previousGameState: {
          balance: "400",
          fields: {},
          stock: {},
          inventory: {
            Sunflower: "2000",
            "Potato Seed": "7",
            Gnome: "1",
          },
          trees: {},
        },
        updatedBy: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
      });

      const result = mint({
        farmId: 13,
        item: "Sunflower Rock",
        account: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
      });

      await expect(
        result.catch((e: Error) => Promise.reject(e.message))
      ).rejects.toContain("Total supply reached for item");
    });
  });
});
