'use strict';

/**
 * Module to interact with GitHub comments.
 * @module github/comment
 */

 
var conf = require("../conf"),
  item = require("../item"),
  comment = require("../comment"),
  parser = require("../parser"),
  _ = require("lodash"),
  request = require("superagent"),
  P = require("bluebird"),
  apiUrl = "https://api.github.com/",
  user = "ANONYMOUS",
  psw = ""; // always empty

if (conf.get("github.personalAccessToken")) {
  user = conf.get("github.personalAccessToken");
  psw = "x-oauth-basic";
}
else if (conf.get("github.userName") && conf.get("github.password")) {
  user = conf.get("github.userName");
  psw = conf.get("github.password");
}



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
    fieldsAsString = parser.serializeFields(comment.fields);
  
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

  return request
    .get(apiUrl + urlPath)
    .auth(user, psw)
    .promise()
    .then(function (res) {
      return res.body;
    });
}


function getComments (item) {
  if (!item.fields.number) {
    throw new Error("item.fields.number is required");
  }
  if (!item.fields.owner) {
    throw new Error("item.fields.owner is required");
  }
  if (!item.fields.repo) {
    throw new Error("item.fields.repo is required");
  }

  return getGitHubComments(item.fields.number, item.fields.owner, item.fields.repo)
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
  
  if (!item.fields.number) {
    throw new Error("item.fields.number is required");
  }
  if (!item.fields.owner) {
    throw new Error("item.fields.owner is required");
  }
  if (!item.fields.repo) {
    throw new Error("item.fields.repo is required");
  }

  urlPath = "repos/" + 
    item.fields.owner + "/" + 
    item.fields.repo + "/issues/" + 
    item.fields.number + "/comments";

  //console.log("$$$$ CREATING STORY \n" + JSON.stringify(story, null, 2));
  
  return request
    .post(apiUrl + urlPath)
    .send(gitHubComment)
    .auth(user, psw)
    .promise()
    .then(function (res) {
      return toComment(res.data);
    });
}



module.exports = {
  getComments : getComments,
  createComment : createComment,
  
  // Private methods exposed for testing
  toComment: toComment,
  fromComment : fromComment,
  getGitHubComments : getGitHubComments
  
};