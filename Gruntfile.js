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
      all: ['test/**/*.js'],
      //conf: ['test/conf_test.js']
      //all: ['test/github_test.js']
      //all: ['test/asana/project_test.js']
      //all: ['test/asana/*_test.js']
      // all: ['test/asana/story_test.js']
      //all: ['test/parser_test.js']
      //all: ['test/crosscheck_test.js']
      //all: ['test/conf_test.js']
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
      dist : {
        src: 'lib/crosscheck.js',
        dest: 'dist/crosscheck.js',
        // For dev
        // dest: '../crosscheck-chrome/app/bower_components/crosscheck/index.js',
        options: {
          // Expose our main browser API and underlying utility libs
          alias : ["./lib/browser.js:crosscheck", 'asana', 'lodash', 'bluebird', 'superagent'],
          // Exclude optional config file dependencies of node-config.
          // Browser won't use config files...
          exclude: ['js-yaml', 'yaml', 'json5', 'cson', 'properties', 'coffee-script', 'iced-coffee-script'],
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
