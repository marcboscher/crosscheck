'use strict';

/**
 * Module to interact with GitHub service.
 * @module github
 */

 
var conf = require("./conf"),
  item = require("./item"),
  parser = require("./parser"),
  _ = require("lodash"),
  request = require("superagent"),
  P = require("bluebird"),
  apiUrl = "https://api.github.com/",
  user = "ANONYMOUS",
  psw = "";

require("superagent-bluebird-promise");

if (conf.get("github.personalAccessToken")) {
  user = conf.get("github.personalAccessToken");
  psw = "x-oauth-basic";
}
else if (conf.get("github.userName") && conf.get("github.password")) {
  user = conf.get("github.userName");
  psw = conf.get("github.password");
}


/**
 * Create an Item from a GitHub issue.
 * @param {github:Issue} issue - Issue as returned by GitHub API
 * @param {Object} [options] - Should contain a "repo" and "onwer" property.
 * @returns {item:Item}
 *
 * @private
 * @static
 */
function toItem (issue, options) {
  var it = item.create({
    "title" : conf.get("github.issueNumberPrefix") + issue.number + " " + issue.title,
    "body" : parser.normalizeLineEndings(issue.body),
    "lastUpdated" : Date.parse(issue["updated_at"])
  });
  
  options = options || {};
  
  it.completed = (issue.state === "closed");
  
  // Map fields
  it.fields.url = issue["html_url"]; // not using . notation to pass jshint with underscore naming
  it.fields.assignee = issue.assignee ? issue.assignee.login : conf.get("github.unassignedUser");
  it.fields.source = conf.get("github.serviceAbbr");
  it.fields.number = issue.number.toString();
  if (options.repo) {
    it.fields.repo = options.repo;
  }
  if (options.owner) {
    it.fields.owner = options.owner;
  }
  
  // Map tags
  // TODO use conf for tag prefixes
  // TODO support tags. Use fields for tags for now
  if (issue.milestone) {
    // it.tags.push("#gh.milestone " + issue.milestone.title);
    it.fields.milestone = issue.milestone.title;
  }
  // issue.labels.forEach(function (label) {
    // it.tags.push("#gh.label " + label.name);
  //});
  it.fields.labels = _.pluck(issue.labels, "name").join(", ");
  
  return it;
}


/**
 * Create a GitHub issue from an ITem
 * @param {item:Item} item
 * @returns {github:Issue} issue - Issue ready to be send to GitHub service
 *
 * @private
 * @static
 */
function fromItem (item) {
  var issue = {
      title : item.title,
      body : item.body,
      assignee : item.fields.assignee
    };

    // TODO support milestones
    //milestone = item.fields.milestone;
    
    // Handle state
    issue.state = item.completed ? "closed" : "open";
    
    // Add labels
    if (item.fields.labels) {
      issue.labels = item.fields.labels.split(",").map(function (label) {
        return label.trim();
      });
    }
  
    // Strip issue number from title if it's there
    if (item.fields.number && issue.title.indexOf(conf.get("github.issueNumberPrefix") + item.fields.number + " ") === 0) {
      issue.title = issue.title.substring(item.fields.number.length + 2); 
    }
  
  return issue;
}


/**
 * Get an array of GitHub issues
 * @param {Object} [options] - Can contain:
 *
 *   - owner : "owner name" - required
 *   - repo : "repo name" - required
 *   - excludeWithLabels : ["label1", "label2"] - any issue with at least one of 
 *      these labels will be excluded from the returned array.
 *
 * @returns {Array.<github:Issue>} - Array of Issue as returned by GitHub API
 *
 * @private
 * @static
 */
function getIssues (options) {
  var urlPath = "issues";
  
  // We use an options object even though owner and repo is required.
  // In the future, there may be more/different query parameters. 
  if (!options) {
    options = {};
  }
  
  if (options.owner && options.repo) {
    urlPath = "repos/" + options.owner + "/" + options.repo + "/issues";
  }

  return request
    .get(apiUrl + urlPath)
    .query({"state": "all"})
    .auth(user, psw)
    .promise()
    .then(function (res) {
      if (!options.excludeWithLabels) {
        return res.body;
      }
      else {
        return res.body.filter(function (issue) {
          return !_.some(issue.labels, function (label) {
            return _.contains(options.excludeWithLabels, label.name);
          });
        });
      }
    });
}


/**
 * Get an array of Items from GitHub. Items with the label "invalid" in GitHub
 * are automatically excluded.
 * @param {Object} [options] - Can contain:
 *
 *   - owner : "owner name" - required
 *   - repo : "repo name" - required
 *
 * @returns {Array.<item:Item>}
 *
 * @static
 */
function getItems (options) {
  options.excludeWithLabels = conf.get("github.excludeIssuesWithLabels");
  return getIssues(options).map(function (issue) {
    return toItem(issue, options);
  });
}


/**
 * Update an Item in GitHub.
 * @param {item:Item} oldItem - the Item to update in GitHub.
 * @param {item:Item} newItem - the Item with updated values.
 * @returns {item:Item} - Item resulting of update.
 *
 * @static
 */
function updateItem (oldItem, newItem) {
  // For now, update all fields, even if only some have changed.
  var issue = fromItem(newItem),
    urlPath = "repos/" + oldItem.fields.owner + "/" + oldItem.fields.repo + "/issues/" + oldItem.fields.number;
  
  //console.log("$$$$ UPDATING ISSUE \n" + JSON.stringify(issue, null, 2));
  
  return request
    .patch(apiUrl + urlPath)
    .send(issue)
    .auth(user, psw)
    .promise()
    .then(function (res) {
      return toItem(res.body, { owner : newItem.fields.owner, repo : newItem.fields.repo });
    });
}


/**
 * Create an Item in GitHub.
 * @param {item:Item} item - the new Item to create.
 * @returns {item:Item} - Item resulting of create.
 *
 * @static
 */
function createItem (item) {
   
  var issue = fromItem(item),
    urlPath = "repos/" + item.fields.owner + "/" + item.fields.repo + "/issues";

  // console.log("$$$$ CREATING ISSUE at url %s\n%s", urlPath, JSON.stringify(issue, null, 2));
  
  return request
    .post(apiUrl + urlPath)
    .send(issue)
    .auth(user, psw)
    .promise()
    .then(function (res) {
      var newItem = toItem(res.body, { owner : item.fields.owner, repo : item.fields.repo });
      
      // Github cannot create issues in the closed state. 
      // So if our item is completed, we need to follow the create with an update
      if (!item.completed) {
        return newItem;
      }
      else {
        newItem.completed = true;
        return updateItem(newItem, newItem);
      }
    });
}



module.exports = {
  getItems : getItems,
  updateItem : updateItem,
  createItem : createItem,
  
  // Private methods exposed for testing
  getIssues : getIssues,
  toItem : toItem,
  fromItem : fromItem
};
