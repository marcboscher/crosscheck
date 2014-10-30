'use strict';

/**
 * Module to work with Items.
 * @module items
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
 */
 
var stampit = require("stampit"),
  _ = require("lodash"),
  createItem = stampit();
  
createItem.state(
  {
    "title" : "",
    "body" : "",
    "managerId" : undefined, // ID of item in manager service (asana)
    "completed" : false,
    "lastUpdated": Date.now(),
    "tags" : [],
    "fields" : {}
  }
);

/**
 * Compare two Items and, if different, indicate which one is the most recently
 * updated.
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
  
  b = _.omit(b, "lastUpdated");
  b = _.omit(b, "managerId");
  
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