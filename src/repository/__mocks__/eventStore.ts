jest.doMock("../eventStore", () => ({
  storeEvents: jest.fn(),
}));
