'use strict';
process.env.SUPPRESS_NO_CONFIG_WARNING = 'y';

var config = require("config"),
  CONFIG_PREFIX = "crosscheck",
  defaultConfigs = {
    asana : {
      apiKey : null
    },
    github : {
      personalAccessToken : null,
      userName : null,
      password : null
    }
  };

config.util.setModuleDefaults(CONFIG_PREFIX, defaultConfigs);  


function overrideDefaults(newDefaults) {
  config.util.extendDeep(defaultConfigs, newDefaults);
  config.util.setModuleDefaults(CONFIG_PREFIX, defaultConfigs);  
}


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