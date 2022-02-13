export const loadNFTFarmMock = jest.fn();
export const loadV1BalanceMock = jest.fn();
export const loadV1FarmMock = jest.fn(() => []);
export const loadBalanceMock = jest.fn();
export const loadInventoryMock = jest.fn();

jest.doMock("../polygon", () => ({
  loadNFTFarm: loadNFTFarmMock,
  loadInventory: loadInventoryMock,
  loadBalance: loadBalanceMock,
  loadV1Balance: loadV1BalanceMock,
  loadV1Farm: loadV1FarmMock,
}));
