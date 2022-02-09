jest.doMock("../polygon", () => ({
  loadNFTFarm: jest.fn(),
  loadInventory: jest.fn(),
  loadBalance: jest.fn(),
  loadV1Balance: jest.fn(),
  loadV1Farm: jest.fn(),
}));
