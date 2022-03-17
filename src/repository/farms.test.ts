import {
  createMock,
  createSessionMock,
  updateGameStateMock,
} from "./__mocks__/db";
import { createFarm, updateFarm, updateSession } from "./farms";
import Decimal from "decimal.js-light";

describe("repository.farms", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  it("creates a farm", async () => {
    await createFarm({
      id: 2,
      gameState: {
        balance: new Decimal(100),
        skills: {
          farming: new Decimal(0),
          gathering: new Decimal(0),
        },
        fields: {
          "3": {
            name: "Beetroot",
            plantedAt: 160123010,
          },
        },
        inventory: {
          "Farm Cat": new Decimal(1),
        },
        stock: {
          "Sunflower Seed": new Decimal(50),
        },
        trees: {
          0: {
            wood: new Decimal(3),
            choppedAt: 0,
          },
          1: {
            wood: new Decimal(2),
            choppedAt: 0,
          },
        },
        stones: {
          0: {
            amount: new Decimal(2),
            minedAt: 0,
          },
          1: {
            amount: new Decimal(2),
            minedAt: 0,
          },
          2: {
            amount: new Decimal(3),
            minedAt: 0,
          },
        },
        iron: {
          0: {
            amount: new Decimal(2),
            minedAt: 0,
          },
          1: {
            amount: new Decimal(2),
            minedAt: 0,
          },
        },
        gold: {
          0: {
            amount: new Decimal(2),
            minedAt: 0,
          },
        },
      },
      owner: "0xD755984F4A5D885919451eD25e1a854daa5086C9",
      previousGameState: {
        balance: new Decimal(50),
        skills: {
          farming: new Decimal(0),
          gathering: new Decimal(0),
        },
        fields: {},
        inventory: {},
        stock: {},
        trees: {},
        stones: {},
        iron: {},
        gold: {},
      },
      sessionId: "0x8123",
    });

    expect(createMock).toHaveBeenCalledWith({
      id: 2,
      sessionId: "0x8123",
      createdBy: "0xD755984F4A5D885919451eD25e1a854daa5086C9",
      updatedBy: "0xD755984F4A5D885919451eD25e1a854daa5086C9",
      gameState: {
        balance: "100",
        skills: {
          farming: "0",
          gathering: "0",
        },
        fields: {
          "3": {
            name: "Beetroot",
            plantedAt: 160123010,
          },
        },
        inventory: {
          "Farm Cat": "1",
        },
        stock: {
          "Sunflower Seed": "50",
        },
        trees: {
          0: {
            wood: "3",
            choppedAt: 0,
          },
          1: {
            wood: "2",
            choppedAt: 0,
          },
        },
        stones: {
          0: {
            amount: "2",
            minedAt: 0,
          },
          1: {
            amount: "2",
            minedAt: 0,
          },
          2: {
            amount: "3",
            minedAt: 0,
          },
        },
        iron: {
          0: {
            amount: "2",
            minedAt: 0,
          },
          1: {
            amount: "2",
            minedAt: 0,
          },
        },
        gold: {
          0: {
            amount: "2",
            minedAt: 0,
          },
        },
      },
      previousGameState: {
        balance: "50",
        skills: {
          farming: "0",
          gathering: "0",
        },
        fields: {},
        inventory: {},
        stock: {},
        trees: {},
        stones: {},
        iron: {},
        gold: {},
      },
      updatedAt: expect.any(String),
      createdAt: expect.any(String),
      verifyAt: expect.any(String),
      flaggedCount: 0,
      version: 1,
    });
  });

  it("updates a farm", async () => {
    await updateFarm({
      id: 2,
      gameState: {
        balance: new Decimal(100),
        skills: {
          farming: new Decimal(5),
          gathering: new Decimal(2),
        },
        fields: {
          "3": {
            name: "Beetroot",
            plantedAt: 160123010,
          },
        },
        inventory: {
          "Farm Cat": new Decimal(1),
        },
        stock: {
          "Sunflower Seed": new Decimal(50),
        },
        trees: {
          0: {
            wood: new Decimal(5),
            choppedAt: 0,
          },
          1: {
            wood: new Decimal(2),
            choppedAt: 169282029028,
          },
        },
        stones: {
          0: {
            amount: new Decimal(2),
            minedAt: 0,
          },
          1: {
            amount: new Decimal(2),
            minedAt: 169282029028,
          },
          2: {
            amount: new Decimal(3),
            minedAt: 169282029028,
          },
        },
        iron: {
          0: {
            amount: new Decimal(2),
            minedAt: 0,
          },
          1: {
            amount: new Decimal(2),
            minedAt: 169282029028,
          },
        },
        gold: {
          0: {
            amount: new Decimal(2),
            minedAt: 169282029028,
          },
        },
      },
      owner: "0xD755984F4A5D885919451eD25e1a854daa5086C9",
      flaggedCount: 0,
    });

    expect(updateGameStateMock).toHaveBeenCalledWith({
      id: 2,
      owner: "0xD755984F4A5D885919451eD25e1a854daa5086C9",
      session: {
        balance: "100",
        skills: {
          farming: "5",
          gathering: "2",
        },
        fields: {
          "3": {
            name: "Beetroot",
            plantedAt: 160123010,
          },
        },
        inventory: {
          "Farm Cat": "1",
        },
        stock: {
          "Sunflower Seed": "50",
        },
        trees: {
          0: {
            wood: "5",
            choppedAt: 0,
          },
          1: {
            wood: "2",
            choppedAt: 169282029028,
          },
        },
        stones: {
          0: {
            amount: "2",
            minedAt: 0,
          },
          1: {
            amount: "2",
            minedAt: 169282029028,
          },
          2: {
            amount: "3",
            minedAt: 169282029028,
          },
        },
        iron: {
          0: {
            amount: "2",
            minedAt: 0,
          },
          1: {
            amount: "2",
            minedAt: 169282029028,
          },
        },
        gold: {
          0: {
            amount: "2",
            minedAt: 169282029028,
          },
        },
      },
      flaggedCount: 0,
    });
  });

  it("creates a new session", async () => {
    await updateSession({
      id: 2,
      sessionId: "0x8123",
      gameState: {
        balance: new Decimal(100),
        skills: {
          farming: new Decimal(1000500),
          gathering: new Decimal(2),
        },
        fields: {
          "3": {
            name: "Beetroot",
            plantedAt: 160123010,
          },
        },
        inventory: {
          "Farm Cat": new Decimal(1),
        },
        stock: {
          "Sunflower Seed": new Decimal(50),
        },
        trees: {
          0: {
            wood: new Decimal(3),
            choppedAt: 0,
          },
          1: {
            wood: new Decimal(2),
            choppedAt: 169282029028,
          },
        },
        stones: {
          0: {
            amount: new Decimal(2),
            minedAt: 0,
          },
          1: {
            amount: new Decimal(2),
            minedAt: 169282029028,
          },
          2: {
            amount: new Decimal(3),
            minedAt: 169282029028,
          },
        },
        iron: {
          0: {
            amount: new Decimal(2),
            minedAt: 0,
          },
          1: {
            amount: new Decimal(2),
            minedAt: 169282029028,
          },
        },
        gold: {
          0: {
            amount: new Decimal(2),
            minedAt: 169282029028,
          },
        },
      },
      owner: "0xD755984F4A5D885919451eD25e1a854daa5086C9",
      version: 2,
    });

    expect(createSessionMock).toHaveBeenCalledWith({
      id: 2,
      owner: "0xD755984F4A5D885919451eD25e1a854daa5086C9",
      sessionId: "0x8123",
      session: {
        balance: "100",
        skills: {
          farming: "1000500",
          gathering: "2",
        },
        fields: {
          "3": {
            name: "Beetroot",
            plantedAt: 160123010,
          },
        },
        inventory: {
          "Farm Cat": "1",
        },
        stock: {
          "Sunflower Seed": "50",
        },
        trees: {
          0: {
            wood: "3",
            choppedAt: 0,
          },
          1: {
            wood: "2",
            choppedAt: 169282029028,
          },
        },
        stones: {
          0: {
            amount: "2",
            minedAt: 0,
          },
          1: {
            amount: "2",
            minedAt: 169282029028,
          },
          2: {
            amount: "3",
            minedAt: 169282029028,
          },
        },
        iron: {
          0: {
            amount: "2",
            minedAt: 0,
          },
          1: {
            amount: "2",
            minedAt: 169282029028,
          },
        },
        gold: {
          0: {
            amount: "2",
            minedAt: 169282029028,
          },
        },
      },
      version: 2,
    });
  });
});
