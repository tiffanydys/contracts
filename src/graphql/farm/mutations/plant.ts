import { MutationResolvers, Plant } from "../../types";

export const plant: MutationResolvers["plant"] = async (
  _,
  { plant },
  context
) => {
  // Store somewhere!

  return {
    // Farm NFT Token ID
    id: "123",
    fields: [
      {
        index: plant.field,
        plant: plant.plant,
        plantedAt: plant.plantedAt,
      },
    ],
  };
};
