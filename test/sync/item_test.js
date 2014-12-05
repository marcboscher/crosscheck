/*global describe,it*/
'use strict';
var sync = require("../../lib/sync/item"),
  opsModule = require("../../lib/sync/ops"),
  item = require("../../lib/item"),
  comment = require("../../lib/comment"),
  cache = require("../../lib/cache"),
  should = require("should");

describe("sync/item", function () {
  describe("diff", function () {
    it("deletes asana items with a github number but no matching github item", function () {
      var asanaItems = [
          item.create({
            title : "delete because no matching github number",
            managerId : "1000",
            fields : {"gh.number" : 1}
          })
        ],
        gitHubItems = [],
        expectedOperations = opsModule.create({
          asana : {
            parent : null,
            create : [],
            update : [],
            del : [asanaItems[0]]
          }
        });
       
      sync.diff(asanaItems, gitHubItems).should.eql(expectedOperations);
    }); 

    it("creates items in github", function () {
      var asanaItems = [
          item.create({
            title : "create in github because no github number",
            managerId : "1000"
          })
        ],
        gitHubItems = [],
        expectedOperations = opsModule.create({
          github : {
            parent : null,
            create : [asanaItems[0]],
            update : [],
            del : []
          }
        });
       
      sync.diff(asanaItems, gitHubItems).should.eql(expectedOperations);
    });


    it("creates items in asana", function () {
      var asanaItems = [
        ],
        gitHubItems = [
          item.create({
            title : "create in asana because not in asana"
          })
        ],
        expectedOperations = opsModule.create({
          asana : {
            parent : null,
            create : [gitHubItems[0]],
            update : [],
            del : []
          }
        });
       
      sync.diff(asanaItems, gitHubItems).should.eql(expectedOperations);
    });

    it("updates nothing if item contents are identical", function () {
      var asanaItems = [
          item.create({
            title : "update in asana",
            managerId : "1000",
            body : "identical",
            lastUpdated : 111,
            fields : {"gh.number" : 2}
          })
        ],
        gitHubItems = [
          item.create({
            title : "update in asana",
            body : "identical",
            lastUpdated : 222,
            fields : {"gh.number" : 2}
          })
        ],
        expectedOperations = opsModule.create();
      
      cache.clear();
      cache.setLastSync("1000", 999);
      sync.diff(asanaItems, gitHubItems).should.eql(expectedOperations);
    });

    it("updates item in asana because github is most recent", function () {
      var asanaItems = [
          item.create({
            title : "update in asana",
            managerId : "1000",
            body : "asana",
            lastUpdated : 111,
            fields : {"gh.number" : 2}
          })
        ],
        gitHubItems = [
          item.create({
            title : "update in asana",
            body : "github",
            lastUpdated : 222,
            fields : {"gh.number" : 2}
          })
        ],
        expectedOperations = opsModule.create({
          asana : {
            parent : null,
            create : [],
            update : [
              {
                old : asanaItems[0],
                nue : gitHubItems[0]
              }
            ],
            del : []
          }
        });
      
      cache.clear();
      cache.setLastSync("1000", 999);
      sync.diff(asanaItems, gitHubItems).should.eql(expectedOperations);
    });

    it("updates item in github because asana is most recent", function () {
      var asanaItems = [
          item.create({
            title : "update in github",
            managerId : "1000",
            body : "asana",
            lastUpdated : 222,
            fields : {"gh.number" : 2}
          })
        ],
        gitHubItems = [
          item.create({
            title : "update in github",
            body : "github",
            lastUpdated : 111,
            fields : {"gh.number" : 2}
          })
        ],
        expectedOperations = opsModule.create({
          github : {
            parent : null,
            create : [],
            update : [
              {
                old : gitHubItems[0],
                nue : asanaItems[0]
              }
            ],
            del : []
          }
        });
      
      cache.clear();
      cache.setLastSync("1000", 999);
      sync.diff(asanaItems, gitHubItems).should.eql(expectedOperations);
    });

    it("flags items for comment sync if not in lastSync cache", function () {
      var asanaItems = [
          item.create({
            title : "New comments",
            managerId : "1000",
            body : "identical",
            lastUpdated : 222,
            fields : {"gh.number" : 2}
          })
        ],
        gitHubItems = [
          item.create({
            title : "New comments",
            body : "identical",
            lastUpdated : 111,
            fields : {"gh.number" : 2}
          })
        ],
        expectedOperations = opsModule.create({
          toDiffChildren : [
            {
              asana : asanaItems[0],
              github : gitHubItems[0]
            }
          ] 
        });
      
      cache.clear();
      sync.diff(asanaItems, gitHubItems).should.eql(expectedOperations);
    });

    it("flags items for comment sync if lastSync is older for both", function () {
      var asanaItems = [
          item.create({
            title : "New comments",
            managerId : "1000",
            body : "identical",
            lastUpdated : 333,
            fields : {"gh.number" : 2}
          })
        ],
        gitHubItems = [
          item.create({
            title : "New comments",
            body : "identical",
            lastUpdated : 222,
            fields : {"gh.number" : 2}
          })
        ],
        expectedOperations = opsModule.create({
          toDiffChildren : [
            {
              asana : asanaItems[0],
              github : gitHubItems[0]
            }
          ] 
        });
      
      cache.clear();
      cache.setLastSync("1000", 1);
      sync.diff(asanaItems, gitHubItems).should.eql(expectedOperations);
    });

    it("flags items for comment sync if lastSync is older for one", function () {
      var asanaItems = [
          item.create({
            title : "New comments",
            managerId : "1000",
            body : "identical",
            lastUpdated : 333,
            fields : {"gh.number" : 2}
          })
        ],
        gitHubItems = [
          item.create({
            title : "New comments",
            body : "identical",
            lastUpdated : 111,
            fields : {"gh.number" : 2}
          })
        ],
        expectedOperations = opsModule.create({
          toDiffChildren : [
            {
              asana : asanaItems[0],
              github : gitHubItems[0]
            }
          ] 
        });
      
      cache.clear();
      cache.setLastSync("1000", 222);
      sync.diff(asanaItems, gitHubItems).should.eql(expectedOperations);
    });
  });

});
