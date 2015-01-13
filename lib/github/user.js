'use strict';

/**
 * Module to interact with GitHub users.
 * @module github/user
 */

 
var conf = require("../conf"),
  helper = require("./helper"),
  _ = require("lodash"),
  P = require("bluebird");


/**
 * Get the authenticated GitHub user.
 *
 * @returns {github:User} - GitHub authenticated user.
 *
 * @static
 */
function getAuthenticatedUser () {
  return helper.buildGet("user")
    .promiseEnd()
    .then(function (res) {
    	return res.body;
    });
}


module.exports = {
  getAuthenticatedUser : getAuthenticatedUser
};
