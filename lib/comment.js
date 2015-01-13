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
 * @property {Object} [error=null] - Holds an error object if an error occurred 
 *    while performing an operation on this comment. At least this object will
 *    contain a "text" property describing the cause.
 */
 
var stampit = require("stampit"),
  _ = require("lodash"),
  createComment = stampit();
  
createComment.state(
  {
    "body" : "",
    "lastUpdated": Date.now(),
    "fields" : {},
    "error" : null
  }
);


/**
 * Compare two Comments and, if different, indicate which one is the most recently
 * updated.
 *
 * @param {comment:Comment} commentA
 * @param {comment:Comment} commentB
 *
 * @returns 0 if equal, otherwise:
 * 
 *  - -1 if commentA is most recently updated
 *  - 1 if commentB is most recently updated
 *
 * @static
 */
function compare(commentA, commentB) {
  var res = commentA.lastUpdated > commentB.lastUpdated ? -1 : 1;
  
  // Ignore white space on body

  return _.isEqual(commentA.body.trim(), commentB.body.trim()) ? 0 : res;
}


module.exports = {
  /**
   * Create a new Comment
   * @param {item:Comment} initialState - Provide a Comment or any part of a
   *    Comment to set the initial state.
   * @returns {item:Comment} a new Comment with default state overridden by 
   *    provided initialState
   * @function
   */
  create : createComment,
  compare : compare
};