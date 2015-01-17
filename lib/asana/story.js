'use strict';

/**
 * Module to interact with Asana task stories.
 * @module asana/story
 */

 
var conf = require("../conf"),
  helper = require("./helper"),
  item = require("../item"),
  comment = require("../comment"),
  parser = require("../parser"),
  _ = require("lodash"),
  P = require("bluebird");


/**
 * Create a Comment from an Asana task story.
 * @param {asana:Story} story - Story as returned by Asana API.
 * @returns {comment:Comment}
 *
 * @private
 * @static
 */
function toComment (story) {
  var com = comment.create({
    "lastUpdated" : Date.parse(story["created_at"])
  });
  
  com.body = parser.extractFields(story.text, com.fields);
  // Keep original Asana fields if available
  // This may mean that our aa.id will not match story.id, but that's ok
  // See #31 Replace github comment delete by asana create
  if (!com.fields["aa.id"]) {
    com.fields["aa.id"] = story.id.toString();
  }
  if (!com.fields["aa.commenter"]) {
    com.fields["aa.commenter"] = story.created_by.name;
  }
  
  return com;
}


/**
 * Create an Asana task story from a Comment
 * @param {comment:Comment} comment
 * @returns {asana:Comment} Story ready to be sent to Asana service.
 *
 * @private
 * @static
 */
function fromComment (comment) {
  var story = {
      data : {
        text : comment.body
      }
    }, 
    fields;

  // Use Asana identification if available, otherwise use GitHub's.
  // This will maintain the correct Asana ID if a comment is created in Asana 
  // project A, then synced with GitHub repo B, and then synced again with 
  // another Asana project C. 
  // See #31 Replace github comment delete by asana create
  if (comment.fields["aa.id"]) {
    fields = {
      "aa.commenter" : comment.fields["aa.commenter"],
      "aa.id" : comment.fields["aa.id"]
    };
  }
  else if (comment.fields["gh.id"]) {
    fields = {
      "gh.commenter" : comment.fields["gh.commenter"],
      "gh.id" : comment.fields["gh.id"]
    };
  }
  else {
    fields = {};
  }
  
  story.data.text = parser.append(story.data.text, parser.serializeFields(fields));
  return story;
}

/**
 * Get the array of asana Stories of a specific task.
 * @param  {number} taskId - Unique ID of task in Asana.
 * @return {Array.<asana:Story>} - Array of Story as returned by Asana API.
 */
function getStories (taskId) {
  return helper.buildGet("tasks/" + taskId + "/stories")
    .promiseEnd()
    .then(function (res) {
      return res.body.data;
    });
}


function getComments (item) {
  if (!item.managerId) {
    throw new Error("item.managerId is required");
  }

  return getStories(item.managerId)
    .filter(function (story) {
      return story["type"] === "comment";
    })
    .map(function (story) {
      return toComment(story);
  });

}


/**
 * Create a Comment associated to an Item in Asana.
 * @param {comment:Comment} comment - the Comment to create.
 * @param {item:Item} item - the Item to comment on.
 * @returns {comment:Comment} - Comment resulting of create.
 *
 * @static
 */
function createComment (comment, item) {
  
  var story = fromComment(comment);
  
  //console.log("$$$$ CREATING STORY \n" + JSON.stringify(story, null, 2));
  
  return helper.buildPost("tasks/" + item.managerId + "/stories")
    .send(story)
    .promiseEnd()
    .then(function (res) {
      return toComment(res.body.data);
    });
}



module.exports = {
  getComments : getComments,
  createComment : createComment,
  
  // Private methods exposed for testing
  toComment: toComment,
  fromComment : fromComment,
  getStories : getStories
  
};