import "../services/web3/__mocks__/polygon";
import "../services/__mocks__/kms";
import { getFarmsByAccountMock } from "../repository/__mocks__/farms";

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
    getFarmsByAccountMock.mockReturnValue([
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
          address: "0x291019282",
        },
        id: 2,
        owner: "0xD755984F4A5D885919451eD25e1a854daa5086C9",
        previousGameState: {
          balance: "100000",
          fields: {},
          id: 2,
          inventory: {
            Sunflower: "10000",
            Stone: "1000",
          },
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
      farm: {
        balance: "100000",
        fields: {},
        id: 2,
        inventory: {
          Sunflower: "10000",
          Stone: "1000",
        },
        address: "0x291019282",
      },
    });
  });
});
