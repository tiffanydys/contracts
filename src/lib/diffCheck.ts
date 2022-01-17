import { Farm } from "./types";

// Payload sent to SunflowerLand.sol
type Difference = {
  farmId: number;
  mintIds: number[];
  mintAmounts: number[];
  burnIds: number[];
  burnAmounts: number[];
  mintTokens: number;
  burnTokens: number;
};

type Options = {
  old: Farm;
  newFarm: Farm;
  id: number;
};
export function diffCheck({ old, newFarm, id }: Options): Difference {
  const balanceChange = newFarm.balance - old.balance;

  if (balanceChange === 0) {
    return {
      farmId: id,
      mintTokens: 0,
      burnTokens: 0,
      mintIds: [],
      mintAmounts: [],
      burnIds: [],
      burnAmounts: [],
    };
  }

  if (balanceChange > 0) {
    return {
      farmId: id,
      mintTokens: balanceChange,
      burnTokens: 0,
      mintIds: [],
      mintAmounts: [],
      burnIds: [],
      burnAmounts: [],
    };
  }

  return {
    farmId: id,
    mintTokens: 0,
    burnTokens: Math.abs(balanceChange),
    mintIds: [],
    mintAmounts: [],
    burnIds: [],
    burnAmounts: [],
  };
}
