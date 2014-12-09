'use strict';

/**
 * GitHub helper module.
 * @module asana/helper
 */


var conf = require("../conf");

/**
 * Helper to get correct user name based on config
 * @return {string} 
 */
function getUser () {
  if (conf.get("asana.apiKey")) {
    return conf.get("asana.apiKey");
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
  return "";
}



module.exports = {
  getUser : getUser,
  getPsw : getPsw
};