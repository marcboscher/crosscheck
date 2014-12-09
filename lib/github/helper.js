'use strict';

/**
 * GitHub helper module.
 * @module github/helper
 */


var conf = require("../conf");

/**
 * Helper to get correct user name based on config
 * @return {string} 
 */
function getUser () {
  if (conf.get("github.personalAccessToken")) {
    return conf.get("github.personalAccessToken");
  }
  else if (conf.get("github.userName") && conf.get("github.password")) {
    return conf.get("github.userName");
  }
  else {
    return "ANONYMOUS";
  }

}


/**
 * Helper to get correct password based on config
 * @return {string}
 */
function getPsw () {
  if (conf.get("github.personalAccessToken")) {
    return "x-oauth-basic";
  }
  else if (conf.get("github.userName") && conf.get("github.password")) {
    return conf.get("github.password");
  }
  else {
    return "";
  }
}



module.exports = {
  getUser : getUser,
  getPsw : getPsw
};