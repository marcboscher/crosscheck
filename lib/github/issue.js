'use strict';

/**
 * Module to interact with GitHub issues.
 * @module github/issue
 */

 
var conf = require("../conf"),
  helper = require("./helper"),
  item = require("../item"),
  parser = require("../parser"),
  _ = require("lodash"),
  P = require("bluebird");


/**
 * Create an Item from a GitHub issue.
 * @param {github:Issue} issue - Issue as returned by GitHub API
 * @param {github:RepoId} repoId - the github repository to get issues from
 * @returns {item:Item}
 *
 * @private
 * @static
 */
function toItem (issue, repoId) {
  var it = item.create({
    "title" : conf.get("github.issueNumberPrefix") + issue.number + " " + issue.title.trim(),
    "lastUpdated" : Date.parse(issue["updated_at"])
  });
  
  it.body = parser.extractFields(issue.body, it.fields);
  it.completed = (issue.state === "closed");
  
  // Map fields
  it.fields["gh.url"] = issue["html_url"]; // not using . notation to pass jshint with underscore naming
  it.fields["gh.assignee"] = issue.assignee ? issue.assignee.login : conf.get("github.unassignedUser");
  it.fields["gh.number"] = issue.number.toString();
  it.fields["gh.repo"] = repoId["gh.repo"];
  it.fields["gh.owner"] = repoId["gh.owner"];
  
  // Map labels to tags (not supported yet)
  // Use fields for labels for now
  if (issue.milestone) {
    // it.tags.push("#gh.milestone " + issue.milestone.title);
    it.fields["gh.milestone"] = issue.milestone.title;
  }
  // issue.labels.forEach(function (label) {
    // it.tags.push("#gh.label " + label.name);
  //});
  it.fields["gh.labels"] = _.map(issue.labels, "name").join(", ");
  
  return it;
}


/**
 * Create a GitHub issue from an Item
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
      assignee : item.fields["gh.assignee"]
    };

    // Milestone edit not supported yet
    //milestone = item.fields["gh.milestone"];
    
    // Handle state
    issue.state = item.completed ? "closed" : "open";
    
    // Add labels
    if (item.fields["gh.labels"]) {
      issue.labels = item.fields["gh.labels"].split(",").map(function (label) {
        return label.trim();
      });
    }
  
    // Strip issue number from title if it's there
    if (item.fields["gh.number"] && issue.title.indexOf(conf.get("github.issueNumberPrefix") + item.fields["gh.number"] + " ") === 0) {
      issue.title = issue.title.substring(item.fields["gh.number"].length + 2); 
    }
  
  return issue;
}


/**
 * Get an array of GitHub issues
 * @param {github:RepoId} repoId - the github repository to get issues from
 * @param {string[]} [excludeWithLabels] - any issue with at least 
 *    one of these labels will be excluded from the returned array. Optional.
 *
 * @returns {Array.<github:Issue>} - Array of Issue as returned by GitHub API
 *
 * @private
 * @static
 */
function getIssues (repoId, excludeWithLabels) {
  var urlPath = "repos/" + repoId["gh.owner"] + "/" + repoId["gh.repo"] + "/issues";
  var buildRequestFn = function (pageIndex) {
    return helper.buildGet(urlPath)
    .query(
      {
        "state" : "all",
        "page" : pageIndex,
        "per_page" : 100
      });
  };

  return helper.requestAllPages(buildRequestFn, "number")
    .then(function (issues) {
      if (!excludeWithLabels) {
        return issues;
      }
      else {
        return issues.filter(function (issue) {
          return !_.some(issue.labels, function (label) {
            return excludeWithLabels.includes(label.name);
          });
        });
      }
    });
}


/**
 * Get an array of Items from GitHub. Items with labels listed in config
 * "github.excludeIssuesWithLabels" are automatically excluded.
 * @param {github:RepoId} repoId - the github repository to get issues from
 *
 * @returns {Array.<item:Item>}
 *
 * @static
 */
function getItems (repoId) {

  if (!repoId["gh.owner"]) {
    throw new Error("options[\"gh.owner\"] is required");
  }
  if (!repoId["gh.repo"]) {
    throw new Error("options[\"gh.repo\"] is required");
  }

  return getIssues(repoId, conf.get("github.excludeIssuesWithLabels")).map(function (issue) {
    return toItem(issue, repoId);
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
    urlPath;

  if (!oldItem.fields["gh.number"]) {
    throw new Error("oldItem.fields['gh.number'] is required");
  }
  if (!oldItem.fields["gh.owner"]) {
    throw new Error("oldItem.fields['gh.owner'] is required");
  }
  if (!oldItem.fields["gh.repo"]) {
    throw new Error("oldItem.fields['gh.repo'] is required");
  }

  urlPath = "repos/" + oldItem.fields["gh.owner"] + "/" + oldItem.fields["gh.repo"] + "/issues/" + oldItem.fields["gh.number"];
  
  //console.log("$$$$ UPDATING ISSUE \n" + JSON.stringify(issue, null, 2));
  
  return helper.buildPatch(urlPath)
    .send(issue)
    .promiseEnd()
    .then(function (res) {
      return toItem(res.body, { "gh.owner" : newItem.fields["gh.owner"], "gh.repo" : newItem.fields["gh.repo"] });
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
    urlPath;

  if (!item.fields["gh.owner"]) {
    throw new Error("item.fields['gh.owner'] is required");
  }
  if (!item.fields["gh.repo"]) {
    throw new Error("item.fields['gh.repo'] is required");
  }

  urlPath = "repos/" + item.fields["gh.owner"] + "/" + item.fields["gh.repo"] + "/issues";

  // console.log("$$$$ CREATING ISSUE at url %s\n%s", urlPath, JSON.stringify(issue, null, 2));
  
  return helper.buildPost(urlPath)
    .send(issue)
    .promiseEnd()
    .then(function (res) {
      var newItem = toItem(res.body, { "gh.owner" : item.fields["gh.owner"], "gh.repo" : item.fields["gh.repo"] });
      
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
