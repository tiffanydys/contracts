import ApiStack from "./ApiStack";
import * as sst from "@serverless-stack/resources";

export default function main(app: sst.App): void {
  app.setDefaultFunctionProps({
    runtime: "nodejs14.x",
  });

  new ApiStack(app, "sunflower-land-api");
}
