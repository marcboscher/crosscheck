'use strict';

/**
 * Main module of the crosscheck app providing 
 * high level sync functionality.
 * @module crosscheck 
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
 * @static
 */ 
function sync () {
  console.log("------------------------------------------------------");
  console.log("Sync - " + new Date());

  return asana.getProjects(conf.get("keywordPrefix") + conf.get("keyword"))
    .map(syncModule.syncAsanaProject);
}



module.exports = {
  sync : sync
  
  // Private methods exposed for testing
};