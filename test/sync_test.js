/*global describe,it*/
'use strict';
var sync = require("../lib/sync"),
  item = require("../lib/item"),
  comment = require("../lib/comment"),
  cache = require("../lib/cache"),
  should = require("should");

describe("sync.", function () {
  describe("diffItems", function () {
    it("ignores asana items with a github number but no matching github item", function () {
      var asanaItems = [
          item.create({
            title : "ignore because no matching github number",
            managerId : "1000",
            fields : {number : 1}
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
       
      sync.diffItems(asanaItems, gitHubItems).should.eql(expectedOperations);
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
       
      sync.diffItems(asanaItems, gitHubItems).should.eql(expectedOperations);
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
       
      sync.diffItems(asanaItems, gitHubItems).should.eql(expectedOperations);
    });

    it("updates nothing if item contents are identical", function () {
      var asanaItems = [
          item.create({
            title : "update in asana",
            managerId : "1000",
            body : "identical",
            lastUpdated : 111,
            fields : {number : 2}
          })
        ],
        gitHubItems = [
          item.create({
            title : "update in asana",
            body : "identical",
            lastUpdated : 222,
            fields : {number : 2}
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
      sync.diffItems(asanaItems, gitHubItems).should.eql(expectedOperations);
    });

    it("updates item in asana because github is most recent", function () {
      var asanaItems = [
          item.create({
            title : "update in asana",
            managerId : "1000",
            body : "asana",
            lastUpdated : 111,
            fields : {number : 2}
          })
        ],
        gitHubItems = [
          item.create({
            title : "update in asana",
            body : "github",
            lastUpdated : 222,
            fields : {number : 2}
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
      sync.diffItems(asanaItems, gitHubItems).should.eql(expectedOperations);
    });

    it("updates item in github because asana is most recent", function () {
      var asanaItems = [
          item.create({
            title : "update in github",
            managerId : "1000",
            body : "asana",
            lastUpdated : 222,
            fields : {number : 2}
          })
        ],
        gitHubItems = [
          item.create({
            title : "update in github",
            body : "github",
            lastUpdated : 111,
            fields : {number : 2}
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
      sync.diffItems(asanaItems, gitHubItems).should.eql(expectedOperations);
    });

    it("flags items for comment sync if not in lastSync cache", function () {
      var asanaItems = [
          item.create({
            title : "New comments",
            managerId : "1000",
            body : "identical",
            lastUpdated : 222,
            fields : {number : 2}
          })
        ],
        gitHubItems = [
          item.create({
            title : "New comments",
            body : "identical",
            lastUpdated : 111,
            fields : {number : 2}
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
      sync.diffItems(asanaItems, gitHubItems).should.eql(expectedOperations);
    });

    it("flags items for comment sync if lastSync is older for both", function () {
      var asanaItems = [
          item.create({
            title : "New comments",
            managerId : "1000",
            body : "identical",
            lastUpdated : 333,
            fields : {number : 2}
          })
        ],
        gitHubItems = [
          item.create({
            title : "New comments",
            body : "identical",
            lastUpdated : 222,
            fields : {number : 2}
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
      sync.diffItems(asanaItems, gitHubItems).should.eql(expectedOperations);
    });

    it("flags items for comment sync if lastSync is older for one", function () {
      var asanaItems = [
          item.create({
            title : "New comments",
            managerId : "1000",
            body : "identical",
            lastUpdated : 333,
            fields : {number : 2}
          })
        ],
        gitHubItems = [
          item.create({
            title : "New comments",
            body : "identical",
            lastUpdated : 111,
            fields : {number : 2}
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
      sync.diffItems(asanaItems, gitHubItems).should.eql(expectedOperations);
    });
  });


// *******************************************************************

  describe("diffComments", function () {
    it("creates comments in github", function () {
      var asanaComments = [
          comment.create({
            body : "create in github",
            fields : {as_id : "1"}
          })
        ],
        gitHubComments = [],
        expectedOperations = {
          asana : {
            create : [],
            update : [],
            del : []
          },
          github : {
            create : [asanaComments[0]],
            update : [],
            del : []
          } 
        };
       
      sync.diffComments(asanaComments, gitHubComments).should.eql(expectedOperations);
    });


    it("creates comments in asana", function () {
      var asanaComments = [],
        gitHubComments = [
          comment.create({
            body : "create in asana",
            fields : {gh_id : "1"}
          })
        ],
        expectedOperations = {
          asana : {
            create : [gitHubComments[0]],
            update : [],
            del : []
          },
          github : {
            create : [],
            update : [],
            del : []
          } 
        };

      sync.diffComments(asanaComments, gitHubComments).should.eql(expectedOperations);
    });

    it("updates nothing if comments are identical", function () {
      var asanaComments = [
          comment.create({
            body : "update in asana - identical",
            lastUpdated : 1,
            fields : {as_id : "1", foo : "bar"}
          })
        ],
        gitHubComments = [
          comment.create({
            body : "update in asana - identical",
            lastUpdated : 3,
            fields : {as_id : "1", baz : "quz"}
          })
        ],
        expectedOperations = {
          asana : {
            create : [],
            update : [],
            del : []
          },
          github : {
            create : [],
            update : [],
            del : []
          } 
        };

      sync.diffComments(asanaComments, gitHubComments).should.eql(expectedOperations);
    });


    it("updates comment (originally created in asana) in asana if github is more recent", function () {
      var asanaComments = [
          comment.create({
            body : "update in asana - asana",
            lastUpdated : 1,
            fields : {as_id : "1"}
          })
        ],
        gitHubComments = [
          comment.create({
            body : "update in asana - github",
            lastUpdated : 3,
            fields : {as_id : "1"}
          })
        ],
        expectedOperations = {
          asana : {
            create : [],
            update : [
              {
                old : asanaComments[0],
                nue : gitHubComments[0]
              }
            ],
            del : []
          },
          github : {
            create : [],
            update : [],
            del : []
          } 
        };

      sync.diffComments(asanaComments, gitHubComments).should.eql(expectedOperations);
    });


    it("updates comment (originally created in asana) in github if asana is more recent", function () {
      var asanaComments = [
          comment.create({
            body : "update in github - asana",
            lastUpdated : 3,
            fields : {as_id : "1"}
          })
        ],
        gitHubComments = [
          comment.create({
            body : "update in github - github",
            lastUpdated : 1,
            fields : {as_id : "1"}
          })
        ],
        expectedOperations = {
          asana : {
            create : [],
            update : [],
            del : []
          },
          github : {
            create : [],
            update : [
              {
                old : gitHubComments[0],
                nue : asanaComments[0]
              }
            ],
            del : []
          } 
        };

      sync.diffComments(asanaComments, gitHubComments).should.eql(expectedOperations);
    });

    it("updates comment (originally created in github) in asana if github is more recent", function () {
      var asanaComments = [
          comment.create({
            body : "update in asana - asana",
            lastUpdated : 1,
            fields : {gh_id : "1"}
          })
        ],
        gitHubComments = [
          comment.create({
            body : "update in asana - github",
            lastUpdated : 3,
            fields : {gh_id : "1"}
          })
        ],
        expectedOperations = {
          asana : {
            create : [],
            update : [
              {
                old : asanaComments[0],
                nue : gitHubComments[0]
              }
            ],
            del : []
          },
          github : {
            create : [],
            update : [],
            del : []
          } 
        };

      sync.diffComments(asanaComments, gitHubComments).should.eql(expectedOperations);
    });


    it("updates comment (originally created in github) in github if asana is more recent", function () {
      var asanaComments = [
          comment.create({
            body : "update in github - asana",
            lastUpdated : 3,
            fields : {gh_id : "1"}
          })
        ],
        gitHubComments = [
          comment.create({
            body : "update in github - github",
            lastUpdated : 1,
            fields : {gh_id : "1"}
          })
        ],
        expectedOperations = {
          asana : {
            create : [],
            update : [],
            del : []
          },
          github : {
            create : [],
            update : [
              {
                old : gitHubComments[0],
                nue : asanaComments[0]
              }
            ],
            del : []
          } 
        };

      sync.diffComments(asanaComments, gitHubComments).should.eql(expectedOperations);
    });

    it("deletes comments in github if find a github comment with an asana id but no matching asana comment", function () {
      var asanaComments = [],
        gitHubComments = [
          comment.create({
            body : "delete in github because no matching asana comment",
            fields : {as_id : "1"}
          })
        ],
        expectedOperations = {
          asana : {
            create : [],
            update : [],
            del : []
          },
          github : {
            create : [],
            update : [],
            del : [gitHubComments[0]]
          } 
        };
       
      sync.diffComments(asanaComments, gitHubComments).should.eql(expectedOperations);
    });

    it("deletes comments in asana if find a asana comment with a github id but no matching github comment", function () {
      var asanaComments = [
          comment.create({
            body : "delete in asana because no matching github comment",
            fields : {gh_id : "1"}
          })
        ],
        gitHubComments = [],
        expectedOperations = {
          asana : {
            create : [],
            update : [],
            del : [asanaComments[0]]
          },
          github : {
            create : [],
            update : [],
            del : []
          } 
        };
       
      sync.diffComments(asanaComments, gitHubComments).should.eql(expectedOperations);
    }); 

  });



  // *******************************************************************
  describe.skip("sync comments", function () {
    it("must sync the comments of the specified items", function () {
      var asanaItem = item.create({
            title : "#33 hello world",
            managerId : "18935613894395"
          }),
          gitHubItem = item.create({
          title : "hello world",
          fields : {
            owner : "marcboscher",
            repo : "cctest",
            number : 33
          }
        });

      return sync.getCommentSyncOperations(asanaItem, gitHubItem)
        .then(function (operations) {
          console.log("\n\n####OPS#####\n%s\n\n", JSON.stringify(operations, null, 2));

          return sync.execCommentOperations(operations, asanaItem, gitHubItem);
        });
    });
  });

});
