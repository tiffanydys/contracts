import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { soliditySha3 } from "web3-utils";
import { sign } from "../web3/sign";

type Body = {
  charity: string;
  donation: number;
  address: string;
};

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  if (!event.body) {
    throw new Error("No body found in event");
  }

  const body: Body = JSON.parse(event.body);

  if (!body.charity) {
    throw new Error("No charity found in event");
  }

  console.log({ body });
  // Whitelist farms

  // TODO - validate amount

  // SunflowerLand.createFarm function signature
  const shad = soliditySha3(
    {
      type: "address",
      value: body.charity,
    },
    {
      type: "uint",
      value: body.donation as any,
    },
    {
      type: "address",
      value: body.address,
    }
  );
  console.log({ shad });

  const { signature } = sign(shad as string);
  console.log({ signature });

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      signature,
      charity: body.charity,
      donation: body.donation,
    }),
  };
};
