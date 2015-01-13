'use strict';

/**
 * Module to interact with Asana workspaces.
 * @module asana/workspace
 */


var conf = require("../conf"),
  _ = require("lodash"),
  helper = require("./helper"),
  P = require("bluebird");
  
/**
 * Get an array of Asana workspaces.
 * @returns {Array.<asana:Project>} - Array of Project as returned by Asana API
 *
 * @static
 */
function getWorkspaces () {
  return helper.buildGet("workspaces")
    .promiseEnd()
    .then(function (res){
      return res.body.data;
    });
}


module.exports = {
  getWorkspaces : getWorkspaces
  
  // Private methods exposed for testing
};