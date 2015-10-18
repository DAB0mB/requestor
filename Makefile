browserify:
	browserify lib/index.js --standalone Requestor --debug | exorcist client/requestor.js.map > client/requestor.js
	uglifyjs client/requestor.js --in-source-map client/requestor.js.map --source-map client/requestor.min.js.map > client/requestor.min.js

test:
	mocha "test/index.js" --timeout 2000

.PHONY: test