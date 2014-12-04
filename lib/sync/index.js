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
  _ = require("lodash"),
  P = require("bluebird");


/**
 * Synchronize an Asana project with any source specified by that project
 * @param  {asana:Project} asanaProject The Asana project to sync, as loaded by 
 *    the asana module.
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
      return P.map(itemSyncOps.toDiffComments, function (changedItem) {
        return commentSync.getOps(changedItem.asanaItem, changedItem.gitHubItem);
      });
    })

    .then(function (commentSyncOpsList) {
      // Save the ops for use later on in promise chain
      // Note this is actually a collection of operation objects, one per item update
      this.commentSyncOpsList = commentSyncOpsList;
    })

    // Execute item sync operations
    .then(function () {
      itemSync.logOps(this.itemSyncOps, asanaProject);
      return itemSync.execOps(this.itemSyncOps, asanaProject);
    })

    // Execute comment sync operations
    .then(function () {
      return P.map(this.commentSyncOpsList, function (commentSyncOps) {
        commentSync.logOps(commentSyncOps, asanaProject);
        return commentSync.execOps(commentSyncOps);
      });
    });
}


module.exports = {
  syncAsanaProject : syncAsanaProject
  
  // Private methods exposed for testing
};