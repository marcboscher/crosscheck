'use strict';

module.exports = function (grunt) {
  // Show elapsed time at the end
  require('time-grunt')(grunt);
  // Load all grunt tasks
  require('load-grunt-tasks')(grunt);

  // Project configuration.
  grunt.initConfig({
    nodeunit: {
      files: ['test/**/*_test.js']
    },

    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      cli: {
        src: 'cli.js'
      },
      lib: {
        src: ['lib/**/*.js']
      },
      test: {
        src: ['test/**/*.js']
      }
    },

    mochacli: {
      options: {
        //reporter: 'nyan',
        timeout: 10000,
        bail: true
      },
      //manual: ['test/github/issue_test.js'],
      all: ['test/**/*.js']
    },

    jsdoc : {
      dist : {
          src: ['lib/**/*.js', "README.md"], 
          options: {
              destination: 'doc',
              template: "node_modules/ink-docstrap/template",
              configure: "jsdoc.conf.json"
          }
      }
    },

    browserify: {
      utilLib : {
        src: 'lib/util-lib.js',
        dest: 'dist/crosscheck-util-lib.js',
        // For dev
        // dest: '../crosscheck-chrome/app/bower_components/crosscheck/util-lib.js',
        options: {
          // If change this list, also exclude the same in browerify:dist
          alias : [
            'lodash',
            'bluebird'
            ],
          browserifyOptions: {}  
        }
      },

      dist : {
        src: 'lib/crosscheck.js',
        dest: 'dist/crosscheck.js',
        // For dev
        // dest: '../crosscheck-chrome/app/bower_components/crosscheck/index.js',
        options: {
          // Expose our main browser API and underlying utility libs
          alias: ["./lib/browser.js:crosscheck"],
          // Exclude optional config file dependencies of node-config (browser won't use config files...)
          exclude: ['js-yaml', 'yaml', 'json5', 'cson', 'properties', 'coffee-script', 'iced-coffee-script'],
          // Exclude libs exposed in browserify:utilLib above
          external: ['lodash', 'bluebird'],
          browserifyOptions: {}  
        }
      }
    },

    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      cli: {
        files: '<%= jshint.cli.src %>',
        tasks: ['jshint:cli']
      },
      lib: {
        files: '<%= jshint.lib.src %>',
        //tasks: ['jshint:lib', 'mochacli']
        tasks: ['jshint:lib', 'mochacli', 'browserify']
      },
      test: {
        files: '<%= jshint.test.src %>',
        tasks: ['jshint:test', 'mochacli']
      }
    }
  });

  // Default task.
  grunt.registerTask('default', ['jshint', 'mochacli', 'browserify' ,'jsdoc']);
};
