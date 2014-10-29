/*global describe,it*/
/*jshint expr: true*/
'use strict';
var conf = require("../lib/conf"),
  _ = require("lodash"),
  should = require("should");
  
describe("conf.", function () {
  describe("get", function () {
    it("returns an object", function () {
      //console.log(conf.get());
      conf.get().should.be.an.object;
    });
    
  });
  
  describe("overrideDefaults", function () {
    it("gets the defaults and overrides", function () {
      conf.overrideDefaults({"conf_test": "test"});
      conf.get("conf_test").should.eql("test");
      _.keys(conf.get()).length.should.be.greaterThan(1);
    });
    
  });
  
});
   