'use strict';

/**
 * Module to interact with GitHub service.
 * @module github
 * 
 * @borrows module:github/issue.getItems as getItems
 * @borrows module:github/issue.updateItem as updateItem
 * @borrows module:github/issue.createItem as createItem
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