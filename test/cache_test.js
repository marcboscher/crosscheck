/*global describe,before,beforeEach,after,it*/
/*jshint expr: true*/
/*jshint immed: false */
"use strict";
var should = require("should"),
  cache = require("../lib/cache");

	// Add global hooks to setup and teardown cache for all tests (in all test files)
	before(function () {
		cache.init("./test-cache");
	});
	after(function () {
		cache.clear();
	});

describe("cache.", function () {
  
	beforeEach(function () {
		cache.clear();
	});

  describe("getLastSync", function () {
		it("must return 0 if managerId is not found", function () {
		  var lastSync;

		  lastSync = cache.getLastSync(111);
		  lastSync.should.be.eql(0);
		}); 

		it("must throw on falsy managerId", function () {
		  (function (){
		  	cache.getLastSync(null);
		  }).should.throw();

		  (function (){
		  	cache.getLastSync(undefined);
		  }).should.throw();
		}); 
  });


  describe("setLastSync", function () {

  	it("must throw on falsy managerId", function () {
		  (function (){
		  	cache.setLastSync(null, 111);
		  }).should.throw();

		  (function (){
		  	cache.setLastSync(undefined, 111);
		  }).should.throw();
		}); 

  	it("must throw on non-numeric timestamps", function () {
		  (function (){
		  	cache.setLastSync(222, "aaa");
		  }).should.throw();
		}); 

		it("must update the cache", function () {
		  var lastSync;
		  
		  cache.setLastSync(333, 333);
		  lastSync = cache.getLastSync(333);
		  lastSync.should.be.eql(333);      
		}); 

		it("must not affect other values in the cache", function () {
		  var lastSync;
		  
		  cache.setLastSync(333, 333);
		  cache.setLastSync(444, 444);
		  lastSync = cache.getLastSync(333);
		  lastSync.should.be.eql(333);

		  lastSync = cache.getLastSync(111);
		  lastSync.should.be.eql(0);
		}); 
  });
  

	describe("clear", function () {
  	it("must empty the cache", function () {
		  var lastSync;
		  
		  cache.setLastSync(111, 111);

		  cache.clear();

		  lastSync = cache.getLastSync(111);
		  lastSync.should.be.eql(0);
		}); 
  });

});
