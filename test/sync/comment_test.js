/*global describe,it*/
'use strict';
var sync = require("../../lib/sync/comment"),
  item = require("../../lib/item"),
  comment = require("../../lib/comment"),
  cache = require("../../lib/cache"),
  should = require("should");

describe("sync/comment", function () {
  describe("diff", function () {
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
       
      sync.diff(asanaComments, gitHubComments).should.eql(expectedOperations);
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

      sync.diff(asanaComments, gitHubComments).should.eql(expectedOperations);
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

      sync.diff(asanaComments, gitHubComments).should.eql(expectedOperations);
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

      sync.diff(asanaComments, gitHubComments).should.eql(expectedOperations);
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

      sync.diff(asanaComments, gitHubComments).should.eql(expectedOperations);
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

      sync.diff(asanaComments, gitHubComments).should.eql(expectedOperations);
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

      sync.diff(asanaComments, gitHubComments).should.eql(expectedOperations);
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
       
      sync.diff(asanaComments, gitHubComments).should.eql(expectedOperations);
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
       
      sync.diff(asanaComments, gitHubComments).should.eql(expectedOperations);
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

      return sync.getOps(asanaItem, gitHubItem)
        .then(function (ops) {
          console.log("\n\n####OPS#####\n%s\n\n", JSON.stringify(ops, null, 2));

          return sync.execOps(ops, asanaItem, gitHubItem);
        });
    });
  });

});
