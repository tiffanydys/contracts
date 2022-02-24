import Web3 from "web3";

import { generateMessage, SyncSignature } from "../services/web3/signatures";
import { handler, LoginBody } from "./login";

describe("api.login", () => {
  it("validates address is provided", async () => {
    const body: LoginBody = {
      signature:
        "0x48277e15582f8c51e4b04896af2311ab130b29fb0c023a713c31cacc68b57b8a3ab2b3a3b6402c8d70fb9c56c4fcd37f7666fe1e21f8bd09641b",
      address: "",
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

  it("validates a signature is provided", async () => {
    const body: LoginBody = {
      address: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
      signature: "",
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

  it("requires a valid signature", async () => {
    const body: LoginBody = {
      signature:
        "0xed3ed877f0c5c41d0c464374a9147b41ba332194676df67e556a726129e4849854d32b3f802f4735e983af626b69ed658f4cba19d65a5057871675399d8b50211b",
      address: "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
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

  it("generates a jwt", async () => {
    const address = "0xAcA6b82bd697EDCa9F2fe497D55fd9F787E92e5f";
    const sha = generateMessage({ address });

    const web3 = new Web3(
      new Web3.providers.HttpProvider(process.env.ETH_NETWORK!)
    );

    const { signature } = await web3.eth.accounts.sign(
      sha,
      "0xe25bed314a90ea95134f0936045598867491c4c0ac83b22b7965165d31ef961d"
    );

    const body: LoginBody = {
      address,
      signature,
    };

    const result = (await handler(
      {
        body: JSON.stringify(body),
      } as any,
      {} as any,
      () => {}
    )) as any;

    console.log({ result });
    expect(result.statusCode).toEqual(200);
    expect(JSON.parse(result.body)).toEqual({
      token: expect.any(String),
    });
  });
});
