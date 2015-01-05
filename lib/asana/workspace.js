'use strict';

/**
 * Module to interact with Asana workspaces.
 * @module asana/workspace
 */


var conf = require("../conf"),
  _ = require("lodash"),
  helper = require("./helper"),
  request = require("superagent"),
  P = require("bluebird"),
  apiUrl = "https://app.asana.com/api/1.0/";


require("superagent-bluebird-promise");


/**
 * Get an array of Asana workspaces.
 * @returns {Array.<asana:Project>} - Array of Project as returned by Asana API
 *
 * @static
 */
function getWorkspaces () {
  return request
    .get(apiUrl + "workspaces")
    .auth(helper.getUser(), helper.getPsw())
    .promise()
    .then(function (res){
      return res.body.data;
    });
}


module.exports = {
  getWorkspaces : getWorkspaces
  
  // Private methods exposed for testing
};