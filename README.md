# Sunflower Land API

This API is used for players in Sunflower Land.

It handles saving actions, loading farms and verifiying transactions (save and withdraw to Polygon Blockchain)

# Getting Started with this repo

This project was bootstrapped with [Create Serverless Stack](https://docs.serverless-stack.com/packages/create-serverless-stack).

Start by installing the dependencies.

```bash
$ yarn
```

Ensure you have your AWS credentials set up correctly in `~/.aws/config` - This will be used to deploy live debug environment to develop in.

https://serverless-stack.com/chapters/configure-the-aws-cli.html

## Commands

### `yarn run start`

Starts the local Lambda development environment.

### `yarn run build`

Build your app and synthesize your stacks.

Generates a `.build/` directory with the compiled files and a `.build/cdk.out/` directory with the synthesized CloudFormation stacks.

### `yarn run deploy [stack]`

Deploy all your stacks to AWS. Or optionally deploy a specific stack.

### `yarn run remove [stack]`

Remove all your stacks and all of their resources from AWS. Or optionally remove a specific stack.

### `yarn run test`

Runs your tests using Jest. Takes all the [Jest CLI options](https://jestjs.io/docs/en/cli).
