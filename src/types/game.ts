import { InventoryItemName } from "./crafting";
import { CropName } from "./crops";

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

export type Inventory = Partial<Record<InventoryItemName, number>>;

export type Farm = {
  balance: number;
  fields: {
    fieldIndex: number;
    crop?: {
      name: CropName;
      plantedAt: Date;
    };
  }[];
  inventory: Inventory;
};
