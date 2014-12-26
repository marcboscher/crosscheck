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
 * @static
 */ 
function sync () {
  console.log("Sync - " + new Date());

  return asana.getProjects(conf.get("keywordPrefix") + conf.get("keyword"))
    .map(syncModule.syncAsanaProject);
}



module.exports = {
  sync : sync,
  configure : conf.reconfigure,
  asana : asana,
  github : github

  
  // Private methods exposed for testing
};