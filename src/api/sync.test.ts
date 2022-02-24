import { KNOWN_IDS } from "../domain/game/types";
import { getFarmMock } from "../repository/__mocks__/db";
import "../services/__mocks__/kms";

import { SyncSignature } from "../services/web3/signatures";
import { handler, SyncBody } from "./sync";
import { generateJwt } from "../services/jwt";

describe("api.sync", () => {
  it("requires farm ID", async () => {
    const body = {
      sessionId: "0x123",
    } as SyncBody;

    const result = handler(
      {
        body: JSON.stringify(body),
        headers: {
          authorization: `Bearer ${
            generateJwt({
              address:
                "0x81b61c8d9da5117a7ce8fed7666be0d76b683a3838f6d28916961d1edfc27d35422fe75a60733df4d3843d0e93d4736064b0438c4b37dd2f86425fbb2574ec461c",
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
      sessionId: "",
    } as SyncBody;

    const result = handler(
      {
        body: JSON.stringify(body),
        headers: {
          authorization: `Bearer ${
            generateJwt({
              address:
                "0x81b61c8d9da5117a7ce8fed7666be0d76b683a3838f6d28916961d1edfc27d35422fe75a60733df4d3843d0e93d4736064b0438c4b37dd2f86425fbb2574ec461c",
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

    const body: SyncBody = {
      farmId: 1,
      sessionId: "0x123",
    };

    const result = handler(
      {
        body: JSON.stringify(body),
        headers: {
          authorization: `Bearer ${
            generateJwt({
              address:
                "0x81b61c8d9da5117a7ce8fed7666be0d76b683a3838f6d28916961d1edfc27d35422fe75a60733df4d3843d0e93d4736064b0438c4b37dd2f86425fbb2574ec461c",
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
    getFarmMock.mockReturnValue({
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      gameState: {
        balance: "100000",
        fields: {},
        id: 2,
        inventory: {
          Sunflower: "10000",
          Stone: "1000",
          "Carrot Seed": "100",
        },
        address: "0x291019282",
        stock: {},
        trees: {},
      },
      id: 2,
      owner: "0xD755984F4A5D885919451eD25e1a854daa5086C9",
      previousGameState: {
        balance: "20000",
        fields: {},
        id: 2,
        inventory: {
          Sunflower: "4000",
          Stone: "500",
          "Carrot Seed": "200",
        },
        address: "0x291019282",
        stock: {},
        trees: {},
      },
      // TODO real ID
      sessionId: "0x8123",
    });

    const body: SyncBody = {
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
      tokens: "80000000000000000000000",
      deadline: expect.any(Number),
      mintIds: [KNOWN_IDS.Sunflower, KNOWN_IDS.Stone],
      mintAmounts: ["6000000000000000000000", "500000000000000000000"],
      burnIds: [KNOWN_IDS["Carrot Seed"]],
      burnAmounts: ["100000000000000000000"],
      signature: "0x0asd0j234nsd0",
    });
  });
});
