import { Square } from "../types";

export const loadNFTFarmMock = jest.fn();
export const loadV1BalanceMock = jest.fn();
export const loadV1FarmMock = jest.fn((): Square[] => []);
export const loadBalanceMock = jest.fn();
export const loadInventoryMock = jest.fn();

jest.doMock("../polygon", () => ({
  loadNFTFarm: loadNFTFarmMock,
  loadInventory: loadInventoryMock,
  loadBalance: loadBalanceMock,
  loadV1Balance: loadV1BalanceMock,
  loadV1Farm: loadV1FarmMock,
}));
