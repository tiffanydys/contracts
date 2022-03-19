export type SkillName =
  | "Green Thumb"
  | "Barn Manager"
  | "Seed specialist"
  | "Wrangler"
  | "Lumberjack"
  | "Prospector"
  | "Logger"
  | "Gold Rush";

export type Profession = "farming" | "gathering";

export const SKILL_TREE: Record<
  SkillName,
  {
    level: number;
    conflicts: SkillName;
    requires?: SkillName;
  }
> = {
  "Green Thumb": {
    level: 5,
    conflicts: "Barn Manager",
  },
  "Barn Manager": {
    level: 5,
    conflicts: "Green Thumb",
  },
  "Seed specialist": {
    level: 10,
    conflicts: "Wrangler",
    requires: "Green Thumb",
  },
  Wrangler: {
    level: 10,
    conflicts: "Seed specialist",
    requires: "Barn Manager",
  },
  Lumberjack: {
    level: 5,
    conflicts: "Prospector",
  },
  Prospector: {
    level: 5,
    conflicts: "Lumberjack",
  },
  Logger: {
    level: 10,
    requires: "Lumberjack",
    conflicts: "Gold Rush",
  },
  "Gold Rush": {
    level: 10,
    requires: "Prospector",
    conflicts: "Logger",
  },
};
/**
 * Assumptions are based on a user can earn close to 50exp per day farming, 30exp chopping/mining
 */
export function getLevel(experience: number) {
  // Around 3 months farming
  if (experience > 5000) {
    return 10;
  }

  // Around 2 months farming
  if (experience > 3000) {
    return 9;
  }

  // Around 6 weeks farming
  if (experience > 2000) {
    return 8;
  }

  // Around 4 weeks farming
  if (experience > 1400) {
    return 7;
  }

  // Around 3 weeks farming
  if (experience > 1100) {
    return 6;
  }

  // Around 2 weeks farming
  if (experience > 700) {
    return 5;
  }

  // Around 1 weeks farming
  if (experience > 350) {
    return 4;
  }

  // Around three days farming
  if (experience > 150) {
    return 3;
  }

  // Around one day farming
  if (experience > 50) {
    return 2;
  }

  return 1;
}
