import { getFarmMock } from "../repository/__mocks__/db";
import "../repository/__mocks__/eventStore";
import "../services/web3/__mocks__/polygon";
import "../services/__mocks__/kms";

import { SyncSignature } from "../services/web3/signatures";
import { handler, AutosaveBody } from "./autosave";
import { generateJwt } from "../services/jwt";

describe("api.autosave", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("requires a valid JWT", async () => {
    const body = {
      sessionId: "0x",
      actions: [
        {
          type: "item.harvested",
          index: 1,
          createdAt: new Date().toISOString(),
        },
      ],
    } as AutosaveBody;

    const result = handler(
      {
        body: JSON.stringify(body),
        headers: {
          authorization: `Bearer ey123`,
        },
      } as any,
      {} as any,
      () => {}
    ) as Promise<SyncSignature>;

    await expect(
      result.catch((e: Error) => Promise.reject(e.message))
    ).rejects.toContain("jwt malformed");
  });

  it("requires farm ID", async () => {
    const body = {
      sessionId: "0x",
      actions: [
        {
          type: "item.harvested",
          index: 1,
          createdAt: new Date().toISOString(),
        },
      ],
    } as AutosaveBody;

    const result = handler(
      {
        body: JSON.stringify(body),
        headers: {
          authorization: `Bearer ${
            generateJwt({
              address: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
            }).token
          }`,
        },
      } as any,
      {} as any,
      () => {}
    ) as Promise<SyncSignature>;

    await expect(
      result.catch((e: Error) => Promise.reject(e.message))
    ).rejects.toContain('"farmId" is required');
  });

  it("requires actions", async () => {
    const body = {
      sessionId: "0x",
      actions: [],
    } as any as AutosaveBody;

    const result = handler(
      {
        body: JSON.stringify(body),
        headers: {
          authorization: `Bearer ${
            generateJwt({
              address: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
            }).token
          }`,
        },
      } as any,
      {} as any,
      () => {}
    ) as Promise<SyncSignature>;

    await expect(
      result.catch((e: Error) => Promise.reject(e.message))
    ).rejects.toContain('"actions" must contain at least 1 items');
  });

  it("requires a valid action", async () => {
    const body = {
      farmId: 1,
      sessionId: "0x",
      actions: [
        {
          type: "not.an.action",
          index: 1,
          createdAt: new Date().toISOString(),
        },
      ],
    } as any as AutosaveBody;

    const result = handler(
      {
        body: JSON.stringify(body),
        headers: {
          authorization: `Bearer ${
            generateJwt({
              address: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
            }).token
          }`,
        },
      } as any,
      {} as any,
      () => {}
    ) as Promise<SyncSignature>;

    await expect(
      result.catch((e: Error) => Promise.reject(e.message))
    ).rejects.toContain('"actions[0]" does not match any of the allowed types');
  });

  it("requires actions are within time range", async () => {
    const tenMinutesAgo = new Date(new Date().getTime() - 10 * 60 * 1000);

    const body = {
      sessionId: "0x",
      farmId: 1,
      actions: [
        {
          type: "item.harvested",
          index: 1,
          createdAt: tenMinutesAgo.toISOString(),
        },
      ],
    } as AutosaveBody;

    const result = handler(
      {
        body: JSON.stringify(body),
        headers: {
          authorization: `Bearer ${
            generateJwt({
              address: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
            }).token
          }`,
        },
      } as any,
      {} as any,
      () => {}
    ) as Promise<SyncSignature>;

    await expect(
      result.catch((e: Error) => Promise.reject(e.message))
    ).rejects.toContain('"actions[0]" does not match any of the allowed types');
  });

  it("requires actions are not too far in the future", async () => {
    const twoMinutesInFuture = new Date(new Date().getTime() + 1000 * 60 * 2);

    const body = {
      sessionId: "0x",
      farmId: 1,
      actions: [
        {
          type: "item.harvested",
          index: 1,
          createdAt: twoMinutesInFuture.toISOString(),
        },
      ],
    } as AutosaveBody;

    const result = handler(
      {
        body: JSON.stringify(body),
        headers: {
          authorization: `Bearer ${
            generateJwt({
              address: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
            }).token
          }`,
        },
      } as any,
      {} as any,
      () => {}
    ) as Promise<SyncSignature>;

    await expect(
      result.catch((e: Error) => Promise.reject(e.message))
    ).rejects.toContain('"actions[0]" does not match any of the allowed types');
  });

  it("autosaves", async () => {
    getFarmMock.mockReturnValue({
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      gameState: {
        balance: "100000",
        fields: {},
        stock: {},
        id: 2,
        inventory: {
          "Sunflower Seed": "5",
        },
        address: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
        trees: {},
        stones: {},
        iron: {},
        gold: {},
      },
      id: 2,
      updatedBy: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
      previousGameState: {
        balance: "20000",
        stock: {},
        fields: {},
        id: 2,
        inventory: {},
        address: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
        trees: {},
        stones: {},
        iron: {},
        gold: {},
      },
      sessionId: "0x8123",
      // Account is verified
      verifyAt: "2030-01-01T00:00:00.000Z",
    });

    const twoMinutesAgo = new Date(new Date().getTime() - 2 * 60 * 1000);
    const oneMinutesAgo = new Date(new Date().getTime() - 1 * 60 * 1000);

    const body = {
      farmId: 1,
      sessionId: "0x",
      actions: [
        {
          type: "item.planted",
          item: "Sunflower Seed",
          index: 1,
          createdAt: twoMinutesAgo.toISOString(),
        },
        {
          type: "item.harvested",
          index: 1,
          createdAt: oneMinutesAgo.toISOString(),
        },
      ],
    } as AutosaveBody;

    const result = (await handler(
      {
        body: JSON.stringify(body),
        headers: {
          authorization: `Bearer ${
            generateJwt({
              address: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
            }).token
          }`,
        },
      } as any,
      {} as any,
      () => {}
    )) as any;

    expect(result.statusCode).toEqual(200);
    expect(JSON.parse(result.body)).toEqual({
      farm: {
        balance: "100000",
        fields: {},
        id: 2,
        inventory: {
          "Sunflower Seed": "4",
          Sunflower: "1",
        },
        stock: {},
        trees: {},
        stones: {},
        iron: {},
        gold: {},
        address: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
      },
    });
  });

  it("requires a captcha", async () => {
    getFarmMock.mockReturnValue({
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      gameState: {
        balance: "100000",
        fields: {},
        stock: {},
        id: 2,
        inventory: {
          "Sunflower Seed": "5",
        },
        address: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
        trees: {},
      },
      id: 2,
      updatedBy: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
      previousGameState: {
        balance: "20000",
        stock: {},
        fields: {},
        id: 2,
        inventory: {},
        address: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
        trees: {},
      },
      sessionId: "0x8123",
      // Account is unverified
      verifyAt: "2010-01-01T00:00:00.000Z",
    });

    const body = {
      farmId: 1,
      sessionId: "0x",
      actions: [
        {
          type: "item.planted",
          item: "Sunflower Seed",
          index: 1,
          createdAt: new Date().toISOString(),
        },
      ],
    } as AutosaveBody;

    const result = (await handler(
      {
        body: JSON.stringify(body),
        headers: {
          authorization: `Bearer ${
            generateJwt({
              address: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
            }).token
          }`,
        },
      } as any,
      {} as any,
      () => {}
    )) as any;

    expect(result.statusCode).toEqual(429);
  });
});
