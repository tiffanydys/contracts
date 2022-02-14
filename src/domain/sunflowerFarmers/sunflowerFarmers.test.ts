import Decimal from "decimal.js-light";
import { toWei } from "web3-utils";
import { V1Fruit } from "../../services/web3/types";
import {
  loadV1BalanceMock,
  loadV1FarmMock,
} from "../../services/web3/__mocks__/polygon";
import { getV1GameState, makeInventory } from "./sunflowerFarmers";

describe("sunflowerFarmers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("loads the ERC20 balances from V1", async () => {
    loadV1BalanceMock.mockReturnValue(toWei("22"));
    const state = await getV1GameState({
      address: "0xD755984F4A5D885919451eD25e1a854daa5086C9",
    });

    expect(state.balance).toEqual(new Decimal(22));
  });

  it("loads inventory (NFTs) from V1", async () => {
    loadV1BalanceMock.mockReturnValue(toWei("22"));
    const state = await getV1GameState({
      address: "0xD755984F4A5D885919451eD25e1a854daa5086C9",
    });

    expect(state.inventory).toEqual({
      Axe: new Decimal("257"),
      Chicken: new Decimal("1000"),
      "Chicken Coop": new Decimal("1"),
      "Christmas Tree": new Decimal("1"),
      Egg: new Decimal("4115"),
      "Farm Cat": new Decimal("2"),
      Gnome: new Decimal("1"),
      Gold: new Decimal("768"),
      "Gold Egg": new Decimal("1"),
      "Golden Cauliflower": new Decimal("3"),
      Iron: new Decimal("423"),
      "Iron Pickaxe": new Decimal("998"),
      Pickaxe: new Decimal("2479"),
      "Potato Statue": new Decimal("1"),
      Scarecrow: new Decimal("1"),
      Stone: new Decimal("2559"),
      "Stone Pickaxe": new Decimal("580"),
      "Sunflower Rock": new Decimal("5"),
      "Sunflower Statue": new Decimal("1"),
      Wood: new Decimal("3786"),
    });
  });

  it("converts fields from V1 into farms", async () => {
    const eightSunflowers = new Array(8).fill({
      fruit: V1Fruit.Sunflower,
      createdAt: 0,
    });
    loadV1FarmMock.mockReturnValue(eightSunflowers);

    const state = await getV1GameState({
      address: "0x012390as012349102391230",
    });

    expect(state.inventory).toEqual({
      "Pumpkin Soup": new Decimal("1"),
      Sunflower: new Decimal("8"),
    });
  });

  describe("makeInventory", () => {
    it("creates an empty inventory if the farm had no upgrades", async () => {
      const inventory = makeInventory([], {});

      expect(inventory).toEqual({});
    });

    it("maintains old inventory", async () => {
      const inventory = makeInventory([], {
        "Farm Cat": new Decimal(1),
        Gold: new Decimal(5),
      });

      expect(inventory).toEqual({
        "Farm Cat": new Decimal(1),
        Gold: new Decimal(5),
      });
    });

    it("provides pumpkin soup if they were on level 2", () => {
      const eigthPumpkins = new Array(8).fill({
        fruit: V1Fruit.Pumpkin,
        createdAt: 0,
      });

      const inventory = makeInventory(eigthPumpkins, {});

      expect(inventory).toEqual({
        "Pumpkin Soup": new Decimal(1),
        Pumpkin: new Decimal(8),
      });
    });
    it("provides saurekrat if they were on level 3", () => {
      const elevenCauliflowers = new Array(11).fill({
        fruit: V1Fruit.Cauliflower,
        createdAt: 0,
      });

      const inventory = makeInventory(elevenCauliflowers, {});

      expect(inventory).toEqual({
        "Pumpkin Soup": new Decimal(1),
        Sauerkraut: new Decimal(1),
        Cauliflower: new Decimal(11),
      });
    });

    it("provides roasted cauliflower if they were on level 4", () => {
      const fourteenParsnips = new Array(14).fill({
        fruit: V1Fruit.Parsnip,
        createdAt: 0,
      });

      const inventory = makeInventory(fourteenParsnips, {});

      expect(inventory).toEqual({
        "Pumpkin Soup": new Decimal(1),
        Sauerkraut: new Decimal(1),
        "Roasted Cauliflower": new Decimal(1),
        Parsnip: new Decimal(14),
      });
    });
    it("provides sunflower tombstone if they were on level 5", () => {
      const seventeenRadishes = new Array(17).fill({
        fruit: V1Fruit.Radish,
        createdAt: 0,
      });

      const inventory = makeInventory(seventeenRadishes, {});

      expect(inventory).toEqual({
        "Pumpkin Soup": new Decimal(1),
        Sauerkraut: new Decimal(1),
        "Roasted Cauliflower": new Decimal(1),
        "Sunflower Tombstone": new Decimal(1),
        Radish: new Decimal(17),
      });
    });

    it("provides all upgrades and maintains old inventory", () => {
      const seventeenRadishes = new Array(17).fill({
        fruit: V1Fruit.Radish,
        createdAt: 0,
      });

      const inventory = makeInventory(seventeenRadishes, {
        "Farm Cat": new Decimal(1),
        "Christmas Tree": new Decimal(1),
        Wood: new Decimal(5),
      });

      expect(inventory).toEqual({
        "Farm Cat": new Decimal(1),
        "Christmas Tree": new Decimal(1),
        Wood: new Decimal(5),
        "Pumpkin Soup": new Decimal(1),
        Sauerkraut: new Decimal(1),
        "Roasted Cauliflower": new Decimal(1),
        "Sunflower Tombstone": new Decimal(1),
        Radish: new Decimal(17),
      });
    });
  });
});
