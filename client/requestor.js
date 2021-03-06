(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Requestor = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{"./requestor":4,"./utils":5}],2:[function(require,module,exports){
var Requestor = require("./requestor");
var ModelRequestor = require("./model-requestor");
var CollectionRequestor = require("./collection-requestor");

Requestor.Model = ModelRequestor;
Requestor.Collection = CollectionRequestor;

module.exports = Requestor;
},{"./collection-requestor":1,"./model-requestor":3,"./requestor":4}],3:[function(require,module,exports){
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
},{"./requestor":4,"./utils":5}],4:[function(require,module,exports){
(function (global){
var Boom = (typeof window !== "undefined" ? window['Boom'] : typeof global !== "undefined" ? global['Boom'] : null);
var Promise = (typeof window !== "undefined" ? window['Promise'] : typeof global !== "undefined" ? global['Promise'] : null);
var Request = (typeof window !== "undefined" ? window['Request'] : typeof global !== "undefined" ? global['Request'] : null);
var Utils = require("./utils");

function Requestor(dependencyIds) {}

Requestor.prototype._initRequests = function(requests) {
  Object.keys(requests).forEach(function(action) {
    var path = requests[action];
    var pathSplit = path.split(/\s+/);
    var method = pathSplit[0];
    var suburl = pathSplit[1];
    this[action] = this[action] || this._createRequest(action, method, suburl);
  }, this);
};

Requestor.prototype._createRequestPromise = function(action, method, suburl, data) {
  var that = this;
  var navchar = suburl.split("/")[0];
  var name = Utils.capitalize(action);
  var onInject = (this["on" + name + "Request"] || Utils.identity()).bind(this);
  var parseData = (this["parse" + name + "Data"] || Utils.identity()).bind(this);
  data = parseData(data);

  return new Promise(function(resolve, reject) {
    var url = that._composeUrl(suburl, navchar);
    var response = that._createResponse(resolve, reject, onInject);
    that.request(method, url, data, response);
  });
};

Requestor.prototype._createResponse = function(resolve, reject, onInject) {
  return function(err, result) {
    if (err) return reject(err);
    onInject(result);
    resolve(result);
  };
};

Requestor.prototype.request = function() {
  var requestHandler;

  try {
    requestHandler = window && this._clientRequest;
  }
  catch (dummy) {
    requestHandler = this._serverRequest;
  }

  requestHandler.apply(this, arguments);
};

Requestor.prototype._clientRequest = function(method, url, data, callback) {
  $.ajax({
    method: method,
    url: url,
    data: data,
    dataType: "json",
    success: function(result) {
      callback(null, result);
    },
    error: function(xhr) {
      var err = Error(xhr.responseText);
      callback(err);
    }
  });
};

Requestor.prototype._serverRequest = function(method, url, data, callback) {
  var qs, body;

  if (method == "get")
    qs = data;
  else
    body = data;

  var config = {
    method: method,
    url: url,
    qs: qs,
    body: body,
    json: true
  };

  Request(config, function(err, response, body) {
    if (err) return callback(err);
    var statusCode = response.statusCode;

    if (statusCode != 200)
      err = Boom.create(statusCode);

    callback(err, body);
  });
};

Requestor.defineRequestMethod = function(method) {
  Requestor.prototype.request = method;
};

Requestor.inherit = function(EntityRequestor, name, proto) {
  var NewRequestor = Utils.nameFn(name, function() {
    EntityRequestor.apply(this, arguments);
  });

  var newProto = Object.create(EntityRequestor.prototype);
  NewRequestor.prototype = newProto;
  Utils.extend(newProto, proto);

  newProto.constructor = NewRequestor;
  newProto.requests = newProto.requests || {};

  var requests = newProto._getRequestsManifest();
  newProto._initRequests(requests);

  return NewRequestor;
};

module.exports = Requestor;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./utils":5}],5:[function(require,module,exports){
var array = function(length) {
  return Array.apply(null, {length: length});
};

var toArray = function(obj) {
  return [].slice.call(obj);
};

var capitalize = function(str) {
  return str.substr(0, 1).toUpperCase() + str.substr(1);
};

var identity = function(result) {
  return function() {
    return result;
  };
};

var weld = function() {
  var objs = [{}].concat(toArray(arguments));
  return extend.apply(null, objs);
};

var extend = function(obj) {
  var extensions = toArray(arguments).slice(1);

  extensions.forEach(function(extension) {
    Object.keys(extension).forEach(function(k) {
      var v = extension[k];
      obj[k] = v;
    });
  });

  return obj;
};

var nameFn = function(name, fn) {
  return eval('(function ' + name + '() {return fn.apply(this, arguments);})');
};

module.exports = {
  array: array,
  toArray: toArray,
  capitalize: capitalize,
  identity: identity,
  weld: weld,
  extend: extend,
  nameFn: nameFn
};
},{}]},{},[2])(2)
});
//# sourceMappingURL=requestor.js.map
