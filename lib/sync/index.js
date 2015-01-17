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
    // TODO return something here. Return rejected promise?
    return;
  }
  
  // Decorate asana project with extracted fields
  asanaProject.fields = fields;
  
  // Get operations to sync items (not their comments)
  return itemSync.getOps(asanaProject, _.cloneDeep(fields))
    
    // Use 'this' to save state for later use in the promise chain
    .bind({})
    
    // Save and execute item ops
    .then(function (itemSyncOps) {
      this.itemSyncOps = itemSyncOps;
      return itemSync.execOps(itemSyncOps);
    })

    // Get, save and execute operations to sync comments
    .then(function () {
      var commentSyncOpsList = [];
      this.commentSyncOpsList = commentSyncOpsList;

      // Get any comment sync operation for items that have changed since last sync
      // Note the concurrency option. This will help make progress when there
      // are a lot comments to sync and we run out of our API rate limits.
      return P.map(this.itemSyncOps.toDiffChildren, function (changedItem) {
        return commentSync.getOps(changedItem.asana, changedItem.github)
          .then(function (commentSyncOps) {
            commentSyncOpsList.push(commentSyncOps);
        
            return commentSync.execOps(commentSyncOps)
              .then(function () {

                // Update coment last sync for every item whose children we 
                // diffed, even if we did not execute any operations. 
                // This will repopulate a cleared cache.
                // Do NOT update item last sync if there were any execution 
                // errors on its children. This will allow for retries.
                if (!commentSync.hasExecutionError(commentSyncOps)) {
                  cache.setLastSync(changedItem.asana.managerId, Date.now() - conf.get("lastSyncSafety"));  
                }
              });
          })
          // Swallow errors from getOps(), return performed ops anyways
          .catch (function (e) {
            // We log only if we did not hit a rate limit
            if (!e.error || e.error.status !== 429) {
              console.warn("Got error from getOps, but continuing anyways - " + (e.error ? e.error : e));
            }
            
            return this;
          });
      // TODO move concurrency value to config
      }, {concurrency : 5});
    })

    // All done!
    .then(function () {
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


/**
 * Synchronize work between services. The main sync entry point.
 * @return {Object} A results object with properties: 
 *    - rateLimitReachedUntil: null or if a rate limit was reached holds the
 *      ms since epoch when we can request again.
 *    - syncLog: array of operations log entries, one per asana project
 *    - errors: array of global errors. Note that individual opsLog
 *      may also include errors which will not be listed in this array.
 *  / github repo. Each entry contains asanaProject, githubRepo, and opsLog (as
 *  array of log strings).
 * @static
 */  
function sync () {
  var res = {
    rateLimitReachedUntil : null,
    syncLog : [],
    errors: []
  };

  // Sync with GitHub
  return asana.getWorkspaces()
    .map(function (workspace) {
      return asana.getProjects(workspace, conf.get("keywordPrefix") + conf.get("github.keyword"))
      // Chained map to maximize concurrency
      .map(function (project) {
        return syncAsanaProject(project)
          .then(
            function (results) {
              res.syncLog.push({
                asanaProject : results.itemSyncOps.asana.parent,
                githubRepo : results.itemSyncOps.github.parent,
                opsLog : getOpsLog(results)
              });
            }
          )
          // Swallow errors from syncAsanaProject()
          .catch(function (e) {
            res.errors.push(e);
          });
      })
      // Swallow errors from getProjects()
      .catch(function (e) {
        res.errors.push(e);
      });
    })
    // Swallow errors from getWorkspaces()
    .catch(function (e) { 
      res.errors.push(e);
      return res;
    })
    .then(function () {
      return res;
    })
    .finally(function () {
      // Inform caller of rate limit info
      res.rateLimitReachedUntil = asana.getRateLimitReachedUntil();
    });
    
}


module.exports = {
  sync : sync,
  
  // Private methods exposed for testing
  syncAsanaProject : syncAsanaProject,
  getOpsLog : getOpsLog
};