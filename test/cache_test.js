/*global describe,it*/
/*jshint expr: true*/
/*jshint immed: false */
"use strict";
var should = require("should"),
  cache = require("../lib/cache");

describe("cache.", function () {
  
  describe("getLastSync", function () {
  		cache.clear();

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
  	cache.clear();

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
		  
		  cache.setLastSync(444, 444);
		  lastSync = cache.getLastSync(333);
		  lastSync.should.be.eql(333);

		  lastSync = cache.getLastSync(111);
		  lastSync.should.be.eql(0);
		}); 
  });
  

	describe("init", function () {
  	cache.clear();

  	it("must initializa the cache", function () {
		  var lastSync;
		  
		  cache.init({
		  	"111" : 111,
		  	222 : 222
		  });

		  lastSync = cache.getLastSync(111);
		  lastSync.should.be.eql(111);

		  lastSync = cache.getLastSync(222);
		  lastSync.should.be.eql(222);

		  lastSync = cache.getLastSync(333);
		  lastSync.should.be.eql(0);
		}); 
  });


	describe("clear", function () {
  	cache.clear();

  	it("must empty the cache", function () {
		  var lastSync;
		  
		  cache.init({
		  	111 : 111
		  });

		  cache.clear();

		  lastSync = cache.getLastSync(111);
		  lastSync.should.be.eql(0);
		}); 
  });

});
