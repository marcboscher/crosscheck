/*global describe,it*/
/*jshint expr: true*/
'use strict';
var conf = require("../lib/conf"),
  _ = require("lodash"),
  should = require("should");
  
describe("conf.", function () {
  describe("get", function () {
    it.skip("returns an object", function () {
      conf.get().should.be.an.object;
    });
  });
  

  describe("reconfigure", function () {
    it("gets the default and overrides it", function () {
      conf.get("asana.keyword").should.eql("aa");
      
      conf.reconfigure({ asana : { keyword : "test" }});
      conf.get("asana.keyword").should.eql("test");

      // Check other configs are unaffected
      conf.get("github.keyword").should.eql("gh"); 

      // Restore
      conf.reconfigure({ asana : { keyword : "aa" }});
      conf.get("asana.keyword").should.eql("aa");
    });

    
  });
  
});
   