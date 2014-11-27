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
 * Output operations to console.
 *
 * @static
 * @private
 */
function printOperations(operations, asanaProject) {
  console.log("\nProject: %s", asanaProject.name);
  
  console.log("  Asana:");
  console.log("    Create:");
  operations.asana.create.forEach(function (op) {
    console.log("      " + op.title);
  });
  console.log("    Update:");
  operations.asana.update.forEach(function (op) {
    console.log("      " + op.newItem.title);
  });
  
  console.log("  GitHub:");
  console.log("    Create:");
  operations.github.create.forEach(function (op) {
    console.log("      " + op.title);
  });
  console.log("    Update:");
  operations.github.update.forEach(function (op) {
    console.log("      " + op.newItem.title);
  });
}

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