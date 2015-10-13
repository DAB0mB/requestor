var Requestor = require("./requestor");
var Utils = require("./utils");

function ModelRequestor() {
  var dependencyIds, id;

  if (!(this instanceof ModelRequestor))
    return ModelRequestor.inherit.apply(ModelRequestor, arguments);

  if (this.dependency || arguments.length == 2) {
    dependencyIds = arguments[0];
    id = arguments[1];
  }
  else {
    id = arguments[0];
  }

  this.id = id;
  
  if (dependencyIds && dependencyIds.length) {
    var baseDependencyIds = dependencyIds.slice();
    var baseId = baseDependencyIds.pop();
    var base = new this.dependency(baseDependencyIds);
    this.urlRoot = base.url + "/" + baseId;
  }

  this.url = this.urlRoot + "/" + this.entity;
}

ModelRequestor.prototype = Object.create(Requestor.prototype);
ModelRequestor.prototype.constructor = ModelRequestor;
ModelRequestor.prototype.idAttr = "_id";

ModelRequestor.prototype.save = function(attrs) {
  if (this.id)
    this.update(attrs);
  else
    this.create(attrs);
};

ModelRequestor.prototype.onCreateRequest = function(result) {
  this.id = result[this.idAttr];
};

ModelRequestor.prototype.onDestroyRequest = function() {
  delete this.id;
};

ModelRequestor.prototype._defaultRequests = {
  create:  "POST   ..",
  fetch:   "GET    . ",
  update:  "PUT    . ",
  destroy: "DELETE . "
};

ModelRequestor.prototype._getRequestsManifest = function() {
  return Utils.weld(this._defaultRequests, this.requests);
};

ModelRequestor.prototype._createRequest = function(action, method, suburl) {
  return function(data) {
    return this._createRequestPromise(action, method, suburl, data);
  };
};

ModelRequestor.prototype._composeUrl = function(suburl, navchar) {
  switch (navchar) {
    case "~": return suburl.replace(navchar, this.urlRoot);
    case "..": return suburl.replace(navchar, this.url);
    case ".": return suburl.replace(navchar, this.url + "/" + this.id);
  }
};

ModelRequestor.inherit = function(name, proto) {
  return Requestor.inherit(ModelRequestor, name, proto);
};

module.exports = ModelRequestor;