import Decimal from "decimal.js-light";
import { INITIAL_FARM } from "./lib/constants";
import { processActions } from "./game";

describe("game", () => {
  describe("processActions", () => {
    it("processes an event", () => {
      const state = processActions(INITIAL_FARM, [
        {
          type: "item.harvested",
          index: 0,
          createdAt: new Date().toISOString(),
        },
      ]);

      expect(state.inventory.Sunflower).toEqual(new Decimal(1));
      expect(state.fields[0]).toBeUndefined();
    });

    it("processes multiple events", () => {
      const state = processActions(
        { ...INITIAL_FARM, inventory: { "Sunflower Seed": new Decimal(1) } },
        [
          {
            type: "item.planted",
            index: 4,
            item: "Sunflower Seed",
            createdAt: new Date(Date.now() - 60 * 1000).toISOString(),
          },
          {
            type: "item.harvested",
            index: 4,
            createdAt: new Date().toISOString(),
          },
        ]
      );

      expect(state.inventory.Sunflower).toEqual(new Decimal(1));
    });

    it("ensures events are in order", () => {
      expect(() =>
        processActions(
          { ...INITIAL_FARM, inventory: { "Sunflower Seed": new Decimal(1) } },
          [
            {
              type: "item.planted",
              index: 4,
              item: "Sunflower Seed",
              createdAt: new Date().toISOString(),
            },
            {
              type: "item.harvested",
              index: 4,
              createdAt: new Date(Date.now() - 60 * 1000).toISOString(),
            },
          ]
        )
      ).toThrow("Events must be in chronological order");
    });

    it("ensures events are not in the future", () => {
      expect(() =>
        processActions(
          { ...INITIAL_FARM, inventory: { "Sunflower Seed": new Decimal(1) } },
          [
            {
              type: "item.planted",
              index: 4,
              item: "Sunflower Seed",
              createdAt: new Date(Date.now() + 5).toISOString(),
            },
          ]
        )
      ).toThrow("Event cannot be in the future");
    });

    it("ensures events are not in the past", () => {
      expect(() =>
        processActions(
          { ...INITIAL_FARM, inventory: { "Sunflower Seed": new Decimal(1) } },
          [
            {
              type: "item.planted",
              index: 4,
              item: "Sunflower Seed",
              // 10 minutes ago
              createdAt: new Date(Date.now() - 60 * 10 * 1000).toISOString(),
            },
          ]
        )
      ).toThrow("Event is too old");
    });

    it("ensures event range is less than 2 minutes", () => {
      // First event to last event are within 2 minutes
      expect(() =>
        processActions(
          { ...INITIAL_FARM, inventory: { "Sunflower Seed": new Decimal(1) } },
          [
            {
              type: "item.planted",
              index: 4,
              item: "Sunflower Seed",
              // 4 minutes ago
              createdAt: new Date(Date.now() - 60 * 4 * 1000).toISOString(),
            },
            {
              type: "item.harvested",
              index: 4,
              // 1 minute ago
              createdAt: new Date(Date.now() - 60 * 1 * 1000).toISOString(),
            },
          ]
        )
      ).toThrow("Event range is too large");
    });

    it("ensures events are not fired too quickly after one another", () => {
      // First event to last event are within 2 minutes
      expect(() =>
        processActions(
          {
            ...INITIAL_FARM,
            inventory: { Sunflower: new Decimal(1000) },
          },
          [
            {
              type: "item.sell",
              item: "Sunflower",
              amount: 1,
              createdAt: new Date(Date.now() - 100).toISOString(),
            },
            {
              type: "item.sell",
              item: "Sunflower",
              amount: 1,
              createdAt: new Date(Date.now() - 5).toISOString(),
            },
          ]
        )
      ).toThrow("Event fired too quickly");
    });

    it.only("ensures all events are done in a time humanly possible", () => {
      expect(() =>
        processActions(
          {
            ...INITIAL_FARM,
            inventory: { Sunflower: new Decimal(1000) },
          },
          [
            {
              type: "item.sell",
              item: "Sunflower",
              amount: 1,
              createdAt: new Date(Date.now() - 400).toISOString(),
            },
            {
              type: "item.sell",
              item: "Sunflower",
              amount: 1,
              createdAt: new Date(Date.now() - 250).toISOString(),
            },
            {
              type: "item.sell",
              item: "Sunflower",
              amount: 1,
              createdAt: new Date(Date.now() - 50).toISOString(),
            },
          ]
        )
      ).toThrow("Too many events in a short time");
    });
  });

  describe("save", () => {
    it("throws an error if farm does not exist", () => {});

    it("saves a farm into the DB", () => {});
  });

  describe("startSession", () => {
    it("creates a farm if no session exists", () => {});

    it("does not migrate if farm already exists", () => {});

    it("migrates V1 data", () => {});

    it("loads a session", () => {});

    it("loads a session from the blockchain", () => {});
  });
});
