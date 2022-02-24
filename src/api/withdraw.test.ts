import { signMock } from "../services/__mocks__/kms";

import { WithdrawArgs } from "../services/web3/signatures";
import { handler, WithdrawBody } from "./withdraw";
import { KNOWN_IDS } from "../domain/game/types";
import { toWei } from "web3-utils";
import { generateJwt } from "../services/jwt";

describe("api.withdraw", () => {
  it("validates farmId is provided", async () => {
    const body = {
      amounts: [],
      ids: [],
      sfl: "100",
      sessionId: "0x123",
    } as any as WithdrawBody;

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
    ) as Promise<WithdrawArgs>;

    await expect(
      result.catch((e: Error) => Promise.reject(e.message))
    ).rejects.toContain('"farmId" is required');
  });

  it("validates sessionId is provided", async () => {
    const body: WithdrawBody = {
      amounts: [],
      ids: [],
      sfl: "100",
      farmId: 1,
      sessionId: "",
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
    ) as Promise<WithdrawArgs>;

    await expect(
      result.catch((e: Error) => Promise.reject(e.message))
    ).rejects.toContain('"sessionId" is not allowed to be empty');
  });

  it("validates ids are provided", async () => {
    const body = {
      amounts: [],
      sfl: "100",
      farmId: 2,
      sessionId: "0x123",
    } as any as WithdrawBody;

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
    ) as Promise<WithdrawArgs>;

    await expect(
      result.catch((e: Error) => Promise.reject(e.message))
    ).rejects.toContain('"ids" is required');
  });

  it("validates amounts are provided", async () => {
    const body = {
      ids: [301],
      sfl: "100",
      farmId: 2,
      sessionId: "0x123",
    } as any as WithdrawBody;

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
    ) as Promise<WithdrawArgs>;

    await expect(
      result.catch((e: Error) => Promise.reject(e.message))
    ).rejects.toContain('"amounts" is required');
  });

  it("can not withdraw non withdrawable items", async () => {
    const body: WithdrawBody = {
      ids: [KNOWN_IDS["Pumpkin Soup"]],
      amounts: ["1"],
      sfl: "0",
      farmId: 2,
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
    ) as Promise<WithdrawArgs>;

    await expect(
      result.catch((e: Error) => Promise.reject(e.message))
    ).rejects.toContain('ids[0]" must be one of');
  });

  it("requires user is on the whitelist", async () => {
    process.env.NETWORK = "mainnet";

    const body: WithdrawBody = {
      ids: [],
      amounts: [],
      sfl: "100",
      farmId: 2,
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
    ) as Promise<WithdrawArgs>;

    await expect(
      result.catch((e: Error) => Promise.reject(e.message))
    ).rejects.toContain("Not on whitelist");
  });

  it("creates a withdraw signature", async () => {
    const signature = "0x0213912";
    signMock.mockReturnValue({ signature });

    const body: WithdrawBody = {
      ids: [],
      amounts: [],
      sfl: toWei("120"),
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
      sender: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
      ids: [],
      amounts: [],
      sfl: toWei("120"),
      farmId: 2,
      sessionId: "0x123",
      signature,
      tax: 200,
      deadline: expect.any(Number),
    });
  });
});
