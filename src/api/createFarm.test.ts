import { signMock } from "../services/__mocks__/kms";

import { SyncSignature } from "../web3/signatures";
import { handler, CreateFarmBody } from "./createFarm";

describe("api.createFarm", () => {
  it("validates address is provided", async () => {
    const body: CreateFarmBody = {
      address: "",
      charity: "0x060697E9d4EEa886EbeCe57A974Facd53A40865B",
      donation: 1,
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
    ).rejects.toContain('"address" is not allowed to be empty');
  });

  it("validates charity is provided", async () => {
    const body = {
      address: "0x9123",
      donation: 1,
    } as CreateFarmBody;

    const result = handler(
      {
        body: JSON.stringify(body),
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
      address: "0x9123",
      charity: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
      donation: 1,
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
    ).rejects.toContain('"charity" must be one of ');
  });

  it("requires a minimum donation of 1", async () => {
    const body: CreateFarmBody = {
      address: "0x9123",
      charity: "0x060697E9d4EEa886EbeCe57A974Facd53A40865B",
      donation: 0.3,
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
    ).rejects.toContain('"donation" must be greater than or equal to 1');
  });

  it("requires user is on the whitelist", async () => {
    const body: CreateFarmBody = {
      address: "0x9123",
      charity: "0x060697E9d4EEa886EbeCe57A974Facd53A40865B",
      donation: 1,
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
    ).rejects.toContain("Not on whitelist");
  });

  it("creates a farm signature", async () => {
    const signature = "0x0213912";
    signMock.mockReturnValue({ signature });

    const body: CreateFarmBody = {
      address: "0xD755984F4A5D885919451eD25e1a854daa5086C9",
      charity: "0x060697E9d4EEa886EbeCe57A974Facd53A40865B",
      donation: 1,
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
      donation: "1000000000000000000",
      charity: body.charity,
      signature,
    });
  });
});
