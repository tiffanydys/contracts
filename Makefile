.DEFAULT_GOAL := help

bin/contracts: contracts
	@rm -rf $@
	solc -o bin/contracts/ --combined-json abi,bin --bin --abi --include-path node_modules/ --base-path . ./contracts/*.sol

.PHONY: help
help:
	@grep '^[a-zA-Z]' $(MAKEFILE_LIST) | sort | awk -F ':.*?## ' 'NF==2 {printf "\033[36m  %-25s\033[0m %s\n", $$1, $$2}'

.PHONY: test
test: bin/contracts ## run application and contract tests
	yarn test