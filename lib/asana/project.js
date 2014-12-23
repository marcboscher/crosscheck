'use strict';

/**
 * Module to interact with Asana projects.
 * @module asana/project
 */


var conf = require("../conf"),
  _ = require("lodash"),
  helper = require("./helper"),
  request = require("superagent"),
  P = require("bluebird"),
  apiUrl = "https://app.asana.com/api/1.0/",
  user = "ANONYMOUS",
  psw = ""; // always empty


require("superagent-bluebird-promise");

if (conf.get("asana.apiKey")) {
  user = conf.get("asana.apiKey");
}


/**
 * Get an array of Asana projects whose name starts with a specific prefix.
 * @param {string} prefix - Prefix to filter projects by name.
 * @returns {Array.<asana:Project>} - Array of Project as returned by Asana API
 *
 * @static
 */
function getProjects (prefix) {
  return request
    .get(apiUrl + "projects")
    .timeout(5000) // request can be slow for long project lists
    .query({"archived": "false"})
    .query({"opt_fields": "id,name,notes,workspace"})
    .auth(helper.getUser(), helper.getPsw())
    .promise()
    .then(function (res){
      var projects = res.body.data.filter(function (project) {
        return project.name.indexOf(prefix) === 0;
      });
      return projects;
    });
}


module.exports = {
  getProjects : getProjects
  
  // Private methods exposed for testing
};