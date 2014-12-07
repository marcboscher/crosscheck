'use strict';
process.env.SUPPRESS_NO_CONFIG_WARNING = 'y';

/**
 * Module encapsulating application configuration.
 * @module conf
 */

var config = require("config"),
  CONFIG_PREFIX = "crosscheck",
  defaultConfigs = {
    "keyword" : "cc",
    "keywordPrefix" : "#",
    "keywordSeparator" : ".",
    "fieldSeparator" : " ",
    "emptyFieldValue" : "",
    "cacheLocation" : "./cache",
    "lastSyncSafety" : 5000,

    "asana" : {
      "keyword" : "aa", // WARNING: not fully supported. DO NOT CHANGE
      "apiKey" : null
    },
    
    "github" : {
      "keyword" : "gh", // WARNING: not fully supported. DO NOT CHANGE
      "personalAccessToken" : null,
      "userName" : null,
      "password" : null,
      "excludeIssuesWithLabels" : ["invalid"],
      "issueNumberPrefix" : "#",
      "unassignedUser" : ""
    }
  };

config.util.setModuleDefaults(CONFIG_PREFIX, defaultConfigs);  


/**
 * Update the default configurations. Any provided defaults will replace
 * existing defaults, omitted defaults will not be affected. 
 * 
 * **IMPORTANT**: this updates the defaults only, if there exists configuration
 * files, environment variables, or command line overrides, the later always 
 * win (in that order).
 *
 * @param {Oject} newDefaults
 *
 * @static
 */
function overrideDefaults(newDefaults) {
  config.util.extendDeep(defaultConfigs, newDefaults);
  config.util.setModuleDefaults(CONFIG_PREFIX, defaultConfigs);  
}


/**
 * Get a configuration value or Object.
 * @param {string} [property] - The name of the property to get, using dot 
 *    naming. If omitted, the entire configuration Object is returned.
 *
 * @static
 */
function get (property) {
  if (property && property.length > 0) {
    return config.get(CONFIG_PREFIX + "." + property);
  }
  else {
    return config.get(CONFIG_PREFIX);
  }
}


module.exports = {
  get : get,
  overrideDefaults : overrideDefaults
};