import { Account } from "../types";

export const createMock = jest.fn();
export const updateGameStateMock = jest.fn();
export const createSessionMock = jest.fn();
export const getFarmMock = jest.fn();
export const getFarmsMock = jest.fn(
  (): Account => ({
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    gameState: {
      balance: "24.50192920",
      fields: {},
      id: 2,
      inventory: {},
      address: "0x291019282",
      stock: {},
    },
    id: 2,
    owner: "0xD755984F4A5D885919451eD25e1a854daa5086C9",
    previousGameState: {
      balance: "24.50192920",
      fields: {},
      id: 2,
      inventory: {},
      address: "0x291019282",
      stock: {},
    },
    // TODO real ID
    sessionId: "0x8123",
  })
);

jest.doMock("../db", () => ({
  getFarm: getFarmMock,
  getFarms: getFarmsMock,
  create: createMock,
  updateGameState: updateGameStateMock,
  createSession: createSessionMock,
}));
