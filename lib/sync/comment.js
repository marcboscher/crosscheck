'use strict';

/**
 * Synchronization module for Comments.
 * @module sync/comment
 */

var conf = require("../conf"),
  item = require("../item"),
  comment = require("../comment"),
  asana = require("../asana"),
  github = require("../github"),
  cache = require("../cache"),
  _ = require("lodash"),
  P = require("bluebird");


/**
 * Compare comments from Asana and Github, and generate the set of operations in 
 * both systems needed to synchronize them.
 * @param {comment:Comment[]} asanaComments - Can be empty.
 * @param {comment:Comment[]} githubComments - Can be empty. Assumed to be 
 *    within a single GitHub repository.
 * @param {number} itemLastSyncAt - ms since epoch of parent item's last sync.
 * @returns {sync:Ops}
 *
 * @static
 * @private
 */
function diff (asanaComments, githubComments) {
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

  var ops = {
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
        ops.asana.del.push(asanaComment);
        return;
      }
    }
    // Lookup GitHub comment by Asana ID (comment created in Asana)
    else if (gitHubCommentsByAsanaId[asanaComment.fields.as_id]) {
      gitHubComment = gitHubCommentsByAsanaId[asanaComment.fields.as_id];
      delete gitHubCommentsByAsanaId[asanaComment.fields.as_id];
    }
    else {
      ops.github.create.push(asanaComment);
      return;
    }

    // Compare the two items' contents
    switch (comment.compare(asanaComment, gitHubComment)) {
      case -1: 
        // Asana most recent, update github
        ops.github.update.push({old : gitHubComment, nue : asanaComment});
        break;
      case 1: 
        // Github most recent, update asana
        ops.asana.update.push({old : asanaComment, nue : gitHubComment});
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
    ops.github.del.push(gitHubCommentsByAsanaId[key]);
  });

  // Process remaining github comments that did not have a matching asana comment.
  // Add them to asana.
  Object.keys(gitHubCommentsByGitHubId).forEach(function (key) {
    ops.asana.create.push(gitHubCommentsByGitHubId[key]);
  });
        
  return ops;
}


// TODO comment
function getOps (asanaItem, gitHubItem) {
  var join = P.join;

  return join(
    asana.getComments(asanaItem), 
    github.getComments(gitHubItem), 
    diff);
}


// TODO comment
function execOps (ops, asanaItem, gitHubItem) {

  //console.log("####OPS#####\n%s", JSON.stringify(ops, null, 2));
  
  // Asana create
  return P.map(ops.asana.create, function (asanaComment) {
    return asana.createComment(asanaComment, asanaItem);
  })
  // .then(function (res) {
  //   console.log("asanaCreateResults\n%s", JSON.stringify(res, null, 2));
  // });
  
  // Asana update
  .then(function () {
    return P.map(ops.asana.update, function (updateOp) {
      console.warn("Unsupported update of Asana comment: %s", 
        JSON.stringify(updateOp.old));
    });
  })
  // .then(function (res) {
  //   console.log("asanaUpdateResults\n%s", JSON.stringify(res, null, 2));
  // });

  // Asana delete
  .then(function () {
    return P.map(ops.asana.del, function (asanaComment) {
      console.warn("Unsupported delete of Asana comment: %s", 
        JSON.stringify(asanaComment));
    });
  })
  // .then(function (res) {
  //   console.log("asanaDeleteResults\n%s", JSON.stringify(res, null, 2));
  // });


  // Github create
  .then(function () {
    return P.map(ops.github.create, function (gitHubComment) {
      return github.createComment(gitHubComment, gitHubItem);
    });
  })
  // .then(function (res) {
  //   console.log("githubCreateResults\n%s", JSON.stringify(res, null, 2));
  // });

  // Github update
  .then(function () {
    return P.map(ops.github.update, function (updateOp) {
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
    return P.map(ops.github.del, function (gitHubComment) {
      return github.deleteComment(gitHubComment, gitHubItem);
    });
  });
  // .then(function (res) {
  //   console.log("githubDeleteResults\n%s", JSON.stringify(res, null, 2));
  // });
}


/**
 * Log comment operations to console.
 *
 * @static
 * @private
 */
function logOps(ops, asanaProject) {

  ops.asana.create.forEach(function (op) {
    console.log("C.%s.C %s: %s: %s", 
      conf.get("asana.serviceAbbr"), 
      asanaProject.name.substr(0, 20).trim(),
      ops.asana.item.title.substr(0, 20).trim(),
      op.body.substr(0, 20).trim());
  });

  ops.asana.update.forEach(function (op) {
    console.log("C.%s.U %s: %s: %s", 
      conf.get("asana.serviceAbbr"), 
      asanaProject.name.substr(0, 20).trim(), 
      ops.asana.item.title.substr(0, 20).trim(),
      op.nue.body.substr(0, 20).trim());
  });

  ops.asana.del.forEach(function (op) {
    console.log("C.%s.D %s: %s: %s", 
      conf.get("asana.serviceAbbr"), 
      asanaProject.name.substr(0, 20).trim(),
      ops.asana.item.title.substr(0, 20).trim(),
      op.body.substr(0, 20).trim());
  });


  ops.github.create.forEach(function (op) {
    console.log("C.%s.C %s/%s: %s: %s", 
      conf.get("github.serviceAbbr"), 
      ops.github.item.fields.owner, 
      ops.github.item.fields.repo, 
      ops.github.item.title.substr(0, 20).trim(),
      op.body.substr(0, 20).trim());
  });

  ops.github.update.forEach(function (op) {
    console.log("C.%s.U %s/%s: %s: %s", 
      conf.get("github.serviceAbbr"), 
      ops.github.item.oldItem.fields.owner, 
      ops.github.item.oldItem.fields.repo, 
      ops.github.item.title.substr(0, 20).trim(),
      op.nue.body.substr(0, 20).trim());
  });

  ops.github.del.forEach(function (op) {
    console.log("C.%s.D %s/%s: %s: %s", 
      conf.get("github.serviceAbbr"), 
      ops.github.item.fields.owner, 
      ops.github.item.fields.repo, 
      ops.github.item.title.substr(0, 20).trim(),
      op.body.substr(0, 20).trim());
  });
}


module.exports = {
  getOps : getOps,
  execOps : execOps,
  logOps : logOps,
  
  // Private methods exposed for testing
  diff : diff
};