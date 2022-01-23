export type CropName =
  | "Sunflower"
  | "Potato"
  | "Pumpkin"
  | "Carrot"
  | "Cabbage"
  | "Beetroot"
  | "Cauliflower"
  | "Parsnip"
  | "Radish"
  | "Wheat";

export type Crop = {
  buyPrice: number;
  sellPrice: number;
  harvestSeconds: number;
  name: CropName;
  description: string;
  //   images: {
  //     seed: any;
  //     seedling: any;
  //     ready: any;
  //     shop: any;
  //   };
};

/**
 * Crops and their original prices
 * TODO - use crop name from GraphQL API
 */
export const CROPS: Record<CropName, Crop> = {
  Sunflower: {
    buyPrice: 0.01,
    sellPrice: 0.02,
    harvestSeconds: 1 * 60,
    name: "Sunflower",
    description: "A sunny flower",
  },
  Potato: {
    buyPrice: 0.1,
    sellPrice: 0.14,
    harvestSeconds: 5 * 60,
    name: "Potato",
    description: "A nutrious crop for any diet",
  },
  Pumpkin: {
    buyPrice: 0.2,
    sellPrice: 0.4,
    harvestSeconds: 30 * 60,
    name: "Pumpkin",
    description: "A nutrious crop for any diet",
  },
  Carrot: {
    buyPrice: 0.5,
    sellPrice: 0.8,
    harvestSeconds: 60 * 60,
    name: "Carrot",
    description: "A nutrious crop for any diet",
  },
  Cabbage: {
    buyPrice: 1,
    sellPrice: 1.5,
    harvestSeconds: 2 * 60 * 60,
    name: "Cabbage",
    description: "A nutrious crop for any diet",
  },
  Beetroot: {
    buyPrice: 2,
    sellPrice: 2.8,
    harvestSeconds: 4 * 60 * 60,

    name: "Beetroot",

    description: "A nutrious crop for any diet",
  },
  Cauliflower: {
    buyPrice: 3,
    sellPrice: 4.25,
    harvestSeconds: 8 * 60 * 60,
    name: "Cauliflower",
    description: "A nutrious crop for any diet",
  },
  Parsnip: {
    buyPrice: 5,
    sellPrice: 6.5,
    harvestSeconds: 12 * 60 * 60,
    name: "Parsnip",
    description: "A nutrious crop for any diet",
  },
  Radish: {
    buyPrice: 7,
    sellPrice: 9.5,
    harvestSeconds: 24 * 60 * 60,
    name: "Radish",
    description: "A nutrious crop for any diet",
  },
  Wheat: {
    buyPrice: 0.1,
    sellPrice: 0.14,
    harvestSeconds: 5 * 60,
    name: "Wheat",
    description: "A nutrious crop for any diet",
  },
};
