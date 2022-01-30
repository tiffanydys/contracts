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

    const api = new sst.Api(this, "Api", {
      routes: {
        "POST    /farm": {
          handler: "src/api/createFarm.handler",
          bundle: {
            externalModules: ["electron"],
          },
          environment: {
            tableName: sessionTable.dynamodbTable.tableName,
          },
        },
        "POST    /actions": {
          handler: "src/api/actions.handler",
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
          },
        },
        "POST    /save": {
          handler: "src/api/save.handler",
          bundle: {
            externalModules: ["electron"],
          },
          environment: {
            tableName: sessionTable.dynamodbTable.tableName,
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
