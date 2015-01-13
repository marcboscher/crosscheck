'use strict';

/**
 * Module to interact with Asana projects.
 * @module asana/project
 */


var conf = require("../conf"),
  _ = require("lodash"),
  helper = require("./helper"),
  P = require("bluebird");


/**
 * Get an array of Asana projects whose name starts with a specific prefix.
 * @param {number} workspace - Workspace ID whose projects to get.
 * @param {string} prefix - Prefix to filter projects by name.
 * @returns {Array.<asana:Project>} - Array of Project as returned by Asana API
 *
 * @static
 */
function getProjects (workspace, prefix) {
  return helper.buildGet("workspaces/" + workspace.id + "/projects")
    .query({"archived": "false"})
    .query({"opt_fields": "id,name,notes"})
    .promiseEnd()
    .then(function (res){
      return res.body.data.filter(function (project) {
        project.workspace = workspace;
        return project.name.indexOf(prefix) === 0;
      });
    });
}


module.exports = {
  getProjects : getProjects
  
  // Private methods exposed for testing
};