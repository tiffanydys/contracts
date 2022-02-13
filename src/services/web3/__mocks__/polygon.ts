export const loadNFTFarmMock = jest.fn();
export const loadV1BalanceMock = jest.fn();
export const loadV1FarmMock = jest.fn(() => []);

jest.doMock("../polygon", () => ({
  loadNFTFarm: loadNFTFarmMock,
  loadInventory: jest.fn(),
  loadBalance: jest.fn(),
  loadV1Balance: loadV1BalanceMock,
  loadV1Farm: loadV1FarmMock,
}));
