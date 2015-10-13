var Chai = require("chai");
var Sinon = require("sinon");
var Utils = require("../lib/utils");

var expect = Chai.expect;
var spy = Sinon.spy;

describe("Utils module", function() {
  describe("array()", function() {
    it("should create an array with the specified length", function() {
      var length = 3;
      var arr = Utils.array(3);

      expect(arr).to.be.an.instanceof(Array);
      expect(arr).to.deep.equal([undefined, undefined, undefined]);
    });
  });

  describe("toArray()", function() {
    it("should convert an array-like object into array", function() {
      var obj = {0: 1, 1: 2, 2: 3, length: 3};
      var arr = Utils.toArray(obj);

      expect(arr).to.be.an.instanceof(Array);
      expect(arr).to.deep.equal([1, 2, 3]);
    });
  });

  describe("capitalize()", function() {
    it("should capitalize string", function() {
      var str = "fooBar";
      var capitalized = Utils.capitalize(str);

      expect(capitalized).to.equal("FooBar");
    });
  });

  describe("identity()", function() {
    it("should create a function which returns the specified result", function() {
      var result = {};
      var fn = Utils.identity(result);
      var actualResult = fn();

      expect(fn).to.be.a("function");
      expect(actualResult).to.equal(result);
    });
  });

  describe("extend()", function() {
    it("should extend given source object with the specified extenstions", function() {
      var dst = {};
      var src = {a: "a", b: "b", c: "c"};
      Utils.extend(dst, src);

      expect(dst).to.deep.equal(src);
    });
  });

  describe("weld()", function() {
    it("should weld object into a newly created object", function() {
      var obj1 = {a: "a", b: "b"};
      var obj2 = {c: "c", d: "d"};
      var obj = Utils.weld(obj1, obj2);

      expect(obj).to.not.equal(obj1);
      expect(obj).to.not.equal(obj2);
      expect(obj).to.deep.equal({a: "a", b: "b", c: "c", d: "d"});
    });
  });

  describe("nameFn()", function() {
    it("should return a newly created function with the specified name and context", function() {
      var fn = spy();
      var name = "namedFn";
      var namedFn = Utils.nameFn(name, fn);
      namedFn();

      expect(namedFn).to.be.a("function");
      expect(namedFn.name).to.equal(name);
      expect(fn).to.have.been.called.calledOnce;
    });
  });
});