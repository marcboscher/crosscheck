'use strict';

/**
 * Main module of the crosscheck app for browser usage.
 * Needed by browserify
 * @module browser
 *
 * @borrows module:conf.reconfigure as configure
 */
 
 
var conf = require("./conf"),
  cache = require("./cache"),
  asana = require("./asana"),
  github = require("./github"),
  syncModule = require("./sync"),
  _ = require("lodash");


// Initialization
cache.init();


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
  configure : conf.reconfigure,
  asana : asana,
  github : github

  
  // Private methods exposed for testing
};