var Chai = require("chai");
var Nock = require("nock");
var Sinon = require("sinon");
var Requestor = require("..");

var expect = Chai.expect;
var spy = Sinon.spy;

describe("ModelRequestor class", function() {
  describe("requests", function() {
    before(function() {
      Nock("http://www.dummy.com")
        .get("/entity/id/singlePeriod").reply(200)
        .get("/entity/doublePeriod").reply(200)
        .get("/tilda").reply(200);

      var Model = Requestor.Model("Model", {
        urlRoot: "http://www.dummy.com",
        entity: "entity",

        requests: {
          singlePeriod: "GET ./singlePeriod",
          doublePeriod: "GET ../doublePeriod",
          tilda:        "GET ~/tilda"
        }
      });

      this.model = new Model("id");
    });

    describe("path .", function() {
      it("should request urlRoot/entity/id", function(done) {
        this.model.singlePeriod().then(done);
      });
    });

    describe("path ..", function(done) {
      it("should request urlRoot/entity", function() {
        this.model.doublePeriod().then(done);
      });
    });

    describe("path ~", function() {
      it("should request urlRoot", function(done) {
        this.model.tilda().then(done);
      });
    });
  });

  describe("#constructor()", function() {
    it("should compose url from dependencies", function() {
      var Model1 = Requestor.Model("Model1", {
        urlRoot: "http://www.dummy.com",
        entity: "entity1"
      });

      var Model2 = Requestor.Model("Model2", {
        dependency: Model1,
        entity: "entity2"
      });

      var Model3 = Requestor.Model("Model3", {
        dependency: Model2,
        entity: "entity3"
      });

      var requestor = new Model3(["id-1", "id-2"]);
      expect(requestor.url).to.equal("http://www.dummy.com/entity1/id-1/entity2/id-2/entity3");
    });
  });
});