/*global describe,before,after,it*/
/*jshint expr: true*/
"use strict";
var projectModule = require("../../lib/asana/project"),
  conf = require("../../lib/conf"),
  record = require('../record'),
  _ = require("lodash"),
  should = require("should"),
  nock = require('nock'),
  PROJECT_PREFIX = "#cc";


describe("asana.project.", function () {

  describe("getProjects", function () {
    
    var recorder = record('asana/project.getProjects');
    before(recorder.before);
    after(recorder.after);

    it("must return an array of projects whose names have the right prefix", function () {
      return projectModule.getProjects(PROJECT_PREFIX).then(function (projects) {
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
