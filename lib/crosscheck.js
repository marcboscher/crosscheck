'use strict';

/**
 * Main module of the crosscheck app providing 
 * high level sync functionality.
 * @module crosscheck 
 */

/**
 * A set of create and update item operations for different services.
 * @typedef {Object} crosscheck:Operations
 *
 * @property {Object} asana - Operations for Asana service
 * @property {Array.<item:Item>} asana.create - Set of Items to create, which can be empty.
 * @property {Object[]} asana.update - Set of update operations, which can be empty.
 * @property {item:Item} asana.update.oldItem - Asana Item to update.
 * @property {item:Item} asana.update.newItem - Item with new values for update.
 *
 * @property {Object} github - Operations for GitHub service
 * @property {Array.<item:Item>} github.create - Set of Items to create, which can be empty.
 * @property {Object[]} github.update - Set of update operations, which can be empty.
 * @property {item:Item} github.update.oldItem - GitHub Item to update.
 * @property {item:Item} github.update.newItem - Item with new values for update.
 */
 
 
var item = require("./item"),
  parser = require("./parser"),
  asana = require("./asana"),
  github = require("./github"),
  _ = require("lodash"),
  should = require("should"),
  P = require("bluebird"),
  KEYWORD_PREFIX = "#",
  PROJECT_PREFIX = KEYWORD_PREFIX + "cc",
  SOURCES = {
    "gh" : {
      "name": "GitHub"
    }
  };

 
/**
 * Compare items from Asana and Github, and generate the set of operations in 
 * both systems needed to synchronize them.
 * @param {item:Item[]} asanaItems - Can be empty.
 * @param {item:Item[]} githubItems - Can be empty.
 * @returns {crosscheck:Operations}
 *
 * @static
 * @private
 */
function diff(asanaItems, githubItems) {
  var operations = {
    asana : {
      create : [], // will contain github item to create in asana
      update : []  // will contain {oldItem, newItem}, 
                   // oldItem = asana item to update
                   // newItem = github item whose values to use
    },
    github : {
      create : [], // will contain asana item to create in github
      update : []  // will contain {oldItem, newItem}, 
                   // oldItem = github item to update
                   // newItem = asana item whose values to use
    }
  }, 
  githubItemsByNumber = {};
  
  //console.log("@@@@@@@@ ASANA ITEMS\n" + JSON.stringify(asanaItems, null, 2));
  //console.log("@@@@@@@@ GITHUB ITEMS\n" + JSON.stringify(githubItems, null, 2));

  // Index github items by github number, for quick lookup
  githubItems.forEach(function (githubItem) {
    githubItemsByNumber[githubItem.fields.number] = githubItem;
  });
  
  // Process asana items, looking up matching github items
  // Update those found, add those not found.
  asanaItems.forEach(function (asanaItem) {
    var githubItem;
    
    // Assume that if we don't have a number field in asana item, then it is a new item
    if (!asanaItem.fields.number) {
      operations.github.create.push(asanaItem);
      return;
    }
    
    // Lookup github item by its number
    githubItem = githubItemsByNumber[asanaItem.fields.number];
    // We then remove it so we can later detect which github items are no in asana
    delete githubItemsByNumber[asanaItem.fields.number];
    
    // If we have a number field in asana item, but no matching number in github, something went wrong
    if (!githubItem) {
      console.warn("Ignoring an Asana task with a #number, but could not find corresponding GitHub issue %s", JSON.stringify(asanaItem));
      // TODO handle this in a better way: close asana item, or add error + comment. see https://app.asana.com/0/17620819608782/17983593201516
      return;
    }
    
    // Compare the two items
    switch (item.compare(asanaItem, githubItem)) {
      case -1: 
        // Asana most recent, update github
        operations.github.update.push({oldItem : githubItem, newItem : asanaItem});
        // console.log("%%%% UPDATE GITHUB with ASANA\nAsana:" + 
          // JSON.stringify(asanaItem, null, 2) + 
          // "\n" + 
          // JSON.stringify(githubItem, null, 2));
        break;
      case 1: 
        // Github most recent, update asana
        operations.asana.update.push({oldItem : asanaItem, newItem : githubItem});
        break;
      case 0:
        // No difference, nothing to sync
        break;
      default:
        console.error("Unexpected switch case");
    }
  });
  
  // Process remaining github items that did not have a matching asana item.
  // Add them to asana.
  Object.keys(githubItemsByNumber).forEach(function (key) {
    operations.asana.create.push(githubItemsByNumber[key]);
  });
        
  return operations;
}


/**
 * Execute operations accross services.
 * @param {crosscheck:Operations} operations
 * @param {asana:Project} asanaProject
 *
 * @static
 * @private
 */
function exec (operations, asanaProject) {
  //console.log("####OPS#####\n%s", JSON.stringify(operations, null, 2));
  
  // Asana create
  return P.map(operations.asana.create, function (item) {
    return asana.createItem(item, asanaProject).then(function (res) {
      //console.log("CREATE RESULTS:\n " + JSON.stringify(res, null, 2));
      return res;
    });
  })
  
  // Asana update
  .then(function (asanaCreateResults) {
    return P.map(operations.asana.update, function (updateOp) {
      return asana.updateItem(updateOp.oldItem, updateOp.newItem);
    });
  })

  // Github create
  .then(function (asanaUpdateResults) {
    return P.map(operations.github.create, function (item) {
      return github.createItem(item).then(function (newGithubItem) {
        //console.log("CREATE RESULTS:\n " + JSON.stringify(res, null, 2));
        // After a create in github, need to update asana to give it the github issue number
        return asana.updateItem(item, newGithubItem);
      });
    });
  })

  // Github update
  .then(function (githubCreateResults) {
    return P.map(operations.github.update, function (updateOp) {
      return github.updateItem(updateOp.oldItem, updateOp.newItem);
    });
  });
}

/**
 * Output operations to console.
 *
 * @static
 * @private
 */
function printOperations(operations, asanaProject) {
  console.log("\nProject: %s", asanaProject.name);
  
  console.log("  Asana:");
  console.log("    Create:");
  operations.asana.create.forEach(function (op) {
    console.log("      " + op.title);
  });
  console.log("    Update:");
  operations.asana.update.forEach(function (op) {
    console.log("      " + op.newItem.title);
  });
  
  console.log("  GitHub:");
  console.log("    Create:");
  operations.github.create.forEach(function (op) {
    console.log("      " + op.title);
  });
  console.log("    Update:");
  operations.github.update.forEach(function (op) {
    console.log("      " + op.newItem.title);
  });
}

/**
 * Synchronize work between services. The main application entry point.
 * @static
 */ 
function sync () {
  console.log("------------------------------------------------------");
  console.log("Sync - " + new Date());

  return asana.getProjects(PROJECT_PREFIX).map(function (asanaProject) {
    var fields = {},
      join = P.join;

    parser.extractFields(asanaProject.notes, fields);
    
    // Check source
    if (!fields.source || !SOURCES[fields.source]) {
      console.warn("Skipping project with missing or unrecognized source field. " + asanaProject);
      return;
    }
    // Check Github fields
    if (!fields.owner || !fields.repo) {
      console.warn("Skipping project with missing owner or repo fields. " + asanaProject);
      return;
    }
    
    // Decorate asana project with extracted fields
    asanaProject.fields = fields;
    
    // Get item lists from both asana and github in parallel
    // Call diff on the resulting lists, which returns operations to perform
    // Execute the operations
    return join(asana.getItems(asanaProject), github.getItems(_.cloneDeep(fields)), diff)
      .then(function (operations) {
        printOperations(operations, asanaProject);
        return exec(operations, asanaProject);
      });
  });
}



module.exports = {
  sync : sync,
  
  // Private methods exposed for testing
  diff : diff
};