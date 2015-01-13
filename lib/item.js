'use strict';

/**
 * Module to work with Items.
 * @module item
 */


/**
 * Generic representation of a work item. Abstracts the details of inidividual 
 * services such as GitHub issues or Asana tasks.
 * @typedef {Object} item:Item
 * @property {string} title - Short description.
 * @property {string} [body=] - Full description.
 * @property {string|number} [managedId=undefined] - The unique ID of the 
 *    underlying item within the manager service, typically Asana. Can be 
 *    undefined if the item is not from the manager service. 
 * @property {boolean} [completed=false] - Completion state of item.
 * @property {date} [lastUpdate=Date.now()] - Milliseconds since epoch of last 
 *    change to item in underlying system.
 * @property {string[]} [tags=[]] An array of string tags.
 * @property {Array.<Object.<string, string>>} [fields] An array of name value 
 *    pairs, one for each field. 
 * @property {Object} [error=null] - Holds an error object if an error occurred 
 *    while performing an operation on this item. At least this object will
 *    contain a "text" property describing the cause.
 */
 
var stampit = require("stampit"),
  _ = require("lodash"),
  createItem = stampit();
  
createItem.state(
  {
    "title" : "",
    "body" : "",
    "managerId" : null, // ID of item in manager service (asana)
    "completed" : false,
    "lastUpdated": Date.now(),
    "tags" : [],
    "fields" : {},
    "error" : null
  }
);

/**
 * Compare two Items and, if different, indicate which one is the most recently
 * updated. Does not compare comments.
 *
 * @param {item:Item} itemA
 * @param {item:Item} itemB
 *
 * @returns 0 if equal, otherwise:
 * 
 *  - -1 if itemA is most recently updated
 *  - 1 if itemB is most recently updated
 *
 * @static
 */
function compare(itemA, itemB) {
  var res = itemA.lastUpdated > itemB.lastUpdated ? -1 : 1, 
    a = itemA,
    b = itemB;
  
  a = _.omit(a, "lastUpdated");
  a = _.omit(a, "managerId");
  a = _.omit(a, "tags");
  
  b = _.omit(b, "lastUpdated");
  b = _.omit(b, "managerId");
  b = _.omit(b, "tags");

  // Ignore white space on body. Note we are updating clones, not the originals
  a.body = a.body.trim();
  b.body = b.body.trim();
  
  return _.isEqual(a, b) ? 0 : res;
}

module.exports = {
  /**
   * Create a new Item
   * @param {item:Item} initialState - Provide an Item or any part of an item to 
   *    set the initial state.
   * @returns {item:Item} a new Item with default state overridden by provided initialState
   * @function
   */
  create : createItem,
  compare : compare
};