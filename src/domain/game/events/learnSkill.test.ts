import Decimal from "decimal.js-light";
import { INITIAL_FARM } from "../lib/constants";
import { GameState } from "../types/game";
import { learnSkill } from "./learnSkill";

const GAME_STATE: GameState = INITIAL_FARM;
describe("learnSkill", () => {
  it("requires a user is level 5 to learn a skill", () => {
    expect(() =>
      learnSkill({
        state: GAME_STATE,
        action: {
          type: "skill.learned",
          profession: "farming",
          skill: "Green Thumb",
        },
      })
    ).toThrow("Farming level is 1 but Green Thumb requires 5");
  });

  it("requires a user has not chosen a different path already", () => {
    expect(() =>
      learnSkill({
        state: {
          ...GAME_STATE,
          skills: {
            ...GAME_STATE.skills,
            farming: new Decimal(1000),
          },
          inventory: {
            ...GAME_STATE.inventory,
            "Green Thumb": new Decimal(1),
          },
        },
        action: {
          type: "skill.learned",
          profession: "farming",
          skill: "Barn Manager",
        },
      })
    ).toThrow(
      "Cannot learn Barn Manager because Green Thumb is already learned"
    );
  });

  it("learns a level 5 skill", () => {
    const state = learnSkill({
      state: {
        ...GAME_STATE,
        skills: {
          ...GAME_STATE.skills,
          farming: new Decimal(1000),
        },
      },
      action: {
        type: "skill.learned",
        profession: "farming",
        skill: "Green Thumb",
      },
    });

    expect(state.inventory["Green Thumb"]).toEqual(new Decimal(1));
  });

  it("requires a user has learn the base skill", () => {
    expect(() =>
      learnSkill({
        state: {
          ...GAME_STATE,
          skills: {
            ...GAME_STATE.skills,
            farming: new Decimal(10000),
          },
        },
        action: {
          type: "skill.learned",
          profession: "farming",
          skill: "Seed specialist",
        },
      })
    ).toThrow("Seed specialist requires Green Thumb to be learnt first");
  });

  it("learns an advanced skill", () => {
    const state = learnSkill({
      state: {
        ...GAME_STATE,
        skills: {
          ...GAME_STATE.skills,
          farming: new Decimal(10000),
        },
        inventory: {
          ...GAME_STATE.inventory,
          "Green Thumb": new Decimal(1),
        },
      },
      action: {
        type: "skill.learned",
        profession: "farming",
        skill: "Seed specialist",
      },
    });

    expect(state.inventory["Green Thumb"]).toEqual(new Decimal(1));
    expect(state.inventory["Seed specialist"]).toEqual(new Decimal(1));
  });
});
