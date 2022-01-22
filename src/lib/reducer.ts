import { CROPS } from "../types/crops";
import { Farm, GameAction } from "../types/game";

/**
 * Copy pasted from front end
 */
export function dispatch(state: Farm, action: GameAction) {
  // TODO - verify that the action is valid
  if (!action.createdAt) {
    throw new Error("Action must have a createdAt property");
  }

  if (action.type === "crop.planted") {
    const fields = state.fields;

    if (fields.length < action.props.index) {
      throw new Error("Field is not unlocked");
    }

    const field = fields[action.props.index];
    if (field.crop) {
      throw new Error("Crop is already planted");
    }

    const crop = CROPS[action.props.crop];
    console.log({ state, crop });
    if (state.balance < crop.buyPrice) {
      throw new Error("Insufficient funds");
    }

    const newFields = fields;
    newFields[action.props.index] = {
      ...newFields[action.props.index],
      crop: {
        plantedAt: new Date(),
        name: action.props.crop,
      },
    };

    return {
      ...state,
      balance: state.balance - crop.buyPrice,
      fields: newFields,
    } as Farm;
  }

  if (action.type === "crop.harvested") {
    const fields = state.fields;

    if (fields.length < action.props.index) {
      throw new Error("Field is not unlocked");
    }

    const field = fields[action.props.index];
    if (!field.crop) {
      throw new Error("Nothing was planted");
    }

    const crop = CROPS[field.crop.name];

    if (
      Date.now() - field.crop.plantedAt.getTime() <
      crop.harvestSeconds * 1000
    ) {
      throw new Error("Crop is not ready to harvest");
    }

    const newFields = fields;
    newFields[action.props.index] = {
      ...newFields[action.props.index],
      crop: undefined,
    };

    return {
      ...state,
      balance: state.balance + crop.sellPrice,
      fields: newFields,
    } as Farm;
  }

  throw new Error(`Unexpected event dispatched`);
}

export function processActions(state: Farm, actions: GameAction[]) {
  // Validate actions
  if (!Array.isArray(actions)) {
    throw new Error("Expected actions to be an array");
  }

  return actions.reduce((farm, action) => {
    return dispatch(farm, action);
  }, state);
}
