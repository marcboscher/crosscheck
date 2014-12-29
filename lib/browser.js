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
 * @return {Object[]} An array of operations log entries, one per asana project
 *  / github repo. Each entry contains asanaProject, githubRepo, and opsLog (as
 *  array of log strings).
 * @static
 */ 
function sync () {
  var log = [];

  return asana.getProjects(conf.get("keywordPrefix") + conf.get("keyword"))
    .map(function (project) {
      return syncModule.syncAsanaProject(project)
        .then(function (results) {
          log.push({
            asanaProject : results.itemSyncOps.asana.parent,
            githubRepo : results.itemSyncOps.github.parent,
            opsLog : syncModule.getOpsLog(results)
          });
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