/*global describe,before,after,it*/
/*jshint expr: true*/
"use strict";
var item = require("../../lib/item"),
  comment = require("../../lib/comment"),
  storyModule = require("../../lib/asana/story"),
  record = require('../record'),
  _ = require("lodash");


describe("asana.story.", function () {

  describe("toComment", function () {
    it("must map a story to an comment", function () {
      var story = {
        "id" : 18704113106165,
        "created_at" : "2014-10-26T15:18:55.240Z",
        "created_by" : {"id" : 87450240631,"name" : "Marc Boscher"},
        "type" : "comment",
        "text" : "this is a comment\nover multiple lines\n\n#field1 ddd\n#field2"
      },
      expectedComment = comment.create({
        "body" : "this is a comment\nover multiple lines",
        "lastUpdated" : 1414336735240, 
        "fields" : {
          "field1" : "ddd",
          "field2" : "",
          "aa.id" : "18704113106165",
          "aa.commenter" : "Marc Boscher"
        }
      });
      
      storyModule.toComment(story).should.eql(expectedComment);
    });
  });


  describe("fromComment", function () {
    it("must map a comment to a story", function () {
      var inputComment = comment.create({
          "body" : "this is a comment\nover multiple lines\n\n",
          "lastUpdated" : 1414336735240, 
          "fields" : {
            "field1" : "ddd",
            "field2" : "",
            "gh.id" : "112233",
            "gh.commenter" : "marcboscher"
          }
        }),

        expectedStory = {
          "data" : {
            "text" : "this is a comment\nover multiple lines\n\n\n#gh.commenter marcboscher\n#gh.id 112233"
          }
        };
        
      storyModule.fromComment(inputComment).should.eql(expectedStory);
    });
  });


  describe("getStories", function () {

    var recorder = record('asana/story.getStories');
    after(recorder.after);

    it("must return an array of stories whose texts are strings", function () {
      recorder.before();
      return storyModule.getStories(18704113106162).then(function (stories) {
        // console.log(stories);
        stories.should.not.be.empty;
        stories.forEach(function (story) {
          story.should.have.properties("id", "text", "type", "created_at", "created_by");
          story.text.should.be.a.String;
        });
      });
    });
  });

  describe("getComments", function () {

    var recorder = record('asana/story.getComments');
    after(recorder.after);

    it("must return an array of comments whose bodies are strings", function () {
      recorder.before();
      return storyModule.getComments(item.create({managerId : 18704113106162})).then(function (comments) {
        // console.log(comments);
        comments.should.not.be.empty;
        comments.forEach(function (comment) {
          comment.should.have.properties("body", "lastUpdated", "fields");
          comment.body.should.be.a.String;
          comment.body.should.not.containEql("added to ");
          comment.body.should.not.containEql("changed the ");
        });
      });
    });
  });


  describe("createComment", function () {

    var recorder = record('asana/story.createComment');
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
        itemToCommentOn = item.create({managerId : 18704113106162});
    
      return storyModule.createComment(commentToCreate, itemToCommentOn)
        .then(function (commentCreated) {
          commentCreated.body.should.eql(commentToCreate.body);
          commentCreated.fields.should.have.properties("foo", "baz", "aa.id");
          commentCreated.fields.foo.should.eql(commentToCreate.fields.foo);
          commentCreated.fields.baz.should.eql(commentToCreate.fields.baz);

        }
      );
    });
  });

});
