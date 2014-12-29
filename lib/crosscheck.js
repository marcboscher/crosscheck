'use strict';

/**
 * Main module of the crosscheck app providing 
 * high level sync functionality.
 * @module crosscheck 
 *
 * @borrows module:conf.reconfigure as configure
 */
 
 
var conf = require("./conf"),
  cache = require("./cache"),
  asana = require("./asana"),
  syncModule = require("./sync"),
  _ = require("lodash");


// Initialization
cache.init(conf.get("cacheLocation"));

/**
 * Synchronize work between services. The main application entry point.
 * @return {string[]} An array of operations log entries, as strings, ready to
 *    display.
 * @static
 */ 
function sync () {
  var log = [];

  return asana.getProjects(conf.get("keywordPrefix") + conf.get("keyword"))
    .map(function (project) {
      return syncModule.syncAsanaProject(project)
        .then(function (results) {
          Array.prototype.push.apply(log, syncModule.getOpsLog(results));
        });
    })
    .then(function () {
      return log;
    });
}



module.exports = {
  sync : sync,
  configure : conf.reconfigure
  
  // Private methods exposed for testing
};