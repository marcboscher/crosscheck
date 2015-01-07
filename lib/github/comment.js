'use strict';

/**
 * Module to interact with GitHub comments.
 * @module github/comment
 */

 
var conf = require("../conf"),
  helper = require("./helper"),
  item = require("../item"),
  comment = require("../comment"),
  parser = require("../parser"),
  _ = require("lodash"),
  request = require("superagent"),
  P = require("bluebird"),
  apiUrl = "https://api.github.com/";


/**
 * Create a Comment from a GitHub comment.
 * @param {github:Story} comment - Comment as returned by GitHub API.
 * @returns {comment:Comment}
 *
 * @private
 * @static
 */
function toComment (gitHubComment) {
  var com = comment.create({
    "lastUpdated" : Date.parse(gitHubComment["updated_at"])
  });
  
  com.body = parser.extractFields(gitHubComment.body, com.fields);
  com.fields["gh.id"] = gitHubComment.id.toString();
  com.fields["gh.commenter"] = gitHubComment.user.login;
  
  return com;
}


/**
 * Create a GitHub comment from a Comment
 * @param {comment:Comment} comment
 * @returns {github:Comment} Comment ready to be sent to GitHub service.
 * 
 * @private
 * @static
 */
function fromComment (comment) {
  var gitHubComment = {
      body : comment.body
    }, 
    fieldsAsString = "";

  if (comment.fields["aa.id"]) {
    fieldsAsString = parser.serializeFields(
      {
        "aa.commenter" : comment.fields["aa.commenter"],
        "aa.id" : comment.fields["aa.id"]
      }
    );
  }
  
  // Append fields to text
  if (fieldsAsString.length > 0) {
    // Insert 2 blank lines if needed
    if (!gitHubComment.body.endsWith("\n\n")) {
      gitHubComment.body += gitHubComment.body.endsWith("\n") ? "\n" : "\n\n";
    }
    gitHubComment.body += fieldsAsString;
  }
  
  return gitHubComment;
}

/**
 * Get the array of GitHub Comments of a specific issue.
 * @param  {number} taskId - Unique ID of task in Asana.
 * @param  {number} issueNumber - Issue number in GitHub.
 * @param  {string} owner - Repository owner name or org.
 * @param  {string} repo - Repository name.
 * @return {Array.<github:Comment>} - Array of Comment as returned by GitHub API.
 */
function getGitHubComments (issueNumber, owner, repo) {
  var urlPath = "repos/" + owner + "/" + repo + "/issues/" + issueNumber + "/comments";
  var buildRequestFn = function (pageIndex) {
    return request
    .get(apiUrl + urlPath)
    .query(
      {
        "page" : pageIndex,
        "per_page" : 100
      })
    .auth(helper.getUser(), helper.getPsw());
  };

  return helper.requestAllPages(buildRequestFn, "id");
}


function getComments (item) {
  if (!item.fields["gh.number"]) {
    throw new Error("item.fields[\"gh.number\"] is required");
  }
  if (!item.fields["gh.owner"]) {
    throw new Error("item.fields[\"gh.owner\"] is required");
  }
  if (!item.fields["gh.repo"]) {
    throw new Error("item.fields[\"gh.repo\"] is required");
  }

  return getGitHubComments(item.fields["gh.number"], item.fields["gh.owner"], item.fields["gh.repo"])
    .map(function (gitHubComment) {
      return toComment(gitHubComment);
  });

}


/**
 * Create a Comment associated to an issue in GitHub.
 * @param {comment:Comment} comment - the Comment to create.
 * @param {item:Item} item - the Item to comment on.
 * @returns {comment:Comment} - Comment resulting of create.
 *
 * @static
 */
function createComment (comment, item) {
  
  var gitHubComment = fromComment(comment),
    urlPath;
  
  if (!item.fields) {
    throw new Error("item.fields is required");
  }
  if (!item.fields["gh.number"]) {
    throw new Error("item.fields[\"gh.number\"] is required");
  }
  if (!item.fields["gh.owner"]) {
    throw new Error("item.fields[\"gh.owner\"] is required");
  }
  if (!item.fields["gh.repo"]) {
    throw new Error("item.fields[\"gh.repo\"] is required");
  }

  urlPath = "repos/" + 
    item.fields["gh.owner"] + "/" + 
    item.fields["gh.repo"] + "/issues/" + 
    item.fields["gh.number"] + "/comments";

  //console.log("$$$$ CREATING STORY \n" + JSON.stringify(story, null, 2));
  
  return request
    .post(apiUrl + urlPath)
    .send(gitHubComment)
    .auth(helper.getUser(), helper.getPsw())
    .promise()
    .then(function (res) {
      return toComment(res.body);
    });
}


/**
 * Update a comment in GitHub.
 * @param {comment:Comment} oldComment - the Comment to update in GitHub.
 * @param {comment:Comment} newComment - the Comment with updated values.
 * @param {item:Item} parentItem - the Item parent to the comment to update.
 * @returns {comment:Comment} - Comment resulting of update.
 *
 * @static
 */
function updateComment (oldComment, newComment, parentItem) {
  var gitHubComment,
    urlPath;

  if (!parentItem.fields["gh.owner"]) {
    throw new Error("parentItem.fields[\"gh.owner\"] is required");
  }
  if (!parentItem.fields["gh.repo"]) {
    throw new Error("parentItem.fields[\"gh.repo\"] is required");
  }

  // If the new comment already knows the github comment id, then the comment
  // was originally created in github, so we don't need the asana comment id
  if (newComment.fields["gh.id"]) {    
    newComment = _.clone(newComment);
    newComment.fields = _.omit(newComment.fields, "aa.id");
  }


  gitHubComment = fromComment(newComment);

  urlPath = "repos/" + 
    parentItem.fields["gh.owner"] + "/" + 
    parentItem.fields["gh.repo"] + 
    "/issues/comments/" + 
    oldComment.fields["gh.id"];
  
  //console.log("$$$$ UPDATING COMMENT \n" + JSON.stringify(gitHubComment, null, 2));
  
  return request
    .patch(apiUrl + urlPath)
    .send(gitHubComment)
    .auth(helper.getUser(), helper.getPsw())
    .promise()
    .then(function (res) {
      return toComment(res.body);
    });
}


/**
 * Delete a comment from GitHub.
 * @param {comment:Comment} commentToDelete - the Comment to delete in GitHub.
 * @param {item:Item} parentItem - the Item parent to the comment to delete.
 *
 * @static
 */
function deleteComment (commentToDelete, parentItem) {
  var urlPath;

  if (!parentItem.fields["gh.owner"]) {
    throw new Error("parentItem.fields[\"gh.owner\"] is required");
  }
  if (!parentItem.fields["gh.repo"]) {
    throw new Error("parentItem.fields[\"gh.repo\"] is required");
  }

  urlPath = "repos/" + 
    parentItem.fields["gh.owner"] + "/" + 
    parentItem.fields["gh.repo"] + 
    "/issues/comments/" + 
    commentToDelete.fields["gh.id"];
  
  //console.log("$$$$ DELETING COMMENT \n" + JSON.stringify(commentToDelete, null, 2));
  
  return request
    .del(apiUrl + urlPath)
    .auth(helper.getUser(), helper.getPsw())
    .promise();
}


module.exports = {
  getComments : getComments,
  createComment : createComment,
  updateComment : updateComment,
  deleteComment : deleteComment,
  
  // Private methods exposed for testing
  toComment: toComment,
  fromComment : fromComment,
  getGitHubComments : getGitHubComments
  
};