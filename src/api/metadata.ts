import { APIGatewayProxyHandlerV2 } from "aws-lambda";

/**
 * Handler which handles NFT metadata
 * E.g. https://api.sunflower-land.com/metadata/farm/1
 */
export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const id = event?.pathParameters?.id;
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      description: `Land which is used to play at Sunflower Land. You can visit this farm at https://sunflower-land.com/play?farmId=${id}`,
      external_url: `https://sunflower-land.com/play?farmId=${id}`,
      image: "https://sunflower-land.com/testnet/farms/farm.png",
      name: `Sunflower Land #${id}`,
      attributes: [],
    }),
  };
};
