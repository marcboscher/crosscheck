'use strict';

/**
 * Module to interact with Asana service.
 * @module asana
 *
 * @borrows module:asana/helper.getRateLimitReachedUntil as getRateLimitReachedUntil
 * @borrows module:asana/project.getProjects as getProjects
 * @borrows module:asana/task.getItems as getItems
 * @borrows module:asana/task.updateItem as updateItem
 * @borrows module:asana/task.createItem as createItem
 * @borrows module:asana/comment.getComments as getComments
 * @borrows module:asana/comment.createComment as createComment
 */

var helper = require("./helper"),
  workspace = require("./workspace"),
	project = require("./project"),
	task = require("./task"),
	story = require("./story");


module.exports = {
  getRateLimitReachedUntil : helper.getRateLimitReachedUntil,
  getWorkspaces : workspace.getWorkspaces,
  getProjects : project.getProjects,
  getItems : task.getItems,
  updateItem : task.updateItem,
  createItem : task.createItem,
  getComments : story.getComments,
  createComment : story.createComment
};