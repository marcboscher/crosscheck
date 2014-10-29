'use strict';

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
 * returns 0 if equal, otherwise:
 *  -1 if itemA is most recently updated
 *  1 if itemB is most recently updated
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
  create : createItem,
  compare : compare
};