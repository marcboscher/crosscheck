/*global describe,before,after,it*/
/*jshint expr: true*/
"use strict";
var workspaceModule = require("../../lib/asana/workspace"),
  record = require('../record'),
  _ = require("lodash");


describe("asana.workspace.", function () {

  describe("getWorkspaces", function () {
    
    var recorder = record('asana/workspace.getWorkspaces');
    after(recorder.after);

    it("must return an array of workspaces", function () {
      recorder.before();
      return workspaceModule.getWorkspaces().then(function (workspaces) {
        //console.log(workspaces);
        workspaces.forEach(function (workspace) {
          workspace.should.have.properties("id", "name");
        });
      });
    }); 
  });

});
