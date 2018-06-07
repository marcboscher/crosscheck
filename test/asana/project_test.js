/*global describe,before,after,it*/
/*jshint expr: true*/
"use strict";
var projectModule = require("../../lib/asana/project"),
  record = require('../record'),
  _ = require("lodash"),
  PROJECT_PREFIX = "#gh";


describe("asana.project.", function () {

  describe("getProjects", function () {
    
    var recorder = record('asana/project.getProjects');
    after(recorder.after);

    it("must return an array of projects whose names have the right prefix", function () {
      recorder.before();
      return projectModule.getProjects({id : 17620819608777, name : "crosscheck.io"}, PROJECT_PREFIX)
      .then(function (projects) {
        //console.log(projects);
        projects.forEach(function (project) {
          project.should.have.properties("id", "name", "notes", "workspace");
          project.workspace.should.have.properties("id");
          project.name.should.startWith(PROJECT_PREFIX);
        });
     });
    }); 
  });

});
