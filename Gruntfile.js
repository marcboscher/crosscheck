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
      all: ['test/**/*.js']
      //all: ['test/sync_test.js']
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
        tasks: ['jshint:lib', 'mochacli']
      },
      test: {
        files: '<%= jshint.test.src %>',
        tasks: ['jshint:test', 'mochacli']
      }
    }
  });

  // Default task.
  grunt.registerTask('default', ['jshint', 'mochacli', 'jsdoc']);
};
