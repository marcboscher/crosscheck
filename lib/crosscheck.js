'use strict';

/**
 * Main module of the crosscheck app providing 
 * high level sync functionality.
 * @module crosscheck 
 */
 
 
var conf = require("./conf"),
  asana = require("./asana"),
  syncModule = require("./sync"),
  _ = require("lodash");


/**
 * Synchronize work between services. The main application entry point.
 * @static
 */ 
function sync () {
  console.log("------------------------------------------------------");
  console.log("Sync - " + new Date());

  return asana.getProjects(conf.get("keywordPrefix") + conf.get("serviceAbbr"))
    .map(syncModule.syncAsanaProject);
}



module.exports = {
  sync : sync
  
  // Private methods exposed for testing
};