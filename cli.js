#! /usr/bin/env node

'use strict';

var crosscheck = require('./lib/crosscheck.js'),
  argv = require('minimist')(process.argv.slice(2)),
  _ = require("lodash"),
  interval;

function runSync ()  {
  console.log("------------------------------------------------------");
  console.log("Sync - " + new Date());

  crosscheck.sync()
  .then(function (res) {
    
    if (res.syncLog.length === 0) {
      console.log("Nothing to sync!");
    }
    else {
      _.forEach(res.syncLog, function (log) {
        _.forEach(log.opsLog, function (opsLog) {
          console.log(opsLog);
        });
      });
    }

    _.forEach(res.errors, function (error) {
      if (error.error && error.error.text) {
        console.log("ERROR - " + error.error + ". CAUSE: " + error.error.text);
      }
      else {
        console.log("ERROR - " + error.toString());
      }
      
    });

    if (res.rateLimitReachedUntil) {
      console.log("API rate limit was reached. Try again after " + 
        (new Date(res.rateLimitReachedUntil)).toLocaleTimeString());
    }

  })
  .catch(function (e) {
    console.log("Unexpected error - " + JSON.stringify(e, null, e));
  });  
}

if (argv.h || argv.help) {
    return console.log('Refer to https://github.com/marcboscher/crosscheck for help');
}

if (argv.v || argv.version) {
    return console.log(require('./package').version);
}

// Run once/a first time
runSync();

// If requested, also run on interval
if (argv.t || argv.timer) {
  interval = argv.t ? argv.t : argv.timer;
  if (!_.isNumber(interval)) {
    return console.log("Time interval '%s' is not a number", interval);
  }
  interval *= 1000; // convert to ms
  setInterval(runSync, interval);
}
