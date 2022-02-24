import { loadItemSupplyMock } from "../services/web3/__mocks__/polygon";
import { KNOWN_IDS } from "../domain/game/types";
import { getFarmMock } from "../repository/__mocks__/db";
import "../services/__mocks__/kms";

import { SyncSignature } from "../services/web3/signatures";
import { handler, MintBody } from "./mint";
import { generateJwt } from "../services/jwt";

describe("api.mint", () => {
  it("validates item is mintable", async () => {
    const body: MintBody = {
      farmId: 1,
      item: "Christmas Tree",
      sessionId: "0x123",
    };

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
    ).rejects.toContain("must be one of");
  });

  it("requires farm ID", async () => {
    const body = {
      item: "Sunflower Statue",
      sessionId: "0x123",
    } as MintBody;

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

  it("requires a session ID", async () => {
    const body = {
      item: "Sunflower Statue",
      sessionId: "",
    } as MintBody;

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
    ).rejects.toContain('"sessionId" is not allowed to be empty');
  });

  it("requires user is on the whitelist", async () => {
    process.env.NETWORK = "mainnet";

    const body: MintBody = {
      item: "Sunflower Statue",
      farmId: 1,
      sessionId: "0x123",
    };

    const result = handler(
      {
        body: JSON.stringify(body),
        headers: {
          authorization: `Bearer ${
            generateJwt({
              address: "0xf199968e2Aa67c3f8eb5913547DD1f9e9A578798",
            }).token
          }`,
        },
      } as any,
      {} as any,
      () => {}
    ) as Promise<SyncSignature>;

    await expect(
      result.catch((e: Error) => Promise.reject(e.message))
    ).rejects.toContain("Not on whitelist");
  });

  it("mints an item", async () => {
    // Still some left!
    loadItemSupplyMock.mockReturnValue("50");

    getFarmMock.mockReturnValue({
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      gameState: {
        balance: "100000",
        fields: {},
        id: 2,
        stock: {},
        inventory: {
          Sunflower: "10000",
          Stone: "1000",
        },
        address: "0x291019282",
        trees: {},
      },
      id: 2,
      owner: "0xD755984F4A5D885919451eD25e1a854daa5086C9",
      previousGameState: {
        balance: "100000",
        fields: {},
        id: 2,
        stock: {},
        inventory: {
          Sunflower: "10000",
          Stone: "1000",
        },
        address: "0x291019282",
        trees: {},
      },
      // TODO real ID
      sessionId: "0x8123",
    });

    const body: MintBody = {
      item: "Sunflower Statue",
      farmId: 1,
      sessionId: "0x123",
    };

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
      sessionId: body.sessionId,
      farmId: body.farmId,
      sender: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
      tokens: "-5000000000000000000",
      deadline: expect.any(Number),
      mintIds: [KNOWN_IDS["Sunflower Statue"]],
      mintAmounts: ["1"],
      burnIds: [KNOWN_IDS.Sunflower, KNOWN_IDS.Stone],
      burnAmounts: ["1000000000000000000000", "50000000000000000000"],
      signature: "0x0asd0j234nsd0",
    });
  });
});
