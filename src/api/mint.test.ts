import AWSMock from "aws-sdk-mock";
import AWS from "aws-sdk";

import { SyncSignature } from "../web3/signatures";
import { handler, MintBody } from "./mint";

describe("api.mint", () => {
  it("validates item is mintable", async () => {
    const body: MintBody = {
      farmId: 1,
      sender: "0x57",
      signature: "0x9123",
      item: "Christmas Tree",
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
    ).rejects.toContain("must be one of");
  });

  it("requires sender", async () => {
    const body: MintBody = {
      farmId: 1,
      sender: "",
      signature: "0x9123",
      item: "Sunflower Statue",
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
    const body: MintBody = {
      farmId: 1,
      sender: "0x9123",
      signature: "",
      item: "Sunflower Statue",
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
      item: "Sunflower Statue",
      sessionId: "0x123",
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

  it("requires a session ID", async () => {
    const body = {
      sender: "0x9123",
      signature: "0x9123",
      item: "Sunflower Statue",
      sessionId: "",
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
    ).rejects.toContain('"sessionId" is not allowed to be empty');
  });

  it("requires a valid signature", async () => {
    const body: MintBody = {
      sender: "0x9123",
      signature:
        "0x48277e15582f8c51e4b04896af2311ab130b29fb0c023a713c31cacc68b57b8a3ab2b3a3b6402c181d311e96252f8d70fb9c56c4fcd37f7666fe1e21f8bd09641b",
      item: "Sunflower Statue",
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

  it.only("mints an item", async () => {
    process.env.tableName = "Farm";
    AWSMock.setSDKInstance(AWS);
    AWSMock.mock(
      "DynamoDB",
      "getItem",
      (params: GetItemInput, callback: Function) => {
        console.log("DynamoDB", "getItem", "mock called");
        callback(null, { pk: "foo", sk: "bar" });
      }
    );

    const body: MintBody = {
      sender: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
      signature:
        "0x48277e15582f8c51e4b04896af2311ab130b29fb0c023a713c31cacc68b57b8a3ab2b3a3b6402c181d311e96252f8d70fb9c56c4fcd37f7666fe1e21f8bd09641b",
      item: "Sunflower Statue",
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
    ).rejects.toContain('"Unable to verify account');
  });
});
