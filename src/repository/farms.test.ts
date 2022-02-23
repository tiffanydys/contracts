import {
  createMock,
  createSessionMock,
  updateGameStateMock,
} from "./__mocks__/db";
import { createFarm, updateFarm, updateSession } from "./farms";
import Decimal from "decimal.js-light";
import { INITIAL_TREES } from "../domain/game/lib/constants";

describe("repository.farms", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  it("creates a farm", async () => {
    await createFarm({
      id: 2,
      gameState: {
        id: 2,
        balance: new Decimal(100),
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
      },
      owner: "0xD755984F4A5D885919451eD25e1a854daa5086C9",
      previousGameState: {
        id: 2,
        balance: new Decimal(50),
        fields: {},
        inventory: {},
        stock: {},
        trees: {},
      },
      sessionId: "0x8123",
    });

    expect(createMock).toHaveBeenCalledWith({
      id: 2,
      sessionId: "0x8123",
      owner: "0xD755984F4A5D885919451eD25e1a854daa5086C9",
      gameState: {
        id: 2,
        balance: "100",
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
      },
      previousGameState: {
        id: 2,
        balance: "50",
        fields: {},
        inventory: {},
        stock: {},
        trees: {},
      },
      updatedAt: expect.any(String),
      createdAt: expect.any(String),
    });
  });

  it("updates a farm", async () => {
    await updateFarm({
      id: 2,
      gameState: {
        id: 2,
        balance: new Decimal(100),
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
      },
      owner: "0xD755984F4A5D885919451eD25e1a854daa5086C9",
    });

    expect(updateGameStateMock).toHaveBeenCalledWith({
      id: 2,
      owner: "0xD755984F4A5D885919451eD25e1a854daa5086C9",
      session: {
        id: 2,
        balance: "100",
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
      },
    });
  });

  it("creates a new session", async () => {
    await updateSession({
      id: 2,
      sessionId: "0x8123",
      gameState: {
        id: 2,
        balance: new Decimal(100),
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
      },
      owner: "0xD755984F4A5D885919451eD25e1a854daa5086C9",
    });

    expect(createSessionMock).toHaveBeenCalledWith({
      id: 2,
      owner: "0xD755984F4A5D885919451eD25e1a854daa5086C9",
      sessionId: "0x8123",
      session: {
        id: 2,
        balance: "100",
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
      },
    });
  });
});
