/*global describe,before,after,it*/
/*jshint expr: true*/
"use strict";

var item = require("../../lib/item"),
  comment = require("../../lib/comment"),
  commentModule = require("../../lib/github/comment"),
  record = require('../record'),
  _ = require("lodash");


describe("github.comment.", function () {

  describe("toComment", function () {
    it("must map a github comment to an comment", function () {
      var gitHubComment = {
        "url": "https://api.github.com/repos/marcboscher/cctest/issues/comments/62769730",
        "html_url": "https://github.com/marcboscher/cctest/issues/38#issuecomment-62769730",
        "issue_url": "https://api.github.com/repos/marcboscher/cctest/issues/38",
        "id": 62769730,
        "user": {
          "login": "marcboscher",
          "id": 1174558
        },
        "created_at": "2014-11-12T18:48:02Z",
        "updated_at": "2014-11-12T18:48:02Z",
        "body": "a comment\r\n\r\nover multiple lines\r\n\r\n#field1 aaa\r\n#field2"
      },
      expectedComment = comment.create({
        "body" : "a comment\n\nover multiple lines",
        "lastUpdated" : 1415818082000, 
        "fields" : {
          "field1" : "aaa",
          "field2" : "",
          "gh.id" : "62769730",
          "gh.commenter" : "marcboscher"
        }
      });
      
      commentModule.toComment(gitHubComment).should.eql(expectedComment);
    });
  });


  describe("fromComment", function () {
    it("must map a comment to a GitHub comment", function () {
      var inputComment = comment.create({
          "body" : "this is a comment\nover multiple lines\n\n",
          "lastUpdated" : 1414336735240, 
          "fields" : {
            "field1" : "ddd",
            "field2" : "",
            "aa.id" : "223344",
            "aa.commenter" : "Marc Boscher"
          }
        }),

        expectedComment = {
          "body" : "this is a comment\nover multiple lines\n\n\n#aa.commenter Marc Boscher\n#aa.id 223344"
        };
        
      commentModule.fromComment(inputComment).should.eql(expectedComment);
    });
  });


  describe("getGitHubComments", function () {

    var recorder = record('github/comment.getGitHubComments');
    after(recorder.after);

    it("must return an array of comments whose texts are strings", function () {
      recorder.before();
      return commentModule.getGitHubComments(38, "marcboscher", "cctest")
        .then(function (comments) {
          // console.log(comments);
          comments.should.not.be.empty;
          comments.forEach(function (gitHubComment) {
            gitHubComment.should.have.properties("id", "body", "user", "created_at", "updated_at");
            gitHubComment.body.should.be.a.String;
          });
        });
    });
  });

  describe("getComments", function () {

    var recorder = record('github/comment.getComments');
    after(recorder.after);

    it("must return an array of comments whose bodies are strings", function () {
      recorder.before();
      return commentModule.getComments(item.create(
          {
            fields : {
              "gh.number" : 38,
              "gh.owner" : "marcboscher",
              "gh.repo" : "cctest"
            }
          }
        ))
        .then(function (comments) {
          // console.log(comments);
          comments.should.not.be.empty;
          comments.forEach(function (comment) {
            comment.should.have.properties("body", "lastUpdated", "fields");
            comment.body.should.be.a.String;
          });
      });
    });
  });


  describe("createComment", function () {

    var recorder = record('github/comment.createComment');
    after(recorder.after);

    it("must create the comment requested", function () {
      recorder.before();
      var commentToCreate = comment.create(
          {
            "body" : "this is a test\n\nextra line",
            "fields" : {
              "foo" : "bar",
              "baz" : "qux"
            }
          }),
        itemToCommentOn = item.create(
          {
            fields : {
              "gh.number" : 38,
              "gh.owner" : "marcboscher",
              "gh.repo" : "cctest"
            }
          }
        );
    
      return commentModule.createComment(commentToCreate, itemToCommentOn)
        .then(function (commentCreated) {
          commentCreated.body.should.eql(commentToCreate.body);
          commentCreated.fields.foo.should.eql(commentToCreate.fields.foo);
          commentCreated.fields.baz.should.eql(commentToCreate.fields.baz);
          commentCreated.fields.should.have.properties("gh.id");
        }
      );
    });
  });


  describe("updateComment", function () {

    var recorder = record('github/comment.updateComment');
    after(recorder.after);

    it("must not fail", function () {
      recorder.before();
      var newComment = comment.create({
          body : "Updated comment body " + _.random(9999) + 
            "\nLast updated on " + new Date(),
          fields : {
            "aa.id" : "223344"
          }
        }),
        oldComment = comment.create({
          fields : {
            "gh.id" : "62577747"
          }
        }),

        parentItem = item.create(
          {
            "fields" : {
              "gh.owner" : "marcboscher",
              "gh.repo" : "cctest"
            }
          });
    
      return commentModule.updateComment(oldComment, newComment, parentItem).then(function (updatedComment) {
        //console.log(updatedComment);
        updatedComment.body.should.be.a.String;
      });
    });
  });


  describe("deleteComment", function () {

    var recorder = record('github/comment.deleteComment');
    after(recorder.after);

    it("must not fail", function () {
      recorder.before();
      var commentToDelete = comment.create({
          fields : {
            "gh.id" : "62776366"
          }
        }),

        parentItem = item.create(
          {
            "fields" : {
              "gh.owner" : "marcboscher",
              "gh.repo" : "cctest"
            }
          });
    
      return commentModule.deleteComment(commentToDelete, parentItem);
    });
  });

});
