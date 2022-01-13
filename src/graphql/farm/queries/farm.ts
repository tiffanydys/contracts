import { Plant, QueryResolvers } from "../../types";

export const farm: QueryResolvers["farm"] = async (_, args, context) => {
  return {
    // Farm NFT Token ID
    id: "123",
    fields: [
      {
        plant: Plant.Sunflower,
        index: 0,
        plantedAt: new Date().toISOString(),
      },
    ],
  };
};
