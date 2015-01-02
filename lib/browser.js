'use strict';

/**
 * Main module of the crosscheck app for browser usage.
 * Needed by browserify
 * @module browser
 *
 * @borrows module:sync.sync as sync
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


module.exports = {
  sync : syncModule.sync,
  configure : conf.reconfigure,
  asana : asana,
  github : github

  
  // Private methods exposed for testing
};