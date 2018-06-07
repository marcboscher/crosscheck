/*global describe,before,after,it*/
/*jshint expr: true*/
"use strict";
var conf = require("../../lib/conf"),
  userModule = require("../../lib/github/user"),
  record = require('../record'),
  should = require("should"),
  _ = require("lodash");


describe("github.user", function () {
  describe("getAuthenticatedUser", function () {

  	var recorder = record('github/user.getAuthenticatedUser');
    after(recorder.after);

    it("returns a user", function () {
        recorder.before();
    	return userModule.getAuthenticatedUser()
    	.then(function (user) {
    		user.name.should.eql("Marc Boscher");
    	}); 
    });
  });
});