.PHONY: all build deploy test blocks check-blockly

all: deploy

build:
	pxt build

deploy:
	pxt deploy

test:
	pxt test

blocks:
	node tools/check-blockly.cjs --write-blocks

check-blockly:
	node tools/check-blockly.cjs --blocks main.blocks
