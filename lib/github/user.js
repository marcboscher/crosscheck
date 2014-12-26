'use strict';

/**
 * Module to interact with GitHub users.
 * @module github/user
 */

 
var conf = require("../conf"),
  helper = require("./helper"),
  _ = require("lodash"),
  request = require("superagent"),
  P = require("bluebird"),
  apiUrl = "https://api.github.com/";

require("superagent-bluebird-promise");


/**
 * Get the authenticated GitHub user.
 *
 * @returns {github:User} - GitHub authenticated user.
 *
 * @static
 */
function getAuthenticatedUser () {
  return request
    .get(apiUrl + "user")
    .auth(helper.getUser(), helper.getPsw())
    .promise()
    .then(function (res) {
    	return res.body;
    });
}


module.exports = {
  getAuthenticatedUser : getAuthenticatedUser
};
