import { MutationResolvers, Plant } from "../../types";

export const harvest: MutationResolvers["harvest"] = async (
  _,
  { plant },
  context
) => {
  // TODO: Save the events somewhere

  return {
    // Farm NFT Token ID
    id: "123",
    fields: [],
  };
};
