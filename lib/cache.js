/*global localStorage*/
'use strict';

/**
 * Caching module for synchronization timestamps, indexed by Item manager ID.
 * Stores cache using localStorage API. If not available uses node-localstorage
 * to store in a file.
 * @module cache 
 */

var _ = require("lodash");
var assert = require("assert");
var LocalStorage;
var storage;
var LAST_SYNC_PREFIX = "lastSync.";


/**
 * Initialiaze the module, specifying a path to store the cache if not
 * running in an environment where localStorage exists (e.g. in a browser or
 * a chrome extension).
 * @param  {string} [storePath] - The path to a folder. Optional if running in 
 *    an environment where the localStorage global is already defined.
 */
function init (storePath) {
  if (typeof localStorage !== "undefined" && storage === null) {
    storage = localStorage;
  }
  else {
    LocalStorage = require('node-localstorage').LocalStorage;
    storage = new LocalStorage(storePath);
  }
}
 
/**
 * Empty the cache.
 */
function clear () {
  storage.clear();
}


/**
 * Lookup the last synchronization timestamp of an item.
 * @param  {string} managerId - Item ID in manager service.
 * @return {number} - last sync as ms since epoch, 0 if not in cache.
 */
function getLastSync (managerId) {
  var lastSync;
  assert(managerId, "managerId is required");
  lastSync = storage.getItem(LAST_SYNC_PREFIX + managerId);
  return lastSync ? lastSync : 0;
}


/**
 * Set the last sync timestamp of an item. Does nothing if timestamp is not an
 * integer.
 * @param  {string} managerId - Item ID in manager service.
 * @param  {number} timestamp - last sync as ms since epoch.
 */
function setLastSync (managerId, timestamp) {
  assert(managerId, "managerId is required");

  timestamp = _.parseInt(timestamp);
  if (_.isNaN(timestamp)) {
    throw new Error("timestamp must be an integer");
  }
  
  storage.setItem(LAST_SYNC_PREFIX + managerId, timestamp);
}


module.exports = {
  init : init,
  clear : clear,
  getLastSync : getLastSync,
  setLastSync : setLastSync,
  
  // Private methods exposed for testing
  
};