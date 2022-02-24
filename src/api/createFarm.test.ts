import { signMock } from "../services/__mocks__/kms";

import { SyncSignature } from "../services/web3/signatures";
import { handler, CreateFarmBody } from "./createFarm";
import { generateJwt } from "../services/jwt";

describe("api.createFarm", () => {
  it("validates charity is provided", async () => {
    const body = {
      donation: 1,
    } as CreateFarmBody;

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
    ).rejects.toContain('"charity" is required');
  });

  it("validates charity is supported", async () => {
    const body: CreateFarmBody = {
      charity: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
      donation: 1,
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
    ).rejects.toContain('"charity" must be one of ');
  });

  it("requires a minimum donation of 1", async () => {
    const body: CreateFarmBody = {
      charity: "0xBCf9bf2F0544252761BCA9c76Fe2aA18733C48db",
      donation: 0.3,
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
    ).rejects.toContain('"donation" must be greater than or equal to 1');
  });

  it("requires user is on the whitelist", async () => {
    process.env.NETWORK = "mainnet";

    const body: CreateFarmBody = {
      charity: "0xBCf9bf2F0544252761BCA9c76Fe2aA18733C48db",
      donation: 1,
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

  it("creates a farm signature", async () => {
    const signature = "0x0213912";
    signMock.mockReturnValue({ signature });

    const body: CreateFarmBody = {
      charity: "0xBCf9bf2F0544252761BCA9c76Fe2aA18733C48db",
      donation: 1,
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
      donation: "1000000000000000000",
      charity: body.charity,
      signature,
    });
  });
});
