var Boom = require("boom");
var Promise = require("bluebird");
var Request = require("request");
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