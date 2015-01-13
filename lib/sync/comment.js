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
  opsModule = require("./ops"),
  _ = require("lodash"),
  P = require("bluebird"),
  util = require("util");


/**
 * Compare comments from Asana and Github, and generate the set of operations in 
 * both systems needed to synchronize them.
 * @param {comment:Comment[]} asanaComments - Can be empty.
 * @param {comment:Comment[]} githubComments - Can be empty. Assumed to be 
 *    within a single GitHub repository.
 * @param {sync/ops:Ops} [ops] - A pre-initialized Ops. If provided, will be 
 *    populated by reference.
 * @returns {sync/ops:Ops}
 *
 * @static
 * @private
 */
function diff (asanaComments, githubComments, ops) {
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

  // will hold all github comments that have an aa_id field, ie. created in Asana
  var gitHubCommentsByAsanaId = {};

  // will hold all github comments without aa_id field, ie. created in GitHub
  var gitHubCommentsByGitHubId = {}; 
  
  if (!ops) {
    ops = opsModule.create();
  }

  //console.log("@@@@@@@@ ASANA ITEMS\n" + JSON.stringify(asanaItems, null, 2));
  //console.log("@@@@@@@@ GITHUB ITEMS\n" + JSON.stringify(githubItems, null, 2));

  // Index github comments either by asana comment id if any, or github comment ID
  githubComments.forEach(function (gitHubComment) {
    if (gitHubComment.fields["aa.id"]) {
      gitHubCommentsByAsanaId[gitHubComment.fields["aa.id"]] = gitHubComment;
    }
    else {
      gitHubCommentsByGitHubId[gitHubComment.fields["gh.id"]] = gitHubComment;
    }
  });


  // Sort comments to have most recently updated first.
  // Should we have duplicates, the most recent will win
  asanaComments.sort(function(a, b) {
    return b.lastUpdated - a.lastUpdated;
  });
  
  // Process asana comments, looking up matching github comments
  // Update those found, add those not found.
  asanaComments.forEach(function (asanaComment) {
    var gitHubComment;
    
    // Lookup GitHub comment by GitHub ID (comment created in GitHub)
    if (asanaComment.fields["gh.id"]) {
      if (gitHubCommentsByGitHubId[asanaComment.fields["gh.id"]]) {
        gitHubComment = gitHubCommentsByGitHubId[asanaComment.fields["gh.id"]];
        delete gitHubCommentsByGitHubId[asanaComment.fields["gh.id"]];
      }
      else {
        ops.asana.del.push(asanaComment);
        return;
      }
    }
    // Lookup GitHub comment by Asana ID (comment created in Asana)
    else if (gitHubCommentsByAsanaId[asanaComment.fields["aa.id"]]) {
      gitHubComment = gitHubCommentsByAsanaId[asanaComment.fields["aa.id"]];
      delete gitHubCommentsByAsanaId[asanaComment.fields["aa.id"]];
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
  
  // Process remaining github comments that have an aa.id field (ie. created 
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


/**
 * Get the set of operations needed to synchronize the comments of an Asana 
 * item with a GitHub item based on their current state.
 * @param  {item:Item} asanaItem 
 * @param  {item:Item} gitHubItem
 * @returns {sync/ops:Ops}
 */
function getOps (asanaItem, gitHubItem) {
  var join = P.join;
  var ops = opsModule.create({});

  ops.asana.parent = asanaItem;
  ops.github.parent = gitHubItem;

  return join(
    asana.getComments(asanaItem), 
    github.getComments(gitHubItem), 
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
  return P.map(ops.asana.create, function (asanaComment) {
    return asana.createComment(asanaComment, ops.asana.parent)
      .catch(function (e) {
        asanaComment.error = e.error;
      });
  })
  // .then(function (res) {
  //   console.log("asanaCreateResults\n%s", JSON.stringify(res, null, 2));
  // });
  
  // Asana update
  .then(function () {
    return P.map(ops.asana.update, function (updateOp) {
      updateOp.nue.error = {
        text : "Unsupported update of Asana comment: " + JSON.stringify(updateOp.old),
        unsupported : true
      };
      return updateOp;
    });
  })
  // .then(function (res) {
  //   console.log("asanaUpdateResults\n%s", JSON.stringify(res, null, 2));
  // });

  // Asana delete
  .then(function () {
    return P.map(ops.asana.del, function (asanaComment) {
      asanaComment.error = {
        text : "Unsupported delete of Asana comment: " + JSON.stringify(asanaComment),
        unsupported: true
      };
      return asanaComment;
    });
  })
  // .then(function (res) {
  //   console.log("asanaDeleteResults\n%s", JSON.stringify(res, null, 2));
  // });


  // Github create
  .then(function () {
    return P.map(ops.github.create, function (gitHubComment) {
      return github.createComment(gitHubComment, ops.github.parent)
        .catch(function (e) {
          gitHubComment.error = e.error;
        });
    });
  })
  // .then(function (res) {
  //   console.log("githubCreateResults\n%s", JSON.stringify(res, null, 2));
  // });

  // Github update
  .then(function () {
    return P.map(ops.github.update, function (updateOp) {
      return github.updateComment(updateOp.old, updateOp.nue, ops.github.parent)
        .catch(function (e) {
          updateOp.nue.error = e.error;
        });
    });
  })
  // .then(function (res) {
  //   console.log("githubUpdateResults\n%s", JSON.stringify(res, null, 2));
  // });
   
  // GitHub delete
  .then(function () {
    return P.map(ops.github.del, function (gitHubComment) {
      return github.deleteComment(gitHubComment, ops.github.parent)
        .catch(function (e) {
          gitHubComment.error = e.error;
        });
    });
  });
  // .then(function (res) {
  //   console.log("githubDeleteResults\n%s", JSON.stringify(res, null, 2));
  // });
}


/**
 * Build an array of string log entries, one for each operation listed.
 * @param {sync/ops:Ops} ops
 * @param  {asana:Project} asanaProject - Project as returned by 
 *    asana.getProjects.
 * @return {string[]} An array of log strings, ready for presentation.
 */
function getOpsLog(ops, asanaProject) {
  var log = [];
  var wrapError = function (msg, error) {
    return error? "ERROR - " + msg + ". CAUSE: " + error.text : msg;
  };

  ops.asana.create.forEach(function (op) {
    var msg = util.format("Create Asana comment in %s: %s: %s", 
      asanaProject.name.substr(0, 20).trim(),
      ops.asana.parent.title.substr(0, 40).trim(),
      op.body.substr(0, 20).trim());
    log.push(wrapError(msg, op.error));
  });

  ops.asana.update.forEach(function (op) {
    var msg = util.format("Update Asana comment in %s: %s: %s", 
      asanaProject.name.substr(0, 20).trim(), 
      ops.asana.parent.title.substr(0, 40).trim(),
      op.nue.body.substr(0, 20).trim());
    log.push(wrapError(msg, op.nue.error));
  });

  ops.asana.del.forEach(function (op) {
    var msg = util.format("Delete Asana comment in %s: %s: %s", 
      asanaProject.name.substr(0, 20).trim(),
      ops.asana.parent.title.substr(0, 40).trim(),
      op.body.substr(0, 20).trim());
    log.push(wrapError(msg, op.error));
  });


  ops.github.create.forEach(function (op) {
    var msg = util.format("Create GitHub comment in %s/%s: %s: %s", 
      ops.github.parent.fields["gh.owner"], 
      ops.github.parent.fields["gh.repo"], 
      ops.github.parent.title.substr(0, 40).trim(),
      op.body.substr(0, 20).trim());
    log.push(wrapError(msg, op.error));
  });

  ops.github.update.forEach(function (op) {
    var msg = util.format("Update GitHub comment in %s/%s: %s: %s", 
      ops.github.parent.fields["gh.owner"], 
      ops.github.parent.fields["gh.repo"], 
      ops.github.parent.title.substr(0, 40).trim(),
      op.nue.body.substr(0, 20).trim());
    log.push(wrapError(msg, op.nue.error));
  });

  ops.github.del.forEach(function (op) {
    var msg = util.format("Delete GitHub comment in %s/%s: %s: %s", 
      ops.github.parent.fields["gh.owner"], 
      ops.github.parent.fields["gh.repo"], 
      ops.github.parent.title.substr(0, 40).trim(),
      op.body.substr(0, 20).trim());
    log.push(wrapError(msg, op.error));
  });

  return log;
}

/**
 * Build a lookup of parent items per service that had errors while executing
 * children operations (on comments). If the error was due to an unsupported
 * operation, the error is ignored.
 * @param {sync/ops:Ops} ops
 * @param {object} [parents] - Optional pre-initialized parents
 * @return {object} 
 */
function getParentsWithChildrenError (ops, parents) {
  parents = parents ? parents : {};
  parents.asana = parents.asana ? parents.asana : {};
  parents.github = parents.github ? parents.github : {};

  ops.asana.create.forEach(function (op) {
    if (op.error && !op.error.unsupported) {
      parents.asana[ops.asana.parent.managerId] = true;
    }
  });

  ops.asana.update.forEach(function (op) {
    if (op.nue.error && !op.nue.error.unsupported) {
      parents.asana[ops.asana.parent.managerId] = true;
    }
  });

  ops.asana.del.forEach(function (op) {
    if (op.error && !op.error.unsupported) {
      parents.asana[ops.asana.parent.managerId] = true;
    }
  });


  ops.github.create.forEach(function (op) {
    if (op.error && !op.error.unsupported) {
      parents.github[ops.github.parent.fields["gh.number"]] = true;
    }
  });

  ops.github.update.forEach(function (op) {
    if (op.nue.error && !op.nue.error.unsupported) {
      parents.github[ops.github.parent.fields["gh.number"]] = true;
    }
  });

  ops.github.del.forEach(function (op) {
    if (op.error && !op.error.unsupported) {
      parents.github[ops.github.parent.fields["gh.number"]] = true;
    }
  });

  return parents;
}


module.exports = {
  getOps : getOps,
  execOps : execOps,
  getOpsLog : getOpsLog,
  getParentsWithChildrenError : getParentsWithChildrenError,
  
  // Private methods exposed for testing
  diff : diff
};