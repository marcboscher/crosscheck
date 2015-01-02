'use strict';

/**
 * Main module of the crosscheck app providing 
 * high level sync functionality.
 * @module crosscheck 
 *
 * @borrows module:sync.sync as sync
 */
 
 
var conf = require("./conf"),
  cache = require("./cache"),
  syncModule = require("./sync"),
  _ = require("lodash");


// Initialization
cache.init(conf.get("cacheLocation"));



module.exports = {
  sync : syncModule.sync

  // Private methods exposed for testing
};