'use strict';

/**
 * Module to interact with Asana service.
 * @module asana/task
 */

 
var conf = require("../conf"),
  item = require("../item"),
  parser = require("../parser"),
  _ = require("lodash"),
  request = require("superagent"),
  P = require("bluebird"),
  apiUrl = "https://app.asana.com/api/1.0/",
  user = "ANONYMOUS",
  psw = ""; // always empty

require("superagent-bluebird-promise");
require("string.prototype.endswith");

if (conf.get("asana.apiKey")) {
  user = conf.get("asana.apiKey");
}



/**
 * Create an Item from an Asana task.
 * @param {asana:Task} task - Task as returned by Asana API.
 * @returns {item:Item}
 *
 * @private
 * @static
 */
function toItem (task) {
  var it = item.create({
    "title" : task.name,
    "managerId" : task.id.toString(),
    "completed" : task.completed,
    "lastUpdated" : Date.parse(task["modified_at"])
  });
  
  // TODO check if task is in 2 or more projects with CC prefix --> Warn
  
  it.body = parser.extractFields(task.notes, it.fields);
  it.tags = task.tags.map(function (tag) {
    return tag.name;
  });
  
  return it;
}


/**
 * Create an Asana task from an ITem
 * @param {item:Item} item
 * @returns {asana:Task} task - Task ready to be send to Asana service.
 *
 * @private
 * @static
 */
function fromItem (item) {
  var task = {
      data : {
        name : item.title,
        notes : item.body,
        completed : item.completed
      }
    }, 
    fieldsAsString = parser.serializeFields(item.fields);
  
  // Append fields to notes
  if (fieldsAsString.length > 0) {
    // Insert 2 blank lines if needed
    if (!task.data.notes.endsWith("\n\n")) {
      task.data.notes += task.data.notes.endsWith("\n") ? "\n" : "\n\n";
    }
    task.data.notes += fieldsAsString;
  }
  
  // TODO set tags
  
  return task;
}


/**
 * Get an array of Asana tasks
 * @param {asana:Project} project - A Project as returned by the Asana API.
 * @returns {Array.<asana:Task>} - Array of Task as returned by Asana API.
 *
 * @private
 * @static
 */
function getTasks (project) {
  return request
    .get(apiUrl + "tasks")
    .query({"project": project.id})
    .query({"opt_fields": "id,name,notes,modified_at,completed,assignee.name,assignee.email,tags.name,projects.name"})
    .auth(user, psw)
    .promise()
    .then(function (res) {
      return res.body.data;
    });
}


/**
 * Get an array of Items from Asana.
 * @param {asana:Project} project - A Project as returned by the Asana API.
 * @returns {Array.<item:Item>}
 *
 * @static
 */
function getItems (project) {
  return getTasks(project).map(function (task) {
    var item = toItem(task);
    
    // Include any extracted fields from project
    // If field already exists, it is overwritten.
    // This could avoid some errors when creating new tasks in asana
    // For example if create a task with an #owner field different than the #owner specified in the project
    _.assign(item.fields, project.fields);
    
    return item;
  });
}


/**
 * Update an Item in Asana.
 * @param {item:Item} oldItem - the Item to update in Asana.
 * @param {item:Item} newItem - the Item with updated values.
 * @returns {item:Item} - Item resulting of update.
 *
 * @static
 */
function updateItem (oldItem, newItem) {
  // For now, update all fields, even if only some have changed.
  var task = fromItem(newItem);
  
  return request
    .put(apiUrl + "tasks/" + oldItem.managerId )
    .send(task)
    .auth(user, psw)
    .promise().then(function (res) {
      return toItem(res.body.data);
    });
}


/**
 * Create an Item in Asana.
 * @param {item:Item} item - the new Item to create.
 * @param {asana:Project} project - A Project as returned by the Asana API.
 * @returns {item:Item} - Item resulting of create.
 *
 * @static
 */
function createItem (item, project) {
  
  var task = fromItem(item);
  
  // Workspace and project IDs needed for creation
  task.data.workspace = project.workspace.id;
  task.data.projects = [ project.id ];

  //console.log("$$$$ CREATING TASK \n" + JSON.stringify(task, null, 2));
  
  return request
    .post(apiUrl + "tasks")
    .send(task)
    .auth(user, psw)
    .promise().then(function (res) {
      return toItem(res.body.data);
    });
}



module.exports = {
  getItems : getItems,
  updateItem : updateItem,
  createItem : createItem,
  
  // Private methods exposed for testing
  toItem : toItem,
  fromItem : fromItem,
  getTasks : getTasks
  
};