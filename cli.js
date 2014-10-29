#! /usr/bin/env node

'use strict';

var crosscheck = require('./lib/crosscheck.js');

var userArgs = process.argv;

if (userArgs.indexOf('-h') !== -1 || userArgs.indexOf('--help') !== -1) {
    return console.log('Refer to https://github.com/marcboscher/crosscheck for help');
}

if (userArgs.indexOf('-v') !== -1 || userArgs.indexOf('--version') !== -1) {
    return console.log(require('./package').version);
}

crosscheck.sync();
