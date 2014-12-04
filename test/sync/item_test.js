/*global describe,it*/
'use strict';
var sync = require("../../lib/sync/item"),
  item = require("../../lib/item"),
  comment = require("../../lib/comment"),
  cache = require("../../lib/cache"),
  should = require("should");

describe("sync/item", function () {
  describe("diff", function () {
    it("ignores asana items with a github number but no matching github item", function () {
      var asanaItems = [
          item.create({
            title : "ignore because no matching github number",
            managerId : "1000",
            fields : {"gh.number" : 1}
          })
        ],
        gitHubItems = [],
        expectedOperations = {
          asana : {
            create : [],
            update : []
          },
          github : {
            create : [],
            update : []
          },
          toDiffComments : []
        };
       
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
        expectedOperations = {
          asana : {
            create : [],
            update : []
          },
          github : {
            create : [asanaItems[0]],
            update : []
          },
          toDiffComments : [] 
        };
       
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
        expectedOperations = {
          asana : {
            create : [gitHubItems[0]],
            update : []
          },
          github : {
            create : [],
            update : []
          },
          toDiffComments : [] 
        };
       
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
        expectedOperations = {
          asana : {
            create : [],
            update : []
          },
          github : {
            create : [],
            update : []
          },
          toDiffComments : [] 
        };
      
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
        expectedOperations = {
          asana : {
            create : [],
            update : [
              {
                oldItem : asanaItems[0],
                newItem : gitHubItems[0]
              }
            ]
          },
          github : {
            create : [],
            update : []
          },
          toDiffComments : [] 
        };
      
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
        expectedOperations = {
          asana : {
            create : [],
            update : []
          },
          github : {
            create : [],
            update : [
              {
                oldItem : gitHubItems[0],
                newItem : asanaItems[0]
              }
            ]
          },
          toDiffComments : [] 
        };
      
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
        expectedOperations = {
          asana : {
            create : [],
            update : []
          },
          github : {
            create : [],
            update : []
          },
          toDiffComments : [
            {
              asanaItem : asanaItems[0],
              gitHubItem : gitHubItems[0]
            }
          ] 
        };
      
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
        expectedOperations = {
          asana : {
            create : [],
            update : []
          },
          github : {
            create : [],
            update : []
          },
          toDiffComments : [
            {
              asanaItem : asanaItems[0],
              gitHubItem : gitHubItems[0]
            }
          ] 
        };
      
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
        expectedOperations = {
          asana : {
            create : [],
            update : []
          },
          github : {
            create : [],
            update : []
          },
          toDiffComments : [
            {
              asanaItem : asanaItems[0],
              gitHubItem : gitHubItems[0]
            }
          ] 
        };
      
      cache.clear();
      cache.setLastSync("1000", 222);
      sync.diff(asanaItems, gitHubItems).should.eql(expectedOperations);
    });
  });

});
