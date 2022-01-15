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
test: node_modules bin/contracts ## run application and contract tests
	yarn test

.PHONY: test.watch
test.watch: node_modules bin/contracts ## run tests in watch mode
	yarn test --watch

.PHONY: start
start: node_modules ## start sst live development
	yarn start

.PHONY: build
build: node_modules ## sst build
	yarn build

.PHONY: deploy
deploy: node_modules ## sst deploy
	yarn deploy

.PHONY: remove
remove: node_modules ## sst remove
	yarn remove
