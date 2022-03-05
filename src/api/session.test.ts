import "../services/web3/__mocks__/polygon";
import "../services/__mocks__/kms";
import "../repository/__mocks__/eventStore";
import { getFarmMock } from "../repository/__mocks__/db";
import { loadNFTFarmMock } from "../services/web3/__mocks__/polygon";
import { SyncSignature } from "../services/web3/signatures";
import { handler, SessionBody } from "./session";
import { generateJwt } from "../services/jwt";

describe("api.session", () => {
  it("requires a valid JWT", async () => {
    const body = {
      sessionId: "0x123",
    } as SessionBody;

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
      sessionId: "0x123",
    } as SessionBody;

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
    } as SessionBody;

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

  it("loads a session", async () => {
    loadNFTFarmMock.mockReturnValue({
      owner: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
      account: "0x71ce61c1a29959797493f882F01961567bE56f6E",
      id: 2,
    });

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
        },
        stock: {},
        address: "0x291019282",
        trees: {
          0: {
            wood: "2",
            choppedAt: 0,
          },
        },
        stones: {
          0: {
            amount: "2",
            minedAt: 0,
          },
          1: {
            amount: "2",
            minedAt: 169282029028,
          },
          2: {
            amount: "3",
            minedAt: 169282029028,
          },
        },
        iron: {
          0: {
            amount: "2",
            minedAt: 0,
          },
          1: {
            amount: "2",
            minedAt: 169282029028,
          },
        },
        gold: {
          0: {
            amount: "2",
            minedAt: 169282029028,
          },
        },
      },
      id: 2,
      updatedBy: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
      previousGameState: {
        balance: "100000",
        fields: {},
        id: 2,
        inventory: {
          Sunflower: "10000",
          Stone: "1000",
        },
        stock: {},
        address: "0x291019282",
        trees: {},
        stones: {},
        iron: {},
        gold: {},
      },
      sessionId: "0x123",
    });

    const body: SessionBody = {
      farmId: 2,
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
      startedAt: expect.any(String),
      farm: {
        balance: "100000",
        fields: {},
        id: 2,
        inventory: {
          Sunflower: "10000",
          Stone: "1000",
        },
        stock: {},
        address: "0x291019282",
        trees: {
          0: {
            wood: "2",
            choppedAt: 0,
          },
        },
        stones: {
          0: {
            amount: "2",
            minedAt: 0,
          },
          1: {
            amount: "2",
            minedAt: 169282029028,
          },
          2: {
            amount: "3",
            minedAt: 169282029028,
          },
        },
        iron: {
          0: {
            amount: "2",
            minedAt: 0,
          },
          1: {
            amount: "2",
            minedAt: 169282029028,
          },
        },
        gold: {
          0: {
            amount: "2",
            minedAt: 169282029028,
          },
        },
      },
    });
  });
});
