'use strict';

/**
 * Module to work with Comments.
 * @module comment
 */

/**
 * Generic representation of a work item's comment. Abstracts the details of 
 * inidividual services such as GitHub issue comments or Asana task stories.
 * @typedef {Object} comment:Comment
 * @property {string} [body=] - Comment itself.
 * @property {date} [lastUpdate=Date.now()] - Milliseconds since epoch of last 
 *    change to comment in underlying system.
 * @property {Array.<Object.<string, string>>} [fields] An array of name value 
 *    pairs, one for each field. 
 */
 
var stampit = require("stampit"),
  _ = require("lodash"),
  createComment = stampit();
  
createComment.state(
  {
    "body" : "",
    "lastUpdated": Date.now(),
    "fields" : {}
  }
);


module.exports = {
  /**
   * Create a new Comment
   * @param {item:Comment} initialState - Provide a Comment or any part of a
   *    Comment to set the initial state.
   * @returns {item:Comment} a new Comment with default state overridden by 
   *    provided initialState
   * @function
   */
  create : createComment
};