import { SyncSignature } from "../web3/signatures";
import { handler, MintBody } from "./mint";

describe("api.createFarm", () => {
  it("validates item is mintable", async () => {
    const body: MintBody = {
      farmId: 1,
      sender: "0x57",
      signature: "0x9123",
      item: "Christmas Tree",
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
    ).rejects.toContain("must be one of");
  });

  it("requires sender", async () => {
    const body: MintBody = {
      farmId: 1,
      sender: "",
      signature: "0x9123",
      item: "Sunflower Statue",
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
    const body: MintBody = {
      farmId: 1,
      sender: "0x9123",
      signature: "",
      item: "Sunflower Statue",
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
      item: "Sunflower Statue",
    } as MintBody;

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
});
