/*global describe,before,after,it*/
/*jshint expr: true*/
"use strict";
var item = require("../../lib/item"),
  taskModule = require("../../lib/asana/task"),
  record = require('../record'),
  _ = require("lodash");


describe("asana.task.", function () {
  describe("toItem", function () {
    it("must map a task to an item", function () {
      var task = {
        "id" : 17620819608823,
        "modified_at" : "2014-10-10T18:39:25.654Z",
        "name" : "#2 Reference issue",
        "notes" : "some **bold** text. some *italic* text\n\na list\n- foo\n- bar\n- a sublist\n  - a\n  - b\n  - c\n- baz\n\n\n#gh.link https://github.com/marcboscher/job-template/issues/2\n#gh.assignee marcboscher\n#gh.src gh\n#gh.id 45417090\n#gh.repo job-template\n#gh.owner marcboscher",
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
        "body" : "some **bold** text. some *italic* text\n\na list\n- foo\n- bar\n- a sublist\n  - a\n  - b\n  - c\n- baz",
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
          "gh.link" : "https://github.com/marcboscher/job-template/issues/2",
          "gh.assignee" : "marcboscher",
          "gh.src" :  "gh",
          "gh.id" : "45417090",
          "gh.repo" : "job-template",
          "gh.owner" : "marcboscher"
        }
      });
      
      taskModule.toItem(task).should.eql(expectedItem);
    });
  });


  describe("fromItem", function () {
    it("must map an item to a task", function () {
      var 
        it = item.create({
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
            "gh.link" : "https://github.com/marcboscher/job-template/issues/2",
            "gh.assignee" : "marcboscher",
            "gh.src" :  "gh",
            "gh.id" : "45417090",
            "gh.repo" : "job-template",
            "gh.owner" : "marcboscher"
          }
        }),

      expectedTask = {
        "data" : {
          "name" : "#2 Reference issue",
          "notes" : "some **bold** text. some *italic* text\n\na list\n- foo\n- bar\n- a sublist\n  - a\n  - b\n  - c\n- baz\n\n\n#gh.link https://github.com/marcboscher/job-template/issues/2\n#gh.assignee marcboscher\n#gh.src gh\n#gh.id 45417090\n#gh.repo job-template\n#gh.owner marcboscher",
          "completed" : false,
        }
      };
        
      taskModule.fromItem(it).should.eql(expectedTask);
    });
  });
  

  describe("getTasks", function () {

    var recorder = record('asana/task.getTasks');
    after(recorder.after);

    it("must return an array of tasks whose names are strings", function () {
      recorder.before();
      return taskModule.getTasks({"id": "17620819608778"}).then(function (tasks) {
        //console.log(tasks);
        tasks.should.not.be.empty;
        tasks.forEach(function (task) {
          task.should.have.properties("id", "name", "notes", "modified_at", "completed", "assignee", "tags", "projects");
          task.name.should.be.a.String;
        });
      });
    });
  });
  

  describe("getItems", function () {

    var recorder = record('asana/task.getItems');
    after(recorder.after);

    it("must return an array of items", function () {
      recorder.before();
      return taskModule.getItems({"id": "17620819608778"}).then(function (items) {
        //console.log(items);
        items.forEach(function (items) {
          items.title.should.be.a.String;
          items.should.have.properties("title", "body", "tags", "fields");
        });
      });
    });
  });
  

  describe("updateItem", function () {

    var recorder = record('asana/task.updateItem');
    after(recorder.after);

    it("must not fail", function () {
      recorder.before();
      var newItem = item.create(
        {
          "title": "Update test " + new Date(), 
          "body" : _.random(9999) + "\nLast updated on " + new Date()
        }),
        oldItem = item.create(
        {
          "managerId" : 18193431040338
        });
    
      return taskModule.updateItem(oldItem, newItem);
    });
  });
  

  describe("createItem", function () {

    var recorder = record('asana/task.createItem');
    after(recorder.after);

    it("must create the item requested", function () {
      recorder.before();
      var itemToCreate = item.create(
        {
          "title" : "create test",
          "body" : "this is a test\n\nextra line\n\n",
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
    
      return taskModule.createItem(itemToCreate, project).then(function (itemCreated) {
        itemCreated.title.should.startWith(itemToCreate.title);
        itemCreated.body.should.eql(itemToCreate.body.trim());
        itemCreated.completed.should.eql(itemToCreate.completed);
      });
    });
  });

});
