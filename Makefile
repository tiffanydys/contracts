.DEFAULT_GOAL := help

bin/contracts: contracts
	@rm -rf $@
	solc -o bin/contracts/ --combined-json abi,bin --bin --abi --include-path node_modules/ --base-path . ./contracts/*.sol

node_modules: package.json
	@yarn
	@mkdir -p $@; touch $@

.PHONY: help
help:
	@grep '^[a-zA-Z]' $(MAKEFILE_LIST) | sort | awk -F ':.*?## ' 'NF==2 {printf "\033[36m  %-25s\033[0m %s\n", $$1, $$2}'

.PHONY: test
test: node_modules bin/contracts ## Run application and contract tests. Run `JEST_OPTS="any jest options" make test` to pass jest options
	yarn test $(JEST_FLAGS)

.PHONY: test.watch
test.watch: node_modules ## Run tests in watch mode. This can also be done with `JEST_OPTS="--watch" make test`
	yarn test --watch

.PHONY: start
start: node_modules ## Starts the local Lambda development environment.
	yarn start

.PHONY: build
build: node_modules ## Build your app and synthesize your stacks. Generates a `.build/` directory with the compiled files and a `.build/cdk.out/` directory with the synthesized CloudFormation stacks.
	yarn build

.PHONY: deploy
deploy: node_modules ## Deploy all your stacks to AWS. Or optionally deploy a specific stack.
	yarn deploy

.PHONY: remove
remove: node_modules ## Remove all your stacks and all of their resources from AWS. Or optionally remove a specific stack.
	yarn remove
