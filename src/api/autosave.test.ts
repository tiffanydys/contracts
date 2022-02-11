import "../services/web3/__mocks__/polygon";
import "../services/__mocks__/kms";
import { getFarmByIdMock } from "../repository/__mocks__/farms";

import { SyncSignature } from "../services/web3/signatures";
import { handler, AutosaveBody } from "./autosave";

describe("api.autosave", () => {
  it("requires sender", async () => {
    const body: AutosaveBody = {
      farmId: 1,
      sender: "",
      signature: "0x9123",
      sessionId: "0x",
      actions: [
        {
          type: "item.harvested",
          index: 1,
          createdAt: new Date().toISOString(),
        },
      ],
    };

    const result = handler(
      {
        body: JSON.stringify(body),
      } as any,
      {} as any,
      () => {}
    ) as Promise<SyncSignature>;

    await expect(
      result.catch((e: Error) => Promise.reject(e.message))
    ).rejects.toContain('"sender" is not allowed to be empty');
  });

  it("requires signature", async () => {
    const body: AutosaveBody = {
      farmId: 1,
      sender: "0x9123",
      signature: "",
      sessionId: "0x",
      actions: [
        {
          type: "item.harvested",
          index: 1,
          createdAt: new Date().toISOString(),
        },
      ],
    };

    const result = handler(
      {
        body: JSON.stringify(body),
      } as any,
      {} as any,
      () => {}
    ) as Promise<SyncSignature>;

    await expect(
      result.catch((e: Error) => Promise.reject(e.message))
    ).rejects.toContain('"signature" is not allowed to be empty');
  });

  it("requires farm ID", async () => {
    const body = {
      sender: "0x9123",
      signature: "0x9123",
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
      sender: "0x9123",
      signature: "0x9123",
      sessionId: "0x",
      actions: [],
    } as any as AutosaveBody;

    const result = handler(
      {
        body: JSON.stringify(body),
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
      sender: "0x9123",
      signature: "0x9123",
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
      sender: "0x9123",
      signature: "0x9123",
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
      } as any,
      {} as any,
      () => {}
    ) as Promise<SyncSignature>;

    await expect(
      result.catch((e: Error) => Promise.reject(e.message))
    ).rejects.toContain('"actions[0]" does not match any of the allowed types');
  });

  it("requires actions are before current time", async () => {
    const oneSecondInFuture = new Date(new Date().getTime() + 1000);

    const body = {
      sender: "0x9123",
      signature: "0x9123",
      sessionId: "0x",
      farmId: 1,
      actions: [
        {
          type: "item.harvested",
          index: 1,
          createdAt: oneSecondInFuture.toISOString(),
        },
      ],
    } as AutosaveBody;

    const result = handler(
      {
        body: JSON.stringify(body),
      } as any,
      {} as any,
      () => {}
    ) as Promise<SyncSignature>;

    await expect(
      result.catch((e: Error) => Promise.reject(e.message))
    ).rejects.toContain('"actions[0]" does not match any of the allowed types');
  });

  it("requires a valid signature", async () => {
    const body: AutosaveBody = {
      sender: "0x9123",
      sessionId: "0x",
      signature:
        "0x48277e15582f8c51e4b04896af2311ab130b29fb0c023a713c31cacc68b57b8a3ab2b3a3b6402c181d311e96252f8d70fb9c56c4fcd37f7666fe1e21f8bd09641b",
      farmId: 1,
      actions: [
        {
          type: "item.harvested",
          index: 1,
          createdAt: new Date().toISOString(),
        },
      ],
    };

    const result = handler(
      {
        body: JSON.stringify(body),
      } as any,
      {} as any,
      () => {}
    ) as Promise<SyncSignature>;

    await expect(
      result.catch((e: Error) => Promise.reject(e.message))
    ).rejects.toContain("Unable to verify account");
  });

  it("autosaves", async () => {
    getFarmByIdMock.mockReturnValue({
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
      },
      id: 2,
      owner: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
      previousGameState: {
        balance: "20000",
        stock: {},
        fields: {},
        id: 2,
        inventory: {},
        address: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
      },
      sessionId: "0x8123",
    });

    const twoMinutesAgo = new Date(new Date().getTime() - 2 * 60 * 1000);
    const oneMinutesAgo = new Date(new Date().getTime() - 1 * 60 * 1000);

    const body = {
      sender: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
      signature:
        "0x48277e15582f8c51e4b04896af2311ab130b29fb0c023a713c31cacc68b57b8a3ab2b3a3b6402c181d311e96252f8d70fb9c56c4fcd37f7666fe1e21f8bd09641b",
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
        address: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
      },
    });
  });
});
