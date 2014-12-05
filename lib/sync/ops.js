'use strict';

/**
 * Defines the Ops type used throughout the sync module
 * @module sync/ops
 */


/**
 * A set of create and update operations for items or comments in different 
 * services.
 * @typedef {Object} sync:Ops
 *
 * @property {Object} asana - Operations for Asana service
 * @property {Object} asana.parent - A parent for the operations. 
 *    Typically a project for item:Item ops, or an item:Item for 
 *    comment:Comment ops. Can be null.
 * @property {Array.<Object>} asana.create - Set of item:Item or comment:Comment 
 *    to create, which can be empty.
 * @property {Object[]} asana.update - Set of update operations, which can be 
 *    empty.
 * @property {Object} asana.update.old - Asana item:Item or comment:Comment 
 *    to update.
 * @property {Object} asana.update.nue - item:Item or comment:Comment with 
 *    new values for update.
 * @property {Object} asana.del - Set of item:Item or comment:Comment 
 *    to delete, which can be empty.
 *
 * @property {Object} github - Operations for GitHub service
 * @property {Object} github.parent - A parent for the operations. 
 *    Typically null for item:Item ops, or an item:Item for comment:Comment ops.
 *    Can be null.
 * @property {Array.<Object>} github.create - Set of item:Item or 
 *    comment:Comment to create, which can be empty.
 * @property {Object[]} github.update - Set of update operations, which can be 
 *    empty.
 * @property {Object} github.update.old - GitHub item:Item or comment:Comment 
 *    to update.
 * @property {Object} github.update.nue - item:Item or comment:Comment with 
 *    new values for update.
 * @property {Object} github.del - Set of item:Item or comment:Comment 
 *    to delete, which can be empty.
 *
 * @property {Object[]} toDiffChildren - Set of objects whose children we should
 *    also check for differences, typically because they were modified
 *    since we checked them.
 * @property {Object} toDiffChildren.asana - typically an asana item:Item 
 *    indicating its child comments should be checked
 * @property {Object} toDiffChildren.github - typically a github item:Item 
 *    indicating its child comments should be checked
 */

var stampit = require("stampit"),
  _ = require("lodash"),
  createOps = stampit();

createOps.state(
  {
    asana : {
      parent : null,
      create : [],
      update : [],
      del : []
    },
    github : {
      parent : null,
      create : [],
      update : [],
      del : []
    },
    toDiffChildren : []
  }
);

module.exports = {
  /**
   * Create a new Ops.
   * @param {sync/ops:Ops} initialState - Provide an Ops or any part of an Ops 
   *    to set the initial state.
   * @returns {sync/ops:Ops} a new Ops with default state overridden by provided 
   *    initialState.
   * @function
   */
  create : createOps
};