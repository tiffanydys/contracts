import * as sst from "@serverless-stack/resources";

export default class ApiStack extends sst.Stack {
  constructor(scope: sst.App, id: string, props?: sst.StackProps) {
    super(scope, id, props);

    const api = new sst.Api(this, "Api", {
      routes: {
        "GET /": "src/index.handler",
      }
    });

    this.addOutputs({
      "ApiEndpoint": api.url,
    });
  }
}
