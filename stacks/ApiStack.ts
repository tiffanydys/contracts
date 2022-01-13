import * as sst from "@serverless-stack/resources";

export default class MyStack extends sst.Stack {
  constructor(scope: sst.App, id: string, props?: sst.StackProps) {
    super(scope, id, props);

    const api = new sst.ApolloApi(this, "Player", {
      server: {
        handler: "src/index.handler",
        environment: {
          // TODO - environment variable
        },
        bundle: {},
      },
    });
  }
}
