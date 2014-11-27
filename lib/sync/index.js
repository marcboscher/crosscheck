'use strict';

/**
 * Synchronization module for Items and Comments.
 * @module sync 
 */

/**
 * A set of create and update item operations for different services.
 * @typedef {Object} sync:Ops
 *
 * @property {Object} asana - Operations for Asana service
 * @property {Array.<item:Item>} asana.create - Set of Items to create, which can be empty.
 * @property {Object[]} asana.update - Set of update operations, which can be empty.
 * @property {item:Item} asana.update.oldItem - Asana Item to update.
 * @property {item:Item} asana.update.newItem - Item with new values for update.
 *
 * @property {Object} github - Operations for GitHub service
 * @property {Array.<item:Item>} github.create - Set of Items to create, which can be empty.
 * @property {Object[]} github.update - Set of update operations, which can be empty.
 * @property {item:Item} github.update.oldItem - GitHub Item to update.
 * @property {item:Item} github.update.newItem - Item with new values for update.
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
  
  // Check source
   if (fields.source !== conf.get("github.serviceAbbr")) {
     console.warn("Skipping project with missing or unrecognized source field. " + JSON.stringify(asanaProject));
     return;
  }
  
  // Check Github fields
  if (!fields.owner || !fields.repo) {
    console.warn("Skipping project with missing owner or repo fields. " + asanaProject);
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
        return commentSync.getOps(changedItem.asanaItem, changedItem.gitHubItem)
          .then(function (ops) {
            // Decorate the operations with the parent items for later use
            ops.asana.item = changedItem.asanaItem;
            ops.github.item = changedItem.gitHubItem;
            return ops;
          });
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
        return commentSync.execOps(commentSyncOps, 
                                   commentSyncOps.asana.item, 
                                   commentSyncOps.github.item);
      });
    });
}


module.exports = {
  syncAsanaProject : syncAsanaProject
  
  // Private methods exposed for testing
};