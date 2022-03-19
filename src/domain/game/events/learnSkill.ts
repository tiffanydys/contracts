import Decimal from "decimal.js-light";
import { getLevel, Profession, SkillName, SKILL_TREE } from "../types/skills";
import { GameState } from "../types/game";

export type LearnSkillAction = {
  type: "skill.learned";
  profession: Profession;
  skill: SkillName;
};

type Options = {
  state: GameState;
  action: LearnSkillAction;
};

export function learnSkill({ state, action }: Options): GameState {
  const skillRequirment = SKILL_TREE[action.skill];

  // Check their farming level
  if (action.profession === "farming") {
    const farmingLevel = getLevel(state.skills.farming.toNumber());

    if (farmingLevel < skillRequirment.level) {
      throw new Error(
        `Farming level is ${farmingLevel} but ${action.skill} requires ${skillRequirment.level}`
      );
    }
  }

  // Check their gathering level
  if (action.profession === "gathering") {
    const gatheringLevel = getLevel(state.skills.gathering.toNumber());

    if (gatheringLevel < skillRequirment.level) {
      throw new Error(
        `Gathering level is ${gatheringLevel} but ${action.skill} requires ${skillRequirment.level}`
      );
    }
  }

  // Chosen another path
  if (state.inventory[skillRequirment.conflicts]) {
    throw new Error(
      `Cannot learn ${action.skill} because ${skillRequirment.conflicts} is already learned`
    );
  }

  // Chosen another path
  if (skillRequirment.requires && !state.inventory[skillRequirment.requires]) {
    throw new Error(
      `${action.skill} requires ${skillRequirment.requires} to be learnt first`
    );
  }

  // Give them the skill
  return {
    ...state,
    inventory: {
      ...state.inventory,
      [action.skill]: new Decimal(1),
    },
  };
}
