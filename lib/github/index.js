'use strict';

/**
 * Module to interact with GitHub service.
 * @module github
 * 
 * @borrows module:github/issue.getItems as getItems
 * @borrows module:github/issue.updateItem as updateItem
 * @borrows module:github/issue.createItem as createItem
 */

/**
 * A GitHub repository identification, consisting in its name and owner.
 * @typedef {Object} github:RepoId
 *
 * @property {string} "gh.owner" - login name of GitHub or organization user owning 
 *    the repository.
 * @property {string} "gh.repo" - name of repository.
 */


var issue = require("./issue"),
	comment = require("./comment");


module.exports = {
  getItems : issue.getItems,
  updateItem : issue.updateItem,
  createItem : issue.createItem,
  getComments : comment.getComments,
  createComment : comment.createComment,
  updateComment : comment.updateComment,
  deleteComment : comment.deleteComment,
};