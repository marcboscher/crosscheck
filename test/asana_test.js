/*global describe,before,after,it*/
/*jshint expr: true*/
"use strict";
var item = require("../lib/item"),
  asana = require("../lib/asana"),
  record = require('./record'),
  _ = require("lodash"),
  should = require("should"),
  nock = require('nock'),
  PROJECT_PREFIX = "#cc";

describe("asana.", function () {
  describe.skip("toItem", function () {
    it("must map a task to an item", function () {
      var task = {
        "id" : 17620819608823,
        "modified_at" : "2014-10-10T18:39:25.654Z",
        "name" : "#2 Reference issue",
        "notes" : "some **bold** text. some *italic* text\n\na list\n- foo\n- bar\n- a sublist\n  - a\n  - b\n  - c\n- baz\n\n\n#link https://github.com/marcboscher/job-template/issues/2\n#assignee marcboscher\n#src gh\n#id 45417090\n#repo job-template\n#owner marcboscher",
        //"notes" : "some **bold** text\n#link https://github.com/marcboscher/job-template/issues/2\n#assignee marcboscher\n#src gh\n#id 45417090\n#repo job-template\n#owner marcboscher",
        "completed" : false,
        "assignee" : {
          "id" : 87450240631,
          "name" : "Marc Boscher",
          "email" : "boscher.marc@gmail.com"
        },
        "tags" : [
          {
            "id" : 17620819608851,
            "name" : "#gh.milestone m1"
          },
          {
            "id" : 17620819608853,
            "name" : "#gh.label lab1"
          },
          {
            "id" : 17620819608860,
            "name" : "#gh.state open"
          }
        ],
        "projects" : [
          {
            "id" : 17620819608782,
            "name" : "Product Management"
          }
        ]
      },
      expectedItem = item.create({
        "title" : "#2 Reference issue",
        "body" : "some **bold** text. some *italic* text\n\na list\n- foo\n- bar\n- a sublist\n  - a\n  - b\n  - c\n- baz\n\n",
        //"body" : "some **bold** text\n",
        "managerId" : "17620819608823",
        "completed" : false,
        "lastUpdated" : 1412966365654, 
        "tags" : [
          "#gh.milestone m1",
          "#gh.label lab1",
          "#gh.state open"
        ],
        "fields" : {
          "link" : "https://github.com/marcboscher/job-template/issues/2",
          "assignee" : "marcboscher",
          "src" :  "gh",
          "id" : "45417090",
          "repo" : "job-template",
          "owner" : "marcboscher"
        }
      });
      
      asana.toItem(task).should.eql(expectedItem);
    });
  });
  

  describe("getProjects", function () {
    
    var recorder = record('asana.getProjects');
    before(recorder.before);
    after(recorder.after);

    it("must return an array of projects whose names have the right prefix", function () {
      return asana.getProjects(PROJECT_PREFIX).then(function (projects) {
        //console.log(projects);
        projects.forEach(function (project) {
          project.should.have.properties("id", "name", "notes", "workspace");
          project.workspace.should.have.properties("id");
          project.name.should.startWith(PROJECT_PREFIX);
        });
      });
    }); 
  });
   

  describe("getTasks", function () {

    var recorder = record('asana.getTasks');
    before(recorder.before);
    after(recorder.after);

    it("must return an array of tasks whose names are strings", function () {
      return asana.getTasks({"id": "17620819608778"}).then(function (tasks) {
        //console.log(tasks);
        tasks.forEach(function (task) {
          task.should.have.properties("id", "name", "notes", "modified_at", "completed", "assignee", "tags", "projects");
          task.name.should.be.a.String;
        });
      });
    });
  });
  

  describe("getItems", function () {

    var recorder = record('asana.getItems');
    before(recorder.before);
    after(recorder.after);

    it("must return an array of items", function () {
      return asana.getItems({"id": "17620819608778"}).then(function (items) {
        //console.log(items);
        items.forEach(function (items) {
          items.title.should.be.a.String;
          items.should.have.properties("title", "body", "tags", "fields");
        });
      });
    });
  });
  

  describe("updateItem", function () {

    var recorder = record('asana.updateItem');
    before(recorder.before);
    after(recorder.after);

    it("must not fail", function () {
      var newItem = item.create(
        {
          "title": "Update test " + new Date(), 
          "body" : _.random(9999) + "\nLast updated on " + new Date()
        }),
        oldItem = item.create(
        {
          "managerId" : 18193431040338
        });
    
      return asana.updateItem(oldItem, newItem);
    });
  });
  

  describe("createItem", function () {

    var recorder = record('asana.createItem');
    before(recorder.before);
    after(recorder.after);

    it("must not fail", function () {
      var itemToCreate = item.create(
        {
          "title" : "create test",
          "body" : "this is a test\n\nextra line",
          "fields" : {
            "foo" : "bar",
            "baz" : "qux"
          }
        }),
        project = {
          id: 17620819608778,
          workspace: {
            id: 17620819608777
          }
        };
    
      return asana.createItem(itemToCreate, project).then(function (itemCreated) {
        itemCreated.title.should.startWith(itemToCreate.title);
        itemCreated.body.should.eql(itemToCreate.body);
        itemCreated.completed.should.eql(itemToCreate.completed);
      });
    });
  });
});
