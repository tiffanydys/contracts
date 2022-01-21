import * as sst from "@serverless-stack/resources";

export default class ApiStack extends sst.Stack {
  constructor(scope: sst.App, id: string, props?: sst.StackProps) {
    super(scope, id, props);

    const api = new sst.Api(this, "Api", {
      routes: {
        "POST    /farm": {
          handler: "src/api/createFarm.handler",
          bundle: {
            externalModules: ["electron"],
          },
        },
        "POST    /actions": {
          handler: "src/api/actions.handler",
          bundle: {
            externalModules: ["electron"],
          },
        },
        "POST    /session": {
          handler: "src/api/session.handler",
          bundle: {
            externalModules: ["electron"],
          },
        },
        "POST    /save": {
          handler: "src/api/save.handler",
          bundle: {
            externalModules: ["electron"],
          },
        },
      },
    });

    this.addOutputs({
      ApiEndpoint: api.url,
    });
  }
}
