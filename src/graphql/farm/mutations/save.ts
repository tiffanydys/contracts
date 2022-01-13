import { MutationResolvers, Plant } from "../../types";

export const save: MutationResolvers["save"] = async (
  _,
  { events },
  context
) => {
  // TODO: Save the events somewhere

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
