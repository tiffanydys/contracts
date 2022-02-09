import { signMock } from "../services/__mocks__/kms";

import { SyncSignature } from "../services/web3/signatures";
import { handler, CreateFarmBody } from "./createFarm";

describe("api.createFarm", () => {
  it("validates address is provided", async () => {
    const body: CreateFarmBody = {
      signature:
        "0x48277e15582f8c51e4b04896af2311ab130b29fb0c023a713c31cacc68b57b8a3ab2b3a3b6402c8d70fb9c56c4fcd37f7666fe1e21f8bd09641b",
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
      signature:
        "0x48277e15582f8c51e4b04896af2311ab130b29fb0c023a713c31cacc68b57b8a3ab2b3a3b6402c8d70fb9c56c4fcd37f7666fe1e21f8bd09641b",
      address: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
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
      signature:
        "0x48277e15582f8c51e4b04896af2311ab130b29fb0c023a713c31cacc68b57b8a3ab2b3a3b6402c8d70fb9c56c4fcd37f7666fe1e21f8bd09641b",
      address: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
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
      signature:
        "0x48277e15582f8c51e4b04896af2311ab130b29fb0c023a713c31cacc68b57b8a3ab2b3a3b6402c8d70fb9c56c4fcd37f7666fe1e21f8bd09641b",
      address: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
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

  it("requires a valid signature", async () => {
    const body: CreateFarmBody = {
      signature:
        "0xed3ed877f0c5c41d0c464374a9147b41ba332194676df67e556a726129e4849854d32b3f802f4735e983af626b69ed658f4cba19d65a5057871675399d8b50211b",
      address: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
      charity: "0x060697E9d4EEa886EbeCe57A974Facd53A40865B",
      donation: 1.3,
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

  it("requires user is on the whitelist", async () => {
    process.env.NETWORK = "mainnet";

    const body: CreateFarmBody = {
      address: "0xf199968e2Aa67c3f8eb5913547DD1f9e9A578798",
      signature:
        "0x81b61c8d9da5117a7ce8fed7666be0d76b683a3838f6d28916961d1edfc27d35422fe75a60733df4d3843d0e93d4736064b0438c4b37dd2f86425fbb2574ec461c",
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
      address: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
      signature:
        "0x48277e15582f8c51e4b04896af2311ab130b29fb0c023a713c31cacc68b57b8a3ab2b3a3b6402c181d311e96252f8d70fb9c56c4fcd37f7666fe1e21f8bd09641b",
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
