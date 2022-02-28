export const getMigrationEventMock = jest.fn();

jest.doMock("../eventStore", () => ({
  storeEvents: jest.fn(),
  storeWithdraw: jest.fn(),
  storeSync: jest.fn(),
  storeMigrationEvent: jest.fn(),
  getMigrationEvent: getMigrationEventMock,
}));
