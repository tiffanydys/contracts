import * as sst from "@serverless-stack/resources";
import { CorsHttpMethod } from "@aws-cdk/aws-apigatewayv2";
export default class ApiStack extends sst.Stack {
  constructor(scope: sst.App, id: string, props?: sst.StackProps) {
    super(scope, id, props);

    const sessionTable = new sst.Table(this, "Land", {
      fields: {
        id: sst.TableFieldType.NUMBER,
        sessionId: sst.TableFieldType.STRING,

        createdBy: sst.TableFieldType.STRING,
        createdAt: sst.TableFieldType.STRING,
        updatedAt: sst.TableFieldType.STRING,
        updatedBy: sst.TableFieldType.STRING,

        gameState: sst.TableFieldType.STRING,
        previousGameState: sst.TableFieldType.STRING,

        verifyAt: sst.TableFieldType.STRING,
        flaggedCount: sst.TableFieldType.NUMBER,
        blacklistedAt: sst.TableFieldType.STRING,
      },
      primaryIndex: { partitionKey: "id" },
    });

    const discordUserTable = new sst.Table(this, "DiscordUsers", {
      fields: {
        discordId: sst.TableFieldType.STRING,
        address: sst.TableFieldType.STRING,
        createdAt: sst.TableFieldType.STRING,
      },
      primaryIndex: { partitionKey: "discordId" },
    });

    const bucket = new sst.Bucket(this, "PlayerEvents", {
      s3Bucket: {
        bucketName: `${scope.stage}-player-events`,
      },
    });

    const environmentVariables = {
      NETWORK: process.env.NETWORK as string,
      ALCHEMY_KEY: process.env.ALCHEMY_KEY as string,
      TOKEN_ADDRESS: process.env.TOKEN_ADDRESS as string,
      FARM_ADDRESS: process.env.FARM_ADDRESS as string,
      SESSION_ADDRESS: process.env.SESSION_ADDRESS as string,
      INVENTORY_ADDRESS: process.env.INVENTORY_ADDRESS as string,
      SFF_TOKEN_ADDRESS: process.env.SFF_TOKEN_ADDRESS as string,
      SFF_FARM_ADDRESS: process.env.SFF_FARM_ADDRESS as string,
      KMS_KEY_ID: process.env.KMS_KEY_ID as string,
      RECAPTCHA_KEY: process.env.RECAPTCHA_KEY as string,
      DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID as string,
      DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET as string,
      DISCORD_REDIRECT_URI: process.env.DISCORD_REDIRECT_URI as string,
      JWT_SECRET: process.env.JWT_SECRET as string,

      SESSION_TABLE_NAME: sessionTable.dynamodbTable.tableName,
      DISCORD_USER_TABLE_NAME: discordUserTable.dynamodbTable.tableName,
    };

    const api = new sst.Api(this, "Api", {
      cors: {
        allowOrigins: [
          "http://localhost:3000",
          "https://sunflower-land.com",
          "https://www.sunflower-land.com",
          "https://www.sunflower-land.com",
          "https://opensea.io",
        ],
        allowMethods: [
          CorsHttpMethod.OPTIONS,
          CorsHttpMethod.GET,
          CorsHttpMethod.POST,
        ],
        allowCredentials: true,
        allowHeaders: [
          "Content-Type",
          "Authorization",
          // Our fake bot detection header
          "Cache-Control",
          "X-Fingerprint",
        ],
      },
      routes: {
        "POST    /farm": {
          handler: "src/api/createFarm.handler",
          bundle: {
            externalModules: ["electron"],
          },
          environment: {
            ...environmentVariables,
          },
        },
        "POST    /autosave": {
          handler: "src/api/autosave.handler",
          bundle: {
            externalModules: ["electron"],
          },
          environment: {
            bucketName: bucket.bucketName,
            ...environmentVariables,
          },
        },
        "POST    /session": {
          handler: "src/api/session.handler",
          bundle: {
            externalModules: ["electron"],
          },
          environment: {
            bucketName: bucket.bucketName,
            ...environmentVariables,
          },
        },
        "POST    /sync": {
          handler: "src/api/sync.handler",
          bundle: {
            externalModules: ["electron"],
          },
          environment: {
            bucketName: bucket.bucketName,
            ...environmentVariables,
          },
        },
        "POST    /mint": {
          handler: "src/api/mint.handler",
          bundle: {
            externalModules: ["electron"],
          },
          environment: {
            bucketName: bucket.bucketName,
            ...environmentVariables,
          },
        },
        "POST    /withdraw": {
          handler: "src/api/withdraw.handler",
          bundle: {
            externalModules: ["electron"],
          },
          environment: {
            bucketName: bucket.bucketName,
            ...environmentVariables,
          },
        },
        "POST    /login": {
          handler: "src/api/login.handler",
          bundle: {
            externalModules: ["electron"],
          },
          environment: {
            ...environmentVariables,
          },
        },
        "POST    /oauth": {
          handler: "src/api/oauth.handler",
          bundle: {
            externalModules: ["electron"],
          },
          environment: {
            ...environmentVariables,
          },
        },
        "GET    /nfts/farm/{id}": {
          handler: "src/api/metadata.handler",
          bundle: {
            externalModules: ["electron"],
          },
          environment: {},
        },
      },
    });

    api.attachPermissions([sessionTable, discordUserTable, bucket]);

    this.addOutputs({
      ApiEndpoint: api.url,
    });
  }
}
