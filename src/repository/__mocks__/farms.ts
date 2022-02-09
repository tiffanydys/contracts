import { Account } from "../types";

export const getFarmsByAccountMock = jest.fn();
export const getFarmByIdMock = jest.fn(
  (): Account => ({
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    gameState: {
      balance: "24.50192920",
      fields: {},
      id: 2,
      inventory: {},
      address: "0x291019282",
    },
    id: 2,
    owner: "0xD755984F4A5D885919451eD25e1a854daa5086C9",
    previousGameState: {
      balance: "24.50192920",
      fields: {},
      id: 2,
      inventory: {},
      address: "0x291019282",
    },
    // TODO real ID
    sessionId: "0x8123",
  })
);

jest.doMock("../farms", () => ({
  getFarmById: getFarmByIdMock,
  getFarmsByAccount: getFarmsByAccountMock,
  updateFarm: jest.fn(),
}));
