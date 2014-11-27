'use strict';

/**
 * Synchronization module for Items and Comments.
 * @module sync 
 */

/**
 * A set of create and update item operations for different services.
 * @typedef {Object} sync:Operations
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
 
 
var conf = require("./conf"),
  item = require("./item"),
  comment = require("./comment"),
  parser = require("./parser"),
  asana = require("./asana"),
  github = require("./github"),
  cache = require("./cache"),
  _ = require("lodash"),
  P = require("bluebird");


/**
 * Compare items from Asana and Github, and generate the set of operations in 
 * both systems needed to synchronize them.
 * @param {item:Item[]} asanaItems - Can be empty.
 * @param {item:Item[]} githubItems - Can be empty. Assumed to be within a 
 *    single GitHub repository (issue numbers are unique).
 * @returns {sync:Operations}
 *
 * @static
 * @private
 */
function diffItems (asanaItems, githubItems) {
  var operations = {
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
      operations.github.create.push(asanaItem);
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
        operations.github.update.push({oldItem : githubItem, newItem : asanaItem});
        break;
      case 1: 
        // Github most recent, update asana
        operations.asana.update.push({oldItem : asanaItem, newItem : githubItem});
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
      operations.toDiffComments.push({asanaItem : asanaItem, gitHubItem : githubItem});
    }
  });
  
  // Process remaining github items that did not have a matching asana item.
  // Add them to asana.
  Object.keys(githubItemsByNumber).forEach(function (key) {
    operations.asana.create.push(githubItemsByNumber[key]);
  });
        
  return operations;
}


/**
 * Compare comments from Asana and Github, and generate the set of operations in 
 * both systems needed to synchronize them.
 * @param {comment:Comment[]} asanaComments - Can be empty.
 * @param {comment:Comment[]} githubComments - Can be empty. Assumed to be 
 *    within a single GitHub repository.
 * @param {number} itemLastSyncAt - ms since epoch of parent item's last sync.
 * @returns {sync:Operations}
 *
 * @static
 * @private
 */
function diffComments (asanaComments, githubComments) {
  /*
    Implementation note
    Asana cannot update or delete comments, so we need to store an asana comment
    ID in GitHub comment to make this work.

    This implies:
    When a comment is added in GitHub
      - GitHub comment will NOT hold asana comment id
      - Asana comment will hold github comment id 
    Vice-versa when a comment is added in Asana
  */

  var operations = {
    asana : {
      create : [],
      update : [],
      del : []
    },
    github : {
      create : [],
      update : [],
      del : []
    }
  }, 
  // will hold all github comments that have an as_id field, ie. created in Asana
  gitHubCommentsByAsanaId = {}, 
  // will hold all github comments without as_id field, ie. created in GitHub
  gitHubCommentsByGitHubId = {}; 
  
  //console.log("@@@@@@@@ ASANA ITEMS\n" + JSON.stringify(asanaItems, null, 2));
  //console.log("@@@@@@@@ GITHUB ITEMS\n" + JSON.stringify(githubItems, null, 2));

  // Index github comments either by asana comment id if any, or github comment ID
  githubComments.forEach(function (gitHubComment) {
    if (gitHubComment.fields.as_id) {
      gitHubCommentsByAsanaId[gitHubComment.fields.as_id] = gitHubComment;
    }
    else {
      gitHubCommentsByGitHubId[gitHubComment.fields.gh_id] = gitHubComment;
    }
  });
  
  // Process asana comments, looking up matching github comments
  // Update those found, add those not found.
  asanaComments.forEach(function (asanaComment) {
    var gitHubComment;
    
    // Lookup GitHub comment by GitHub ID (comment created in GitHub)
    if (asanaComment.fields.gh_id) {
      if (gitHubCommentsByGitHubId[asanaComment.fields.gh_id]) {
        gitHubComment = gitHubCommentsByGitHubId[asanaComment.fields.gh_id];
        delete gitHubCommentsByGitHubId[asanaComment.fields.gh_id];
      }
      else {
        operations.asana.del.push(asanaComment);
        return;
      }
    }
    // Lookup GitHub comment by Asana ID (comment created in Asana)
    else if (gitHubCommentsByAsanaId[asanaComment.fields.as_id]) {
      gitHubComment = gitHubCommentsByAsanaId[asanaComment.fields.as_id];
      delete gitHubCommentsByAsanaId[asanaComment.fields.as_id];
    }
    else {
      operations.github.create.push(asanaComment);
      return;
    }

    // Compare the two items' contents
    switch (comment.compare(asanaComment, gitHubComment)) {
      case -1: 
        // Asana most recent, update github
        operations.github.update.push({old : gitHubComment, nue : asanaComment});
        break;
      case 1: 
        // Github most recent, update asana
        operations.asana.update.push({old : asanaComment, nue : gitHubComment});
        break;
      case 0:
        // No difference, nothing to sync
        break;
      default:
        throw "Unexpected switch case";
    }
  });
  
  // Process remaining github comments that have an as_id field (ie. created 
  // in Asana) but did not have a matching asana comment (later deleted in Asana).
  // Delete them from GitHub
  Object.keys(gitHubCommentsByAsanaId).forEach(function (key) {
    operations.github.del.push(gitHubCommentsByAsanaId[key]);
  });

  // Process remaining github comments that did not have a matching asana comment.
  // Add them to asana.
  Object.keys(gitHubCommentsByGitHubId).forEach(function (key) {
    operations.asana.create.push(gitHubCommentsByGitHubId[key]);
  });
        
  return operations;
}


// TODO comment
function getItemSyncOperations (asanaProject, fields) {
  var join = P.join;

  return join(
    asana.getItems(asanaProject), 
    github.getItems(fields), 
    diffItems);
}


// TODO comment
function getCommentSyncOperations (asanaItem, gitHubItem) {
  var join = P.join;

  return join(
    asana.getComments(asanaItem), 
    github.getComments(gitHubItem), 
    diffComments);
}


  /**
   * Execute operations accross services.
   * @param {crosscheck:Operations} operations
   * @param {asana:Project} asanaProject
   *
   * @static
   * @private
   */
function execItemOperations (operations, asanaProject) {
  //console.log("####OPS#####\n%s", JSON.stringify(operations, null, 2));
  
  // Asana create
  return P.map(operations.asana.create, function (item) {
    return asana.createItem(item, asanaProject);
  })
  // .then(function (res) {
  //   console.log("asanaCreateResults\n%s", JSON.stringify(res, null, 2));
  // });
  
  // Asana update
  .then(function () {
    return P.map(operations.asana.update, function (updateOp) {
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
    return P.map(operations.github.create, function (item) {
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
    return P.map(operations.github.update, function (updateOp) {
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


// TODO comment
function execCommentOperations (operations, asanaItem, gitHubItem) {

  //console.log("####OPS#####\n%s", JSON.stringify(operations, null, 2));
  
  // Asana create
  return P.map(operations.asana.create, function (asanaComment) {
    return asana.createComment(asanaComment, asanaItem);
  })
  // .then(function (res) {
  //   console.log("asanaCreateResults\n%s", JSON.stringify(res, null, 2));
  // });
  
  // Asana update
  .then(function () {
    return P.map(operations.asana.update, function (updateOp) {
      console.warn("Unsupported update of Asana comment: %s", 
        JSON.stringify(updateOp.old));
    });
  })
  // .then(function (res) {
  //   console.log("asanaUpdateResults\n%s", JSON.stringify(res, null, 2));
  // });

  // Asana delete
  .then(function () {
    return P.map(operations.asana.del, function (asanaComment) {
      console.warn("Unsupported delete of Asana comment: %s", 
        JSON.stringify(asanaComment));
    });
  })
  // .then(function (res) {
  //   console.log("asanaDeleteResults\n%s", JSON.stringify(res, null, 2));
  // });


  // Github create
  .then(function () {
    return P.map(operations.github.create, function (gitHubComment) {
      return github.createComment(gitHubComment, gitHubItem);
    });
  })
  // .then(function (res) {
  //   console.log("githubCreateResults\n%s", JSON.stringify(res, null, 2));
  // });

  // Github update
  .then(function () {
    return P.map(operations.github.update, function (updateOp) {
      console.warn("Unexpected update of GitHub comment (Asana does not support comment edits): %s",
        JSON.stringify(updateOp));
      return github.updateComment(updateOp.old, updateOp.nue, gitHubItem);
    });
  })
  // .then(function (res) {
  //   console.log("githubUpdateResults\n%s", JSON.stringify(res, null, 2));
  // });
   
  // GitHub delete
  .then(function () {
    return P.map(operations.github.del, function (gitHubComment) {
      return github.deleteComment(gitHubComment, gitHubItem);
    });
  });
  // .then(function (res) {
  //   console.log("githubDeleteResults\n%s", JSON.stringify(res, null, 2));
  // });
}


/**
 * Log item operations to console.
 *
 * @static
 * @private
 */
function logItemOperations(operations, asanaProject) {

  operations.asana.create.forEach(function (op) {
    console.log("I.%s.C %s: %s", 
      conf.get("asana.serviceAbbr"), 
      asanaProject.name.substr(0, 20).trim(), 
      op.title.substr(0, 20).trim());
  });

  operations.asana.update.forEach(function (op) {
    console.log("I.%s.U %s: %s", 
      conf.get("asana.serviceAbbr"), 
      asanaProject.name.substr(0, 20).trim(), 
      op.newItem.title.substr(0, 20).trim());
  });

  operations.github.create.forEach(function (op) {
    console.log("I.%s.C %s/%s: %s", 
      conf.get("github.serviceAbbr"), 
      op.fields.owner, 
      op.fields.repo, 
      op.title.substr(0, 20).trim());
  });

  operations.github.update.forEach(function (op) {
    console.log("I.%s.U %s/%s: %s", 
      conf.get("github.serviceAbbr"), 
      op.oldItem.fields.owner, 
      op.oldItem.fields.repo, 
      op.newItem.title.substr(0, 20).trim());
  });
}


/**
 * Log comment operations to console.
 *
 * @static
 * @private
 */
function logCommentOperations(operations, asanaProject) {

  operations.asana.create.forEach(function (op) {
    console.log("C.%s.C %s: %s: %s", 
      conf.get("asana.serviceAbbr"), 
      asanaProject.name.substr(0, 20).trim(),
      operations.asana.item.title.substr(0, 20).trim(),
      op.body.substr(0, 20).trim());
  });

  operations.asana.update.forEach(function (op) {
    console.log("C.%s.U %s: %s: %s", 
      conf.get("asana.serviceAbbr"), 
      asanaProject.name.substr(0, 20).trim(), 
      operations.asana.item.title.substr(0, 20).trim(),
      op.nue.body.substr(0, 20).trim());
  });

  operations.asana.del.forEach(function (op) {
    console.log("C.%s.D %s: %s: %s", 
      conf.get("asana.serviceAbbr"), 
      asanaProject.name.substr(0, 20).trim(),
      operations.asana.item.title.substr(0, 20).trim(),
      op.body.substr(0, 20).trim());
  });


  operations.github.create.forEach(function (op) {
    console.log("C.%s.C %s/%s: %s: %s", 
      conf.get("github.serviceAbbr"), 
      operations.github.item.fields.owner, 
      operations.github.item.fields.repo, 
      operations.github.item.title.substr(0, 20).trim(),
      op.body.substr(0, 20).trim());
  });

  operations.github.update.forEach(function (op) {
    console.log("C.%s.U %s/%s: %s: %s", 
      conf.get("github.serviceAbbr"), 
      operations.github.item.oldItem.fields.owner, 
      operations.github.item.oldItem.fields.repo, 
      operations.github.item.title.substr(0, 20).trim(),
      op.nue.body.substr(0, 20).trim());
  });

  operations.github.del.forEach(function (op) {
    console.log("C.%s.D %s/%s: %s: %s", 
      conf.get("github.serviceAbbr"), 
      operations.github.item.fields.owner, 
      operations.github.item.fields.repo, 
      operations.github.item.title.substr(0, 20).trim(),
      op.body.substr(0, 20).trim());
  });
}

// TODO comment
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
  return getItemSyncOperations(asanaProject, _.cloneDeep(fields))
    
    // Use 'this' to share state
    .bind({})
    
    // Get operations to sync comments
    .then(function (itemSyncOperations) {
      // Save the ops for use later on in promise chain
      this.itemSyncOperations = itemSyncOperations;

      // Get any comment sync operation for items that have changed since last sync
      return P.map(itemSyncOperations.toDiffComments, function (changedItem) {
        return getCommentSyncOperations(changedItem.asanaItem, changedItem.gitHubItem)
          .then(function (operations) {
            // Decorate the operations with the parent items for later use
            operations.asana.item = changedItem.asanaItem;
            operations.github.item = changedItem.gitHubItem;
            return operations;
          });
      });
    })

    .then(function (commentSyncOperationsList) {
      // Save the ops for use later on in promise chain
      // Note this is actually a collection of operation objects, one per item update
      this.commentSyncOperationsList = commentSyncOperationsList;
    })

    // Execute item sync operations
    .then(function () {
      logItemOperations(this.itemSyncOperations, asanaProject);
      return execItemOperations(this.itemSyncOperations, asanaProject);
    })

    // Execute comment sync operations
    .then(function () {
      return P.map(this.commentSyncOperationsList, function (commentSyncOperations) {
        logCommentOperations(commentSyncOperations, asanaProject);
        return execCommentOperations(commentSyncOperations, 
                                     commentSyncOperations.asana.item, 
                                     commentSyncOperations.github.item);
      });
    });
}


module.exports = {
  syncAsanaProject : syncAsanaProject,
  
  // Private methods exposed for testing
  diffItems : diffItems,
  diffComments : diffComments,
  getItemSyncOperations : getItemSyncOperations,
  getCommentSyncOperations : getCommentSyncOperations,
  execItemOperations : execItemOperations,
  execCommentOperations : execCommentOperations
  
};