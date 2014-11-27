'use strict';

/**
 * Synchronization module for Items.
 * @module sync/item
 */

var conf = require("../conf"),
  item = require("../item"),
  asana = require("../asana"),
  github = require("../github"),
  cache = require("../cache"),
  _ = require("lodash"),
  P = require("bluebird");


/**
 * Compare items from Asana and Github, and generate the set of operations in 
 * both systems needed to synchronize them.
 * @param {item:Item[]} asanaItems - Can be empty.
 * @param {item:Item[]} githubItems - Can be empty. Assumed to be within a 
 *    single GitHub repository (issue numbers are unique).
 * @returns {sync:Ops}
 *
 * @static
 * @private
 */
function diff (asanaItems, githubItems) {
  var ops = {
    asana : {
      create : [],
      update : []
    },
    github : {
      create : [],
      update : []
    },
    toDiffComments : [] // <asanaItem, gitHubItem>
  }, 
  githubItemsByNumber = {};
  
  //console.log("@@@@@@@@ ASANA ITEMS\n" + JSON.stringify(asanaItems, null, 2));
  //console.log("@@@@@@@@ GITHUB ITEMS\n" + JSON.stringify(githubItems, null, 2));

  // Index github items by github number, for quick lookup
  githubItems.forEach(function (githubItem) {
    githubItemsByNumber[githubItem.fields.number] = githubItem;
  });
  
  // Process asana items, looking up matching github items
  // Update those found, add those not found.
  asanaItems.forEach(function (asanaItem) {
    var githubItem, 
      lastSync;
    
    // Assume that if we don't have a number field in asana item, then it is a new item
    if (!asanaItem.fields.number) {
      ops.github.create.push(asanaItem);
      return;
    }
    
    // Lookup github item by its number
    githubItem = githubItemsByNumber[asanaItem.fields.number];
    // We then remove it so we can later detect which github items are no in asana
    delete githubItemsByNumber[asanaItem.fields.number];
    
    // If we have a number field in asana item, but no matching number in github, something went wrong
    if (!githubItem) {
      console.warn("Ignoring an Asana task with a GitHub number, but without a corresponding GitHub issue %s", JSON.stringify(asanaItem));
      // TODO handle this in a better way: close asana item, or add error + comment. see https://app.asana.com/0/17620819608782/17983593201516
      // TODO add to delete list, let exec method skip it
      return;
    }
    
    // Compare the two items' contents
    switch (item.compare(asanaItem, githubItem)) {
      case -1: 
        // Asana most recent, update github
        ops.github.update.push({oldItem : githubItem, newItem : asanaItem});
        break;
      case 1: 
        // Github most recent, update asana
        ops.asana.update.push({oldItem : asanaItem, newItem : githubItem});
        break;
      case 0:
        // No difference, nothing to sync
        break;
      default:
        throw "Unexpected switch case";
    }

    // Compare lastUpdated timestamp of items to the time of last sync
    // If any was modified since last sync, we need to check their diff their comments
    lastSync = cache.getLastSync(asanaItem.managerId);
    if (asanaItem.lastUpdated > lastSync || githubItem.lastUpdated > lastSync) {
      ops.toDiffComments.push({asanaItem : asanaItem, gitHubItem : githubItem});
    }
  });
  
  // Process remaining github items that did not have a matching asana item.
  // Add them to asana.
  Object.keys(githubItemsByNumber).forEach(function (key) {
    ops.asana.create.push(githubItemsByNumber[key]);
  });
        
  return ops;
}


// TODO comment
function getOps (asanaProject, fields) {
  var join = P.join;

  return join(
    asana.getItems(asanaProject), 
    github.getItems(fields), 
    diff);
}


/**
 * Execute operations accross services.
 * @param {sync:Ops} ops
 * @param {asana:Project} asanaProject
 *
 * @static
 * @private
 */
function execOps (ops, asanaProject) {
  //console.log("####OPS#####\n%s", JSON.stringify(ops, null, 2));
  
  // Asana create
  return P.map(ops.asana.create, function (item) {
    return asana.createItem(item, asanaProject);
  })
  // .then(function (res) {
  //   console.log("asanaCreateResults\n%s", JSON.stringify(res, null, 2));
  // });
  
  // Asana update
  .then(function () {
    return P.map(ops.asana.update, function (updateOp) {
      // TODO only update if item contents are actually different
      // We only compared modification timestamps which could change even if
      // content did not.
      
      return asana.updateItem(updateOp.oldItem, updateOp.newItem)
        .then(function (updatedItem) {
          if (updatedItem.lastUpdated) {
            cache.setLastSync(updateOp.oldItem, updatedItem.lastUpdated);
          } 
          else {
            console.warn("Update failed %s", JSON.stringify(updatedItem));
          }
          return updatedItem;
        });
    });
  })
  // .then(function (res) {
  //   console.log("asanaUpdateResults\n%s", JSON.stringify(res, null, 2));
  // });

  // Github create
  .then(function () {
    return P.map(ops.github.create, function (item) {
      return github.createItem(item).then(function (newGithubItem) {
        // After a create in github, need to update asana to give it the github issue number
        return asana.updateItem(item, newGithubItem);
      });
    });
  })
  // .then(function (res) {
  //   console.log("githubCreateResults\n%s", JSON.stringify(res, null, 2));
  // });

  // Github update
  .then(function () {
    return P.map(ops.github.update, function (updateOp) {
      // TODO only update if item contents are actually different
      // We only compared modification timestamps which could change even if
      // content did not.
      
      return github.updateItem(updateOp.oldItem, updateOp.newItem)
        .then(function (updatedItem) {
          if (updatedItem.lastUpdated) {
            cache.setLastSync(updateOp.newItem, updatedItem.lastUpdated);
          } 
          else {
            console.warn("Update failed %s", JSON.stringify(updatedItem));
          }
          return updatedItem;
        });
    });
  });
  // .then(function (res) {
  //   console.log("githubUpdateResults\n%s", JSON.stringify(res, null, 2));
  // });
}


/**
 * Log item operations to console.
 *
 * @static
 * @private
 */
function logOps(ops, asanaProject) {

  ops.asana.create.forEach(function (op) {
    console.log("I.%s.C %s: %s", 
      conf.get("asana.serviceAbbr"), 
      asanaProject.name.substr(0, 20).trim(), 
      op.title.substr(0, 20).trim());
  });

  ops.asana.update.forEach(function (op) {
    console.log("I.%s.U %s: %s", 
      conf.get("asana.serviceAbbr"), 
      asanaProject.name.substr(0, 20).trim(), 
      op.newItem.title.substr(0, 20).trim());
  });

  ops.github.create.forEach(function (op) {
    console.log("I.%s.C %s/%s: %s", 
      conf.get("github.serviceAbbr"), 
      op.fields.owner, 
      op.fields.repo, 
      op.title.substr(0, 20).trim());
  });

  ops.github.update.forEach(function (op) {
    console.log("I.%s.U %s/%s: %s", 
      conf.get("github.serviceAbbr"), 
      op.oldItem.fields.owner, 
      op.oldItem.fields.repo, 
      op.newItem.title.substr(0, 20).trim());
  });
}


module.exports = {
  getOps : getOps,
  execOps : execOps,
  logOps : logOps,
  
  // Private methods exposed for testing
  diff : diff
};