import * as sst from "@serverless-stack/resources";

export default class ApiStack extends sst.Stack {
  constructor(scope: sst.App, id: string, props?: sst.StackProps) {
    super(scope, id, props);

    const sessionTable = new sst.Table(this, "Farms", {
      fields: {
        owner: sst.TableFieldType.STRING,
        id: sst.TableFieldType.NUMBER,
        sessionId: sst.TableFieldType.STRING,
        updatedAt: sst.TableFieldType.STRING,
        createdAt: sst.TableFieldType.STRING,
        gameState: sst.TableFieldType.STRING,
        previousGameState: sst.TableFieldType.STRING,
      },
      primaryIndex: { partitionKey: "owner", sortKey: "id" },
    });

    const web3EnvironmentVariables = {
      NETWORK: process.env.NETWORK as string,
      ALCHEMY_KEY: process.env.ALCHEMY_KEY as string,
      TOKEN_ADDRESS: process.env.TOKEN_ADDRESS as string,
      FARM_ADDRESS: process.env.FARM_ADDRESS as string,
      INVENTORY_ADDRESS: process.env.INVENTORY_ADDRESS as string,
      SFF_TOKEN_ADDRESS: process.env.SFF_TOKEN_ADDRESS as string,
      SFF_FARM_ADDRESS: process.env.SFF_FARM_ADDRESS as string,
      KMS_KEY_ID: process.env.KMS_KEY_ID as string,
    };

    const api = new sst.Api(this, "Api", {
      routes: {
        "POST    /farm": {
          handler: "src/api/createFarm.handler",
          bundle: {
            externalModules: ["electron"],
          },
          environment: {
            tableName: sessionTable.dynamodbTable.tableName,
            ...web3EnvironmentVariables,
          },
        },
        "POST    /autosave": {
          handler: "src/api/autosave.handler",
          bundle: {
            externalModules: ["electron"],
          },
          environment: {
            tableName: sessionTable.dynamodbTable.tableName,
          },
        },
        "POST    /session": {
          handler: "src/api/session.handler",
          bundle: {
            externalModules: ["electron"],
          },
          environment: {
            tableName: sessionTable.dynamodbTable.tableName,
            ...web3EnvironmentVariables,
          },
        },
        "POST    /sync": {
          handler: "src/api/sync.handler",
          bundle: {
            externalModules: ["electron"],
          },
          environment: {
            tableName: sessionTable.dynamodbTable.tableName,
            ...web3EnvironmentVariables,
          },
        },
        "POST    /mint": {
          handler: "src/api/mint.handler",
          bundle: {
            externalModules: ["electron"],
          },
          environment: {
            tableName: sessionTable.dynamodbTable.tableName,
            ...web3EnvironmentVariables,
          },
        },
        "POST    /withdraw": {
          handler: "src/api/withdraw.handler",
          bundle: {
            externalModules: ["electron"],
          },
          environment: {
            tableName: sessionTable.dynamodbTable.tableName,
            ...web3EnvironmentVariables,
          },
        },
      },
    });

    api.attachPermissions([sessionTable]);

    this.addOutputs({
      ApiEndpoint: api.url,
    });
  }
}
