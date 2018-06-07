'use strict';

/**
 * GitHub helper module.
 * @module github/helper
 */


var conf = require("../conf");
var _ = require("lodash");
var request = require("superagent");
var P = require("bluebird");
var li = require("li");
var url = require("url");
var apiUrl = "https://api.github.com/";

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
 * Helper to build an unexecuted request to GitHub, with promise support. 
 * @param  {string} method - an HTTP method, in upper case (GET, POST, PUT, DELETE, HEAD)
 * @param  {string} urlPath - path within Asana API, without initial slash
 * @return {request} - a superagent request, pre-authenticated, with a new method
 *    "promiseEnd" which wraps the request.end method in a Bluebird promise.
 */
function buildRequest(method, urlPath) {
  var req = request(method, apiUrl + urlPath)
              .auth(getUser(), getPsw());

  // Add promisified end() function
  req.promiseEnd = function() {
    return new P(function(resolve, reject) {
        req.end(function(err, res) {
          if (typeof res !== "undefined" && res.status >= 400) {
            //console.log(res.error);
            reject({
              status: res.status,
              res: res,
              error: res.error
            });
          } else if (err) {
            reject(err);
          } else {
            resolve(res);
          }
        });
      });
  };

  return req;
}

/**
 * Helper to build an unexecuted GET request to GitHub, with promise support. 
 * @param  {string} urlPath - path within Asana API, without initial slash
 * @return {request} - a superagent request, pre-authenticated, with a new method
 *    "promiseEnd" which wraps the request.end method in a Bluebird promise.
 */
function buildGet(urlPath) {
  return buildRequest("GET", urlPath);
}

/**
 * @see buildGet
 */
function buildPost(urlPath) {
  return buildRequest("POST", urlPath);
}

/**
 * @see buildGet
 */
function buildPut(urlPath) {
  return buildRequest("PUT", urlPath);
}

/**
 * @see buildGet
 */
function buildPatch(urlPath) {
  return buildRequest("PATCH", urlPath);
}

/**
 * @see buildGet
 */
function buildDelete(urlPath) {
  return buildRequest("DELETE", urlPath);
}


/**
 * Retrieve all pages availables using a superagent request built using the
 * provided buildRequestFn callback. Optionally removes duplicates, which could
 * happen if there were changes between page requests.
 * 
 * @param  {function} buildRequestFn - Must take a page index parameter and must
 *    return a superagent request object (not executed, not a promise). Use
 *    one of the build methods in this module to create it.
 * @param  {string} [uniquePropertyName] - Optional property of results to use
 *    to remove duplicates.
 * @return {object} - An array of merged results from each page request.
 */
function requestAllPages (buildRequestFn, uniquePropertyName) {
  var results;

  // Get first page and extract lastPage index
  return buildRequestFn(1).promiseEnd()
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
      return buildRequestFn(pageIndex).promiseEnd()
        .then(function (res) {
          Array.prototype.push.apply(results, res.body);
        });
    })
    .then(function () {
      // Remove duplicate results, which could happen if there were changes
      // between page requests
      return uniquePropertyName ? _.uniqBy(results, uniquePropertyName) : results;
    });
}



module.exports = {
  buildGet : buildGet,
  buildPost : buildPost,
  buildPut : buildPut,
  buildPatch : buildPatch,
  buildDelete : buildDelete,
  requestAllPages : requestAllPages

};