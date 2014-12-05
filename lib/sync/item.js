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
  opsModule = require("./ops"),
  _ = require("lodash"),
  P = require("bluebird");


/**
 * Compare items from Asana and Github, and generate the set of operations in 
 * both systems needed to synchronize them.
 * @param {item:Item[]} asanaItems - Can be empty.
 * @param {item:Item[]} githubItems - Can be empty. Assumed to be within a 
 *    single GitHub repository (issue numbers are unique).
 * @param {sync/ops:Ops} [ops] - A pre-initialized Ops. If provided, will be 
 *    populated by reference.
 * @returns {sync/ops:Ops}
 *
 * @static
 * @private
 */
function diff (asanaItems, githubItems, ops) {
  var githubItemsByNumber = {};
  
  if (!ops) {
    ops = opsModule.create();
  }

  //console.log("@@@@@@@@ ASANA ITEMS\n" + JSON.stringify(asanaItems, null, 2));
  //console.log("@@@@@@@@ GITHUB ITEMS\n" + JSON.stringify(githubItems, null, 2));

  // Index github items by github number, for quick lookup
  githubItems.forEach(function (githubItem) {
    githubItemsByNumber[githubItem.fields["gh.number"]] = githubItem;
  });
  
  // Process asana items, looking up matching github items
  // Update those found, add those not found.
  asanaItems.forEach(function (asanaItem) {
    var githubItem, 
      lastSync;
    
    // Assume that if we don't have a number field in asana item, then it is a new item
    if (!asanaItem.fields["gh.number"]) {
      ops.github.create.push(asanaItem);
      return;
    }
    
    // Lookup github item by its number
    githubItem = githubItemsByNumber[asanaItem.fields["gh.number"]];
    // We then remove it so we can later detect which github items are no in asana
    delete githubItemsByNumber[asanaItem.fields["gh.number"]];
    
    // If we have a number field in asana item, but no matching number in 
    // github, then delete in asana
    if (!githubItem) {
      ops.asana.del.push(asanaItem);
      return;
    }
    
    // Compare the two items' contents
    switch (item.compare(asanaItem, githubItem)) {
      case -1: 
        // Asana most recent, update github
        ops.github.update.push({old : githubItem, nue : asanaItem});
        break;
      case 1: 
        // Github most recent, update asana
        ops.asana.update.push({old : asanaItem, nue : githubItem});
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
      ops.toDiffChildren.push({asana : asanaItem, github : githubItem});
    }
  });
  
  // Process remaining github items that did not have a matching asana item.
  // Add them to asana.
  Object.keys(githubItemsByNumber).forEach(function (key) {
    ops.asana.create.push(githubItemsByNumber[key]);
  });
        
  return ops;
}


/**
 * Get the set of operations needed to synchronize an Asana project with a
 * GitHub repository based on their current state.
 * @param  {asana:Project} asanaProject - Project as returned by 
 *    asana.getProjects.
 * @param  {github:RepoId} githubRepoId - Identification of GitHub repo.
 * @returns {sync/ops:Ops}
 */
function getOps (asanaProject, githubRepoId) {
  var join = P.join;
  var ops = opsModule.create({});

  ops.asana.parent = asanaProject;
  ops.github.parent = githubRepoId;

  return join(
    asana.getItems(asanaProject), 
    github.getItems(githubRepoId),
    ops,
    diff);
}


/**
 * Execute operations accross services.
 * @param {sync/ops:Ops} ops
 */
function execOps (ops) {
  //console.log("####OPS#####\n%s", JSON.stringify(ops, null, 2));
  
  // Asana create
  return P.map(ops.asana.create, function (item) {
    return asana.createItem(item, ops.asana.parent);
  })
  // .then(function (res) {
  //   console.log("asanaCreateResults\n%s", JSON.stringify(res, null, 2));
  // });
  
  // Asana update
  .then(function () {
    return P.map(ops.asana.update, function (updateOp) {     
      return asana.updateItem(updateOp.old, updateOp.nue)
        .then(function (updatedItem) {
          if (updatedItem.lastUpdated) {
            cache.setLastSync(updateOp.old.managerId, updatedItem.lastUpdated);
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
  
  // Asana delete
  .then(function () {
    return P.map(ops.asana.del, function (item) {
      console.warn("Unsupported delete of Asana item: %s", 
        JSON.stringify(item));
    });
  })
  // .then(function (res) {
  //   console.log("asanaDeleteResults\n%s", JSON.stringify(res, null, 2));
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
      return github.updateItem(updateOp.old, updateOp.nue)
        .then(function (updatedItem) {
          if (updatedItem.lastUpdated) {
            cache.setLastSync(updateOp.nue.managerId, updatedItem.lastUpdated);
          } 
          else {
            console.warn("Update failed %s", JSON.stringify(updatedItem));
          }
          return updatedItem;
        });
    });
  })
  // .then(function (res) {
  //   console.log("githubUpdateResults\n%s", JSON.stringify(res, null, 2));
  // })
  
  // GitHub delete
  .then(function () {
    return P.map(ops.github.del, function (item) {
      console.warn("Unsupported delete of GitHub item: %s", 
        JSON.stringify(item));
    });
  });
  // .then(function (res) {
  //   console.log("githubDeleteResults\n%s", JSON.stringify(res, null, 2));
  // }); 
  
}


/**
 * Log item operations to console.
 * @param {sync/ops:Ops} ops
 */
function logOps(ops) {

  ops.asana.create.forEach(function (op) {
    console.log("I.%s.C %s: %s", 
      conf.get("asana.keyword"), 
      ops.asana.parent.name.substr(0, 20).trim(), 
      op.title.substr(0, 20).trim());
  });

  ops.asana.update.forEach(function (op) {
    console.log("I.%s.U %s: %s", 
      conf.get("asana.keyword"), 
      ops.asana.parent.name.substr(0, 20).trim(), 
      op.nue.title.substr(0, 20).trim());
  });

  ops.github.create.forEach(function (op) {
    console.log("I.%s.C %s/%s: %s", 
      conf.get("github.keyword"), 
      op.fields["gh.owner"], 
      op.fields["gh.repo"], 
      op.title.substr(0, 20).trim());
  });

  ops.github.update.forEach(function (op) {
    console.log("I.%s.U %s/%s: %s", 
      conf.get("github.keyword"), 
      op.old.fields["gh.owner"], 
      op.old.fields["gh.repo"], 
      op.nue.title.substr(0, 20).trim());
  });
}


module.exports = {
  getOps : getOps,
  execOps : execOps,
  logOps : logOps,
  
  // Private methods exposed for testing
  diff : diff
};