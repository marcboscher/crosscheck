'use strict';

/**
 * GitHub helper module.
 * @module github/helper
 */


var conf = require("../conf");
var _ = require("lodash");
var li = require("li");
var url = require("url");

/**
 * Helper to get correct user name based on config
 * @return {string} 
 */
function getUser () {
  if (conf.get("github.personalAccessToken")) {
    return conf.get("github.personalAccessToken");
  }
  else if (conf.get("github.userName") && conf.get("github.password")) {
    return conf.get("github.userName");
  }
  else {
    return "ANONYMOUS";
  }

}


/**
 * Helper to get correct password based on config
 * @return {string}
 */
function getPsw () {
  if (conf.get("github.personalAccessToken")) {
    return "x-oauth-basic";
  }
  else if (conf.get("github.userName") && conf.get("github.password")) {
    return conf.get("github.password");
  }
  else {
    return "";
  }
}


/**
 * Retrieve all pages availables given a superagent request built using the
 * provider buildRequestFn callback. Optionally removes duplicates, which could
 * happen if there were changes between page requests.
 * 
 * @param  {function} buildRequestFn - Must take a page index parameter and must
 *    return a superagent request object (not executed, not a promise).
 * @param  {string} [uniquePropertyName] - Optional property of results to use
 *    to remove duplicates.
 * @return {object} - An array of merged results from each page request.
 */
function requestAllPages (buildRequestFn, uniquePropertyName) {
  var results;

  // Get first page and extract lastPage index
  return buildRequestFn(1).promise()
    .then(function (res) {
      var links;
      var lastPage;

      // Store first page
      results = res.body;

      // No link header --> single page
      if (!res.header["link"]) {
        return [];
      }

      // Build array of page indexes to get
      links = li.parse(res.header["link"]);
      lastPage = _.parseInt(url.parse(links.last, true).query.page);
      return _.range(2, lastPage + 1);
    })

    // Get all the other pages, append their issues
    .map(function (pageIndex) {
      return buildRequestFn(pageIndex).promise()
        .then(function (res) {
          Array.prototype.push.apply(results, res.body);
        });
    })
    .then(function () {
      // Remove duplicate results, which could happen if there were changes
      // between page requests
      return uniquePropertyName ? _.unique(results, uniquePropertyName) : results;
    });
}



module.exports = {
  getUser : getUser,
  getPsw : getPsw,
  requestAllPages : requestAllPages

};