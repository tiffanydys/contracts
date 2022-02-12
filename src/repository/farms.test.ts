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
      },
      owner: "0xD755984F4A5D885919451eD25e1a854daa5086C9",
      previousGameState: {
        id: 2,
        balance: new Decimal(50),
        fields: {},
        inventory: {},
        stock: {},
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
      },
      previousGameState: {
        id: 2,
        balance: "50",
        fields: {},
        inventory: {},
        stock: {},
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
      },
    });
  });
});
