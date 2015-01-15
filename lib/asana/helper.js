'use strict';

/**
 * GitHub helper module.
 * @module asana/helper
 */


var conf = require("../conf");
var _ = require("lodash");
var request = require("superagent");
var P = require("bluebird");
var apiUrl = "https://app.asana.com/api/1.0/";
var rateLimitWaitBuffer = 2 * 1000;

// If a request built using buildRequest hits the Asana rate limit, this global
// will be set to the ms since EPOCH at which time the limit will reset.
var rateLimitReachedUntil = null;


/**
 * Get the ms since epoch at which point the rate limit will reset. If the limit
 * has not been reached yet, null is returned.
 * @return {number} - ms since epoch or null.
 */
function getRateLimitReachedUntil () {
	return rateLimitReachedUntil;
}


/**
 * Helper to get correct user name based on config
 * @return {string} 
 */
function getUser () {
  if (conf.get("asana.apiKey")) {
    return conf.get("asana.apiKey");
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
  return "";
}

/**
 * Helper to build an unexecuted request to Asana, with promise support. 
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
	  		if (rateLimitReachedUntil) {
	  			// Don't send request if we know we've hit the rate limit
		  		if (_.now() < rateLimitReachedUntil) {
		  			reject("Asana rate limit already reached, ignoring request");
		  		}
		  		// Limit should now be reset, clear our global
		  		else {
		  			rateLimitReachedUntil = null;
		  		}
		  	}

	      req.end(function(err, res) {
	        if (typeof res !== "undefined" && res.status >= 400) {
	        	if (res.status === 429) {
	        		rateLimitReachedUntil = _.now() +  rateLimitWaitBuffer + 
	        		// Note: retry-after header is missing when in browser, so we take it from the body
	        		// 	(res.header['retry-after'] * 1000);
	        			(res.body["retry_after"] * 1000);
	        		
	        	}
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
 * Helper to build an unexecuted GET request to Asana, with promise support. 
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

module.exports = {
	buildGet : buildGet,
	buildPost : buildPost,
	buildPut : buildPut,
	buildPatch : buildPatch,
	buildDelete : buildDelete,
	getRateLimitReachedUntil : getRateLimitReachedUntil
};