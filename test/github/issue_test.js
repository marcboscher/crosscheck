/*global describe,before,after,it*/
/*jshint expr: true*/
"use strict";
var conf = require("../../lib/conf"),
  item = require("../../lib/item"),
  issueModule = require("../../lib/github/issue"),
  record = require('../record'),
  should = require("should"),
  _ = require("lodash");

describe("github.issue", function () {
  describe("toItem", function () {
    it("must map an issue to an item", function () {
      var issue = {
        "url": "https://api.github.com/repos/marcboscher/cctest/issues/1",
        "labels_url": "https://api.github.com/repos/marcboscher/cctest/issues/1/labels{/name}",
        "comments_url": "https://api.github.com/repos/marcboscher/cctest/issues/1/comments",
        "events_url": "https://api.github.com/repos/marcboscher/cctest/issues/1/events",
        "html_url": "https://github.com/marcboscher/cctest/issues/1",
        "id": 45510585,
        "number": 1,
        "title": "dummy issue A",
        "user": {
        },
        "labels": [
          {
            "url": "https://api.github.com/repos/marcboscher/cctest/labels/enhancement",
            "name": "enhancement",
            "color": "84b6eb"
          },
          {
            "url": "https://api.github.com/repos/marcboscher/cctest/labels/question",
            "name": "question",
            "color": "cc317c"
          }
        ],
        "state": "open",
        "locked": false,
        "assignee": {
          "login": "marcboscher",
          "id": 1174558,
        },
        "milestone": {
          "url": "https://api.github.com/repos/marcboscher/cctest/milestones/1",
          "labels_url": "https://api.github.com/repos/marcboscher/cctest/milestones/1/labels",
          "id": 821519,
          "number": 1,
          "title": "m1",
          "description": "",
          "open_issues": 1,
          "closed_issues": 0,
          "state": "open",
          "created_at": "2014-10-10T18:36:45Z",
          "updated_at": "2014-10-10T18:37:49Z",
          "due_on": null
        },
        "comments": 0,
        "created_at": "2014-10-10T18:37:27Z",
        "updated_at": "2014-10-10T18:37:52Z",
        "closed_at": null,
        "body": "some **bold** text. some *italic* text\r\n\r\na list\r\n- foo\r\n- bar\r\n- a sublist\r\n  - a\r\n  - b\r\n  - c\r\n- baz"
      },
      expectedItem = item.create({
        "title" : "#1 dummy issue A",
        "body" : "some **bold** text. some *italic* text\n\na list\n- foo\n- bar\n- a sublist\n  - a\n  - b\n  - c\n- baz",
        "completed" : false,
        "lastUpdated" : 1412966272000,
        // TODO support tags
        "tags" : [],
        // "tags" : [
          // "#gh.milestone m1",
          // "#gh.label enhancement",
          // "#gh.label question"
        // ],
        "fields" : {
          "url" : "https://github.com/marcboscher/cctest/issues/1",
          "assignee" : "marcboscher",
          "source" :  "gh",
          "number" : "1",
          "repo" : "myrepo",
          "owner" : "myowner",
          // TODO remove when support tags
          "milestone" : "m1",
          "labels" : "enhancement, question"
        }
      });
      
      issueModule.toItem(issue, {repo : "myrepo", owner : "myowner"}).should.eql(expectedItem);
    });
  });
  
  describe("fromItem", function () {
    it("must map an item to an issue", function () {
      var it = item.create({
        "title" : "#1 dummy issue A",
        "body" : "some **bold** text. some *italic* text\n\na list\n- foo\n- bar\n- a sublist\n  - a\n  - b\n  - c\n- baz",
        "completed" : false,
        "fields" : {
          "url" : "https://github.com/marcboscher/cctest/issues/1",
          "assignee" : "marcboscher",
          "source" :  "gh",
          "number" : "1",
          "repo" : "myrepo",
          "owner" : "myowner",
          "milestone" : "m1",
          "labels" : "enhancement,  question  "
        }
      }),
      expectedIssue = {
        "title": "dummy issue A",
        "body" : "some **bold** text. some *italic* text\n\na list\n- foo\n- bar\n- a sublist\n  - a\n  - b\n  - c\n- baz",
        "labels": [ "enhancement", "question" ],
        "state": "open",
        "assignee": "marcboscher"
        // TODO support milestone
        //"milestone": "m1"
      };
      
      issueModule.fromItem(it).should.eql(expectedIssue);
    });
  });

  describe("getIssues with no otions", function () {
    
    var recorder = record('github/issue.getIssues_no_options');
    before(recorder.before);
    after(recorder.after);

    it("must return an array of issues whose title should be a string", function () {
      return issueModule.getIssues().then(function (issues) {
        //console.log(issues);
        issues.forEach(function (issue) {
          issue.title.should.be.a.String;
        });
      });
    });
  });
  
  describe("getIssues with owner and repo", function () {
    
    var recorder = record('github/issue.getIssues_with_options');
    before(recorder.before);
    after(recorder.after);

    it("must return an array of valid issues whose title should be a string", function () {
      return issueModule.getIssues(
          {
            "owner": "marcboscher", 
            "repo": "cctest", 
            "excludeWithLabels" : ["invalid", "enhancement"]
          }
        )
        .then(function (issues) {
        //console.log(issues);
        issues.forEach(function (issue) {
          issue.title.should.be.a.String;
          issue.labels.forEach(function (label) {
            label.name.should.not.eql("invalid");
            label.name.should.not.eql("enhancement");
          });
        });
      });
    });
  });
  
  describe("getItems", function () {
    
    var recorder = record('github/issue.getItems');
    before(recorder.before);
    after(recorder.after);

    it("must return an array of items", function () {
      return issueModule.getItems({"owner": "marcboscher", "repo": "cctest"}).then(function (items) {
        //console.log(items);
        items.forEach(function (items) {
          items.title.should.be.a.String;
          items.should.have.properties("title", "body", "tags", "fields");
        });
      });
    });
  });
  
  describe("updateItem", function () {

    var recorder = record('github/issue.updateItem');
    before(recorder.before);
    after(recorder.after);

    it("must not fail", function () {
      var newItem = item.create(
        {
          "title": "Update test " + new Date(), 
          "body" : _.random(9999) + "\nLast updated on " + new Date(),
          "fields" : {
            //"assignee" : "marcboscher",
            //"milestone" : "1",
            "labels" : "invalid",
            "number" : "10",
            "owner" : "marcboscher",
            "repo" : "cctest"
          }
        }),
        oldItem = item.create(
          {
          "fields" : {
            "number" : "10",
            "owner" : "marcboscher",
            "repo" : "cctest"
          }
        });
    
      return issueModule.updateItem(oldItem, newItem).then(function (item) {
        //console.log(data);
        item.title.should.be.a.String;
      });
    });
  });
  
  describe("createItem", function () {

    var recorder = record('github/issue.createItem');
    before(recorder.before);
    after(recorder.after);

    it("must not fail", function () {
      var itemToCreate = item.create(
        {
          "title" : "create test",
          "body" : "this is a test\n\nextra line",
          "completed" : false,
          "fields" : {
            "assignee" : "marcboscher",
            "milestone" : "1",
            "labels" : "invalid",
            "owner" : "marcboscher",
            "repo" : "cctest"
          }
        });
    
      return issueModule.createItem(itemToCreate).then(function (itemCreated) {
        itemCreated.title.should.eql("#" + itemCreated.fields.number + " " + itemToCreate.title);
        itemCreated.body.should.eql(itemToCreate.body);
        itemCreated.completed.should.eql(itemToCreate.completed);
      });
    });
  });
  
  describe("createItem in completed state", function () {
    
    var recorder = record('github/issue.createItem_completed');
    before(recorder.before);
    after(recorder.after);

    it("must create a completed item", function () {
      var itemToCreate = item.create(
        {
          "title" : "create test in complete state",
          "completed" : true,
          "fields" : {
            "labels" : "invalid",
            "owner" : "marcboscher",
            "repo" : "cctest"
          }
        });
    
      return issueModule.createItem(itemToCreate).then(function (itemCreated) {
        itemCreated.title.should.eql(conf.get("github.issueNumberPrefix") + itemCreated.fields.number + " " + itemToCreate.title);
        itemCreated.completed.should.eql(itemToCreate.completed);
      });
    });
  });

});
