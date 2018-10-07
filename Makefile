BIN=$(shell pwd)/node_modules/.bin

compile: clean
	@echo "  >  Compiling..."
	@$(BIN)/tsc

watch: compile
	@echo "  >  Watching for changes..."
	@yolo -i index.ts -i src -c "make compile"

clean:
	@echo "  >  Cleaning..."
	@rm -rf ./lib
