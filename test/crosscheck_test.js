/*global describe,it*/
'use strict';
var item = require("../lib/item"),
  crosscheck = require("../lib/crosscheck"),
  should = require("should");

describe("crosscheck.", function () {  
  describe.skip("sync", function () {
    it("should not fail", function () {
      return crosscheck.sync().then(function () {
        console.log("sync complete");
      });
    });
  });
});
