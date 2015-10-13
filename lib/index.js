var Requestor = require("./requestor");
var ModelRequestor = require("./model-requestor");
var CollectionRequestor = require("./collection-requestor");

Requestor.Model = ModelRequestor;
Requestor.Collection = CollectionRequestor;

module.exports = Requestor;