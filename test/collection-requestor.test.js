var Chai = require("chai");
var Nock = require("nock");
var Sinon = require("sinon");
var Requestor = require("..");

var expect = Chai.expect;
var spy = Sinon.spy;

describe("CollectionRequestor class", function() {
  describe("requests", function() {
    before(function() {
      Nock("http://www.dummy.com")
        .put("/entity/id1").reply(200)
        .put("/entity/id2").reply(200)
        .put("/entity/id3").reply(200)
        .get("/entity/period").reply(200)
        .get("/tilda").reply(200);

      var Model = Requestor.Model("Model", {
        urlRoot: "http://www.dummy.com",
        entity: "entity"
      });

      var Collection = Requestor.Collection("Collection", {
        model: Model,

        requests: {
          period: "GET ./period",
          tilda:  "GET ~/tilda"
        }
      });

      this.collection = new Collection(["id1", "id2", "id3"], "id");
    });

    describe("path .", function(done) {
      it("should request urlRoot/entity", function() {
        this.collection.period().then(done);
      });
    });

    describe("path ~", function() {
      it("should request urlRoot", function(done) {
        this.collection.tilda().then(done);
      });
    });

    describe("model requests", function() {
      it("should request each model", function(done) {
        this.collection.update().then(done.bind(null, null));
      });
    });
  });
});