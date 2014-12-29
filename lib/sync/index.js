'use strict';

/**
 * Synchronization module for Items and Comments.
 * @module sync 
 */
 
 
var conf = require("../conf"),
  itemSync = require("../sync/item"),
  commentSync = require("../sync/comment"),
  item = require("../item"),
  parser = require("../parser"),
  asana = require("../asana"),
  github = require("../github"),
  cache = require("../cache"),
  _ = require("lodash"),
  P = require("bluebird");


/**
 * Synchronize an Asana project with any source specified by that project
 * @param  {asana:Project} asanaProject The Asana project to sync, as loaded by 
 *    the asana module.
 * @return {Object} A results object containing itemSyncOps and commentSyncOpsList.
 */
function syncAsanaProject (asanaProject) {
  var fields = {},
      join = P.join;

  parser.extractFields(asanaProject.notes, fields);
   
  // Check Github fields
  if (!fields["gh.owner"] || !fields["gh.repo"]) {
    console.warn("Skipping project with missing gh.owner or gh.repo fields. " + asanaProject);
    return;
  }
  
  // Decorate asana project with extracted fields
  asanaProject.fields = fields;
  
  // Get operations to sync items (not their comments)
  return itemSync.getOps(asanaProject, _.cloneDeep(fields))
    
    // Use 'this' to share state
    .bind({})
    
    // Get operations to sync comments
    .then(function (itemSyncOps) {
      // Save the ops for use later on in promise chain
      this.itemSyncOps = itemSyncOps;

      // Get any comment sync operation for items that have changed since last sync
      return P.map(itemSyncOps.toDiffChildren, function (changedItem) {
        return commentSync.getOps(changedItem.asana, changedItem.github);
      });
    })

    .then(function (commentSyncOpsList) {
      // Save the ops for use later on in promise chain
      // Note this is actually a collection of operation objects, one per item update
      this.commentSyncOpsList = commentSyncOpsList;
    })

    // Execute item sync operations
    .then(function () {
      return itemSync.execOps(this.itemSyncOps);
    })

    // Execute comment sync operations
    .then(function () {
      return P.map(this.commentSyncOpsList, function (commentSyncOps) {
        return commentSync.execOps(commentSyncOps);
      });
    })

    // Update coment last sync for every item we diffed,
    // even if we did not execute any operations. This 
    // will repopulate a cleared cache.
    .then(function () {
      this.itemSyncOps.toDiffChildren.forEach(function (changedItem) {
        // We deduct a "safety" from the now timestamp to deal with any
        // delay between the request to get items and any create/update
        // operation. So if a comment is added/edited after we requested an
        // item but before we update lastSync, we will catch it next time.
        // This has the side-effect of always rechecking comments after an 
        // update to an item or its comments since lastSync will be earlier
        // than the update's lastUpdated timestamp.
        cache.setLastSync(changedItem.asana.managerId, Date.now() - conf.get("lastSyncSafety"));
      });

      // Return 'this', which holds all the operations performed
      return this;
    });
}


/**
 * Build an array of string log entries, one for each operation performed during
 * a sync.
 * @param  {Object} syncResults - the results object returned by a sync method.
 * @return {string[]} An array of log strings, ready for presentation.
 */
function getOpsLog (syncResults) {
  var log = itemSync.getOpsLog(syncResults.itemSyncOps);
  var asanaProject = syncResults.itemSyncOps.asana.parent;

  _.forEach(syncResults.commentSyncOpsList, function (commentSyncOps) {
    Array.prototype.push.apply(log, commentSync.getOpsLog(commentSyncOps, asanaProject));
  });

  return log;
}


module.exports = {
  syncAsanaProject : syncAsanaProject,
  getOpsLog : getOpsLog
  
  // Private methods exposed for testing
};