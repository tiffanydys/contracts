export type CropName = "sunflower" | "potato";

export type FieldItem = {
  fieldIndex: number;
  crop?: {
    name: CropName;
    plantedAt: Date;
  };
};

type ActionTypes = "crop.planted" | "crop.harvested";

interface Action<P, ActionType extends ActionTypes> {
  createdAt: number;
  props: P;
  type: ActionType;
}

type PlantAction = Action<
  {
    crop: CropName;
    index: number;
  },
  "crop.planted"
>;

type HarvestAction = Action<
  {
    index: number;
  },
  "crop.harvested"
>;

export type GameAction = PlantAction | HarvestAction;

export type Farm = {
  balance: number;
  fields: {
    fieldIndex: number;
    crop?: {
      name: CropName;
      plantedAt: Date;
    };
  }[];
  level: number;
  inventory: {
    wood: number;
  };
};

export type Crop = {
  buyPrice: number;
  sellPrice: number;
  harvestSeconds: number;
};

/**
 * Crops and their original prices
 */
export const CROPS: Record<CropName, Crop> = {
  sunflower: {
    buyPrice: 0.01,
    sellPrice: 0.01,
    harvestSeconds: 1 * 60,
  },
  potato: {
    buyPrice: 0.1,
    sellPrice: 0.14,
    harvestSeconds: 5 * 60,
  },
};
