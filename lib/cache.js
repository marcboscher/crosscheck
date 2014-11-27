'use strict';

/**
 * Caching module for synchronization timestamps, indexed by Item manager ID.
 * @module cache 
 */

var _ = require("lodash"),
  assert = require("assert"),
  lastSyncCache = {}; // {<manageId> : <timestamp>}

 
 /**
  * Initialize the cache  with known values. Assigned by reference, 
  * avoid modifying cache thereafter. No validation is done on contents.
  * @param  {Object.<string, number>} cache - Mapping of managerId to ms since 
  *    epoch timestamp.
  */
function init(cache) {
  lastSyncCache = cache;
}


/**
 * Empty the cache.
 */
function clear() {
  lastSyncCache = {};
}


/**
 * Lookup the last synchronization timestamp of an item.
 * @param  {string} managerId - Item ID in manager service.
 * @return {number} - last sync as ms since epoch, 0 if not in cache.
 */
function getLastSync(managerId) {
  var lastSync;
  assert(managerId, "managerId is required");
  lastSync = lastSyncCache[managerId];
  return lastSync ? lastSync : 0;
}


/**
 * Set the last sync timestamp of an item. Does nothing if timestamp is not an
 * integer.
 * @param  {string} managerId - Item ID in manager service.
 * @param  {number} timestamp - last sync as ms since epoch.
 */
function setLastSync(managerId, timestamp) {
  assert(managerId, "managerId is required");

  timestamp = _.parseInt(timestamp);
  if (_.isNaN(timestamp)) {
    throw new Error("timestamp must be an integer");
  }
  
  lastSyncCache[managerId] = timestamp;
}


module.exports = {
  init : init,
  clear : clear,
  getLastSync : getLastSync,
  setLastSync : setLastSync,
  
  // Private methods exposed for testing
  
};