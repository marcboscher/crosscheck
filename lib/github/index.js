'use strict';

/**
 * Module to interact with GitHub service.
 * @module github
 */

var issue = require("./issue");


module.exports = {
  getItems : issue.getItems,
  updateItem : issue.updateItem,
  createItem : issue.createItem
};