'use strict';

/**
 * Module to interact with Asana service.
 * @module asana
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