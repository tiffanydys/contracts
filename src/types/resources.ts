export type ResourceName = "Wood" | "Stone" | "Iron" | "Gold" | "Egg";

export type ItemDetails = {
  description: string;
};

export const RESOURCES: Record<ResourceName, ItemDetails> = {
  Wood: {
    description: "Used to craft items",
  },
  Stone: {
    description: "Used to craft items",
  },
  Iron: {
    description: "Used to craft items",
  },
  Gold: {
    description: "Used to craft items",
  },
  Egg: {
    description: "Used to craft items",
  },
};
