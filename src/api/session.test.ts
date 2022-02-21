import "../services/web3/__mocks__/polygon";
import "../services/__mocks__/kms";
import { getFarmsMock } from "../repository/__mocks__/db";
import { loadNFTFarmMock } from "../services/web3/__mocks__/polygon";
import { SyncSignature } from "../services/web3/signatures";
import { handler, SessionBody } from "./session";

describe("api.session", () => {
  it("requires sender", async () => {
    const body: SessionBody = {
      farmId: 1,
      sender: "",
      signature: "0x9123",
      sessionId: "0x123",
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
    const body: SessionBody = {
      farmId: 1,
      sender: "0x9123",
      signature: "",
      sessionId: "0x123",
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
      sessionId: "0x123",
    } as SessionBody;

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

  it("requires a session ID", async () => {
    const body = {
      sender: "0x9123",
      signature: "0x9123",
      sessionId: "",
    } as SessionBody;

    const result = handler(
      {
        body: JSON.stringify(body),
      } as any,
      {} as any,
      () => {}
    ) as Promise<SyncSignature>;

    await expect(
      result.catch((e: Error) => Promise.reject(e.message))
    ).rejects.toContain('"sessionId" is not allowed to be empty');
  });

  it("requires a valid signature", async () => {
    const body: SessionBody = {
      sender: "0x9123",
      signature:
        "0x48277e15582f8c51e4b04896af2311ab130b29fb0c023a713c31cacc68b57b8a3ab2b3a3b6402c181d311e96252f8d70fb9c56c4fcd37f7666fe1e21f8bd09641b",
      farmId: 1,
      sessionId: "0x123",
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

  it("loads a session", async () => {
    loadNFTFarmMock.mockReturnValue({
      owner: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
      account: "0x71ce61c1a29959797493f882F01961567bE56f6E",
      id: 2,
    });

    getFarmsMock.mockReturnValue([
      {
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
        },
        id: 2,
        owner: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
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
        },
        sessionId: "0x123",
      },
    ]);

    const body: SessionBody = {
      sender: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
      signature:
        "0x48277e15582f8c51e4b04896af2311ab130b29fb0c023a713c31cacc68b57b8a3ab2b3a3b6402c181d311e96252f8d70fb9c56c4fcd37f7666fe1e21f8bd09641b",
      farmId: 2,
      sessionId: "0x123",
    };

    const result = (await handler(
      {
        body: JSON.stringify(body),
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
      },
    });
  });
});
