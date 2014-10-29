/*global describe,it*/
'use strict';
var item = require("../lib/item"),
  crosscheck = require("../lib/crosscheck"),
  should = require("should");

describe("crosscheck.", function () {
  describe("diff", function () {
    it("produces the expected set of operations", function () {
      var asanaItems = [
          item.create({
            title : "ignore because no matching github number",
            fields : {number : 1}
          }),
          item.create({
            title : "create in github because no github number"
          }),
          item.create({
            title : "update in github because has matching numbers but asana most recent",
            body : "asana",
            lastUpdated : 999,
            fields : {number : 2}
          }),
          item.create({
            title : "update in asana because has matching numbers but github most recent",
            body : "asana",
            lastUpdated : 1,
            fields : {number : 3}
          })
        ],
        githubItems = [
          item.create({
            title : "create in asana because not in asana"
          }),
          item.create({
            title : "update in github because has matching numbers but asana most recent",
            body : "github",
            lastUpdated : 1,
            fields : {number : 2}
          }),
          item.create({
            title : "update in asana because has matching numbers but github most recent",
            body : "github",
            lastUpdated : 999,
            fields : {number : 3}
          })
        ],
        expectedOperations = {
          asana : {
            create : [
              item.create({
                title : "create in asana because not in asana"
              })
            ],
            update : [
              {
                oldItem : item.create({
                  title : "update in asana because has matching numbers but github most recent",
                  body : "asana",
                  lastUpdated : 1,
                  fields : {number : 3}
                }),
                newItem : item.create({
                  title : "update in asana because has matching numbers but github most recent",
                  body : "github",
                  lastUpdated : 999,
                  fields : {number : 3}
                })
              }
            ]
          },
          github : {
            create : [
              item.create({
                title : "create in github because no github number"
              })
            ],
            update : [
              {
                oldItem: item.create({
                  title : "update in github because has matching numbers but asana most recent",
                  body : "github",
                  lastUpdated : 1,
                  fields : {number : 2}
                }),
                newItem : item.create({
                  title : "update in github because has matching numbers but asana most recent",
                  body : "asana",
                  lastUpdated : 999,
                  fields : {number : 2}
                })
              }
            ]
          } 
        };
       
      crosscheck.diff(asanaItems, githubItems).should.eql(expectedOperations);
    }); 
  });
  
  describe.skip("sync", function () {
    it("should not fail", function () {
      return crosscheck.sync().then(function () {
        console.log("sync complete");
      });
    });
  });
});
