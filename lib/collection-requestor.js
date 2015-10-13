var Requestor = require("./requestor");
var Utils = require("./utils");

function CollectionRequestor() {
  var dependencyIds, ids;

  if (!(this instanceof CollectionRequestor))
    return CollectionRequestor.inherit.apply(CollectionRequestor, arguments);

  if (this.dependency) {
    dependencyIds = arguments[0];
    ids = arguments[1];    
  }
  else {
    ids = arguments[0];
  }

  this.models = ids.map(function(id) {
    id = id instanceof Requestor ? id.id : id;
    return new this.model(dependencyIds, id);
  }, this);

  var buildModel = new this.model(dependencyIds);
  this.urlRoot = buildModel.urlRoot;
  this.url = buildModel.url;
}

CollectionRequestor.prototype = Object.create(Requestor.prototype);
CollectionRequestor.prototype.constructor = CollectionRequestor;

CollectionRequestor.prototype.create = function(docsNum, attrs) {
  var that = this;
  var models = [];

  var promises = Utils.array(docsNum).map(function(i) {
    var model = new this.model(this.server, this.dependencyIds);
    models.push(model);
    return model.create(attrs);
  }, this);

  return Promise.all(promises).then(function(results) {
    that.models = models;
    return Promise.resolve(results);
  });
};

CollectionRequestor.prototype.destroy = function() {
  var that = this;

  var promises = this.models.forEach(function(model) {
    return model.destroy();
  });

  return Promise.all(promises).then(function(results) {
    delete that.models;
    return Promise.resolve(results);
  });
};

CollectionRequestor.prototype._defaultRequests = {
  fetchAll: "GET .  ",
  fetch:    "GET */.",
  update:   "PUT */."
};

CollectionRequestor.prototype._getRequestsManifest = function() {
  var rawModelRequests = this.model.prototype.requests;

  var modelRequests = Object.keys(rawModelRequests).reduce(function(modelRequests, action) {
    var path = rawModelRequests[action];
    modelRequests[action] = "*/" + path;
    return modelRequests;
  }, {});

  return Utils.weld(
    modelRequests,
    this._defaultRequests,
    this.requests
  );
};

CollectionRequestor.prototype._createRequest = function(action, method, suburl) {
  return function(data) {
    if (suburl[0] != "*")
      return this._createRequestPromise(action, method, suburl, data);

    var promises = this.models.map(function(model) {
      return model[action](data);
    });

    return Promise.all(promises);
  };
};

CollectionRequestor.prototype._composeUrl = function(suburl, navchar) {
  switch (navchar) {
    case "~": return suburl.replace(navchar, this.urlRoot);
    case ".": return suburl.replace(navchar, this.url);
  }
};

CollectionRequestor.inherit = function(name, proto) {
  return Requestor.inherit(CollectionRequestor, name, proto);
};

module.exports = CollectionRequestor;