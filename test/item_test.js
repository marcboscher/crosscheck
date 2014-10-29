/*global describe,it*/
/*jshint expr: true*/
"use strict";
var should = require("should"),
  item = require("../lib/item");

describe("item.", function () {
  describe("create", function () {
    it("must return a new item", function () {
      var item1 = item.create({"title" : "foo"}), 
        item2 = item.create({"title" : "bar"});
      item1.title.should.be.exactly("foo");
      item2.title.should.be.exactly("bar");
    }); 
  });
  
  describe("compare", function () {
    it("must return 0 for equal objects, even if lastUpdated fields are different", function () {
      var item1 = item.create({"title" : "foo", "lastUpdated" : 111}), 
        item2 = item.create({"title" : "foo", "lastUpdated" : 222});
      item.compare(item1, item2).should.eql(0); 
    }); 
    
    it("must return -1 for unequal objects, where first is more recent", function () {
      var item1 = item.create({"title" : "foo", "lastUpdated" : 333}), 
        item2 = item.create({"title" : "bar", "lastUpdated" : 222});
      item.compare(item1, item2).should.eql(-1); 
    }); 
    
    it("must return 1 for unequal objects, where second is more recent", function () {
      var item1 = item.create({"title" : "foo", "lastUpdated" : 333}), 
        item2 = item.create({"title" : "bar", "lastUpdated" : 444});
      item.compare(item1, item2).should.eql(1); 
    });
    
  });
});
