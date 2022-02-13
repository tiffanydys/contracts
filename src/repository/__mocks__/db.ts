export const createMock = jest.fn();
export const updateGameStateMock = jest.fn();
export const createSessionMock = jest.fn();
export const getFarmMock = jest.fn();
export const getFarmsMock = jest.fn();

jest.doMock("../db", () => ({
  getFarm: getFarmMock,
  getFarms: getFarmsMock,
  create: createMock,
  updateGameState: updateGameStateMock,
  createSession: createSessionMock,
}));
