import * as sst from "@serverless-stack/resources";

export default class ApiStack extends sst.Stack {
  constructor(scope: sst.App, id: string, props?: sst.StackProps) {
    super(scope, id, props);

    const table = new sst.Table(this, "Farms", {
      fields: {
        id: sst.TableFieldType.NUMBER,
        sessionId: sst.TableFieldType.STRING,
        updatedAt: sst.TableFieldType.STRING,
        createdAt: sst.TableFieldType.STRING,
        createdBy: sst.TableFieldType.STRING,
        updatedBy: sst.TableFieldType.STRING,
        state: sst.TableFieldType.STRING,
        oldFarm: sst.TableFieldType.STRING,
      },
      primaryIndex: { partitionKey: "id" },
    });

    const api = new sst.Api(this, "Api", {
      routes: {
        "POST    /farm": {
          handler: "src/api/createFarm.handler",
          bundle: {
            externalModules: ["electron"],
          },
          environment: {
            tableName: table.dynamodbTable.tableName,
          },
        },
        "POST    /actions": {
          handler: "src/api/actions.handler",
          bundle: {
            externalModules: ["electron"],
          },
          environment: {
            tableName: table.dynamodbTable.tableName,
          },
        },
        "POST    /session": {
          handler: "src/api/session.handler",
          bundle: {
            externalModules: ["electron"],
          },
          environment: {
            tableName: table.dynamodbTable.tableName,
          },
        },
        "POST    /save": {
          handler: "src/api/save.handler",
          bundle: {
            externalModules: ["electron"],
          },
          environment: {
            tableName: table.dynamodbTable.tableName,
          },
        },
      },
    });

    api.attachPermissions([table]);

    this.addOutputs({
      ApiEndpoint: api.url,
    });
  }
}
