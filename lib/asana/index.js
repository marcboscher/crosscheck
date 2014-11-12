'use strict';

/**
 * Module to interact with Asana service.
 * @module asana
 * 
 * @borrows module:asana/project.getProjects as getProjects
 * @borrows module:asana/task.getItems as getItems
 * @borrows module:asana/task.updateItem as updateItem
 * @borrows module:asana/task.createItem as createItem
 * @borrows module:asana/comment.getComments as getComments
 */

var project = require("./project"),
	task = require("./task"),
	story = require("./story");


module.exports = {
  getProjects : project.getProjects,
  getItems : task.getItems,
  updateItem : task.updateItem,
  createItem : task.createItem,
  getComments : story.getComments
};