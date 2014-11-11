/*global describe,it*/
/*jshint expr: true*/
"use strict";
var should = require("should"),
  comment = require("../lib/comment");

describe("comment.", function () {
  describe("create", function () {
    it("must return a new comment", function () {
      var comment1 = comment.create({"body" : "foo"}), 
        comment2 = comment.create({"body" : "bar"});
      comment1.body.should.be.exactly("foo");
      comment2.body.should.be.exactly("bar");
    }); 
  });
  
});
