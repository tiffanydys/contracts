import { signMock } from "../services/__mocks__/kms";

import { WithdrawArgs } from "../services/web3/signatures";
import { handler, WithdrawBody } from "./withdraw";
import { KNOWN_IDS } from "../domain/game/types";

describe("api.withdraw", () => {
  it("validates address is provided", async () => {
    const body: WithdrawBody = {
      signature:
        "0x48277e15582f8c51e4b04896af2311ab130b29fb0c023a713c31cacc68b57b8a3ab2b3a3b6402c8d70fb9c56c4fcd37f7666fe1e21f8bd09641b",
      sender: "",
      farmId: 1,
      amounts: [],
      ids: [],
      sfl: "100",
      sessionId: "0x123",
    };

    const result = handler(
      {
        body: JSON.stringify(body),
      } as any,
      {} as any,
      () => {}
    ) as Promise<WithdrawArgs>;

    await expect(
      result.catch((e: Error) => Promise.reject(e.message))
    ).rejects.toContain('"sender" is not allowed to be empty');
  });

  it("validates farmId is provided", async () => {
    const body = {
      signature:
        "0x48277e15582f8c51e4b04896af2311ab130b29fb0c023a713c31cacc68b57b8a3ab2b3a3b6402c8d70fb9c56c4fcd37f7666fe1e21f8bd09641b",
      sender: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
      amounts: [],
      ids: [],
      sfl: "100",
      sessionId: "0x123",
    } as any as WithdrawBody;

    const result = handler(
      {
        body: JSON.stringify(body),
      } as any,
      {} as any,
      () => {}
    ) as Promise<WithdrawArgs>;

    await expect(
      result.catch((e: Error) => Promise.reject(e.message))
    ).rejects.toContain('"farmId" is required');
  });

  it("validates sessionId is provided", async () => {
    const body: WithdrawBody = {
      signature:
        "0x48277e15582f8c51e4b04896af2311ab130b29fb0c023a713c31cacc68b57b8a3ab2b3a3b6402c8d70fb9c56c4fcd37f7666fe1e21f8bd09641b",
      sender: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
      amounts: [],
      ids: [],
      sfl: "100",
      farmId: 1,
      sessionId: "",
    };

    const result = handler(
      {
        body: JSON.stringify(body),
      } as any,
      {} as any,
      () => {}
    ) as Promise<WithdrawArgs>;

    await expect(
      result.catch((e: Error) => Promise.reject(e.message))
    ).rejects.toContain('"sessionId" is not allowed to be empty');
  });

  it("validates ids are provided", async () => {
    const body = {
      signature:
        "0x48277e15582f8c51e4b04896af2311ab130b29fb0c023a713c31cacc68b57b8a3ab2b3a3b6402c8d70fb9c56c4fcd37f7666fe1e21f8bd09641b",
      sender: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
      amounts: [],
      sfl: "100",
      farmId: 2,
      sessionId: "0x123",
    } as any as WithdrawBody;

    const result = handler(
      {
        body: JSON.stringify(body),
      } as any,
      {} as any,
      () => {}
    ) as Promise<WithdrawArgs>;

    await expect(
      result.catch((e: Error) => Promise.reject(e.message))
    ).rejects.toContain('"ids" is required');
  });

  it("validates amounts are provided", async () => {
    const body = {
      signature:
        "0x48277e15582f8c51e4b04896af2311ab130b29fb0c023a713c31cacc68b57b8a3ab2b3a3b6402c8d70fb9c56c4fcd37f7666fe1e21f8bd09641b",
      sender: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
      ids: [301],
      sfl: "100",
      farmId: 2,
      sessionId: "0x123",
    } as any as WithdrawBody;

    const result = handler(
      {
        body: JSON.stringify(body),
      } as any,
      {} as any,
      () => {}
    ) as Promise<WithdrawArgs>;

    await expect(
      result.catch((e: Error) => Promise.reject(e.message))
    ).rejects.toContain('"amounts" is required');
  });

  it("can not withdraw non withdrawable items", async () => {
    const body: WithdrawBody = {
      signature:
        "0x48277e15582f8c51e4b04896af2311ab130b29fb0c023a713c31cacc68b57b8a3ab2b3a3b6402c8d70fb9c56c4fcd37f7666fe1e21f8bd09641b",
      sender: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
      ids: [KNOWN_IDS["Pumpkin Soup"]],
      amounts: ["1"],
      sfl: "0",
      farmId: 2,
      sessionId: "0x123",
    };

    const result = handler(
      {
        body: JSON.stringify(body),
      } as any,
      {} as any,
      () => {}
    ) as Promise<WithdrawArgs>;

    await expect(
      result.catch((e: Error) => Promise.reject(e.message))
    ).rejects.toContain('ids[0]" must be one of');
  });

  it("requires a valid signature", async () => {
    const body: WithdrawBody = {
      signature:
        "0xed3ed877f0c5c41d0c464374a9147b41ba332194676df67e556a726129e4849854d32b3f802f4735e983af626b69ed658f4cba19d65a5057871675399d8b50211b",
      sender: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
      ids: [],
      amounts: [],
      sfl: "100",
      farmId: 2,
      sessionId: "0x123",
    };

    const result = handler(
      {
        body: JSON.stringify(body),
      } as any,
      {} as any,
      () => {}
    ) as Promise<WithdrawArgs>;

    await expect(
      result.catch((e: Error) => Promise.reject(e.message))
    ).rejects.toContain("Unable to verify account");
  });

  it("requires user is on the whitelist", async () => {
    process.env.NETWORK = "mainnet";

    const body: WithdrawBody = {
      signature:
        "0x81b61c8d9da5117a7ce8fed7666be0d76b683a3838f6d28916961d1edfc27d35422fe75a60733df4d3843d0e93d4736064b0438c4b37dd2f86425fbb2574ec461c",
      sender: "0xf199968e2Aa67c3f8eb5913547DD1f9e9A578798",
      ids: [],
      amounts: [],
      sfl: "100",
      farmId: 2,
      sessionId: "0x123",
    };

    const result = handler(
      {
        body: JSON.stringify(body),
      } as any,
      {} as any,
      () => {}
    ) as Promise<WithdrawArgs>;

    await expect(
      result.catch((e: Error) => Promise.reject(e.message))
    ).rejects.toContain("Not on whitelist");
  });

  it("creates a withdraw signature", async () => {
    const signature = "0x0213912";
    signMock.mockReturnValue({ signature });

    const body: WithdrawBody = {
      signature:
        "0x48277e15582f8c51e4b04896af2311ab130b29fb0c023a713c31cacc68b57b8a3ab2b3a3b6402c181d311e96252f8d70fb9c56c4fcd37f7666fe1e21f8bd09641b",
      sender: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
      ids: [],
      amounts: [],
      sfl: "100",
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
      sender: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
      ids: [],
      amounts: [],
      sfl: "100",
      farmId: 2,
      sessionId: "0x123",
      signature,
      tax: 50,
      deadline: expect.any(Number),
    });
  });
});
