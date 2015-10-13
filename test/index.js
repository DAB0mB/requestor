var Chai = require("chai");
var SinonChai = require("sinon-chai");

// plugins
Chai.use(SinonChai);

// tests
require("./utils.test");
require("./model-requestor.test");
require("./collection-requestor.test");