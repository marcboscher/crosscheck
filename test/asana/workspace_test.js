/*global describe,before,after,it*/
/*jshint expr: true*/
"use strict";
var workspaceModule = require("../../lib/asana/workspace"),
  conf = require("../../lib/conf"),
  record = require('../record'),
  _ = require("lodash"),
  should = require("should"),
  nock = require('nock');


describe("asana.workspace.", function () {

  describe("getWorkspaces", function () {
    
    var recorder = record('asana/workspace.getWorkspaces');
    before(recorder.before);
    after(recorder.after);

    it("must return an array of workspaces", function () {
      return workspaceModule.getWorkspaces().then(function (workspaces) {
        //console.log(workspaces);
        workspaces.forEach(function (workspace) {
          workspace.should.have.properties("id", "name");
        });
      });
    }); 
  });

});
