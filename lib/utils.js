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