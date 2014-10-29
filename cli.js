#! /usr/bin/env node

'use strict';

var crosscheck = require('./lib/crosscheck.js'),
  argv = require('minimist')(process.argv.slice(2)),
  _ = require("lodash"),
  interval;

if (argv.h || argv.help) {
    return console.log('Refer to https://github.com/marcboscher/crosscheck for help');
}

if (argv.v || argv.version) {
    return console.log(require('./package').version);
}

// Run once/a first time
crosscheck.sync();

// If requested, also run on interval
if (argv.t || argv.timer) {
  interval = argv.t ? argv.t : argv.timer;
  if (!_.isNumber(interval)) {
    return console.log("Time interval '%s' is not a number", interval);
  }
  interval *= 1000; // convert to ms
  setInterval(crosscheck.sync, interval);
}
