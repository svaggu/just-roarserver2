'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      lib: {
        files: '<%= jshint.lib.src %>',
        tasks: ['jshint:lib', 'mochaTest']
      },
      test: {
        files: '<%= jshint.test.src %>',
        tasks: ['jshint:test', 'mochaTest']
      },
    },

    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      lib: {
        src: ['lib/**/*.js']
      },
      test: {
        src: ['test/**/*.js']
      },
    },

    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          captureFile: 'results.txt', // capture reporter output to file
          quiet: false, // test output will be sent to stdout
          clearRequireCache: false, // do not clear the require cache before running tests
          noFail: false // Set to fail on failed tests (will still fail on other errors)
        },
        src: ['test/**/*.js']
      }
    },

    apidoc: {
      myapp: {
        src: "./lib/controllers",
        dest: "./doc/apidoc/",
        options : {
          excludeFilters: [
            "./lib/app/",
            "./lib/models/",
            "./lib/security/",
            "./lib/services/",
            "./lib/views/",
            "node_modules/",
            "temp/",
            "test/",
          ],
          debug: true,
        }
      }
    },

    env: {
      options: {
        // shared options go here
        replace: {
          NODE_ENV: 'test'
        }
      },
      dev: {
        NODE_ENV: 'test'
      },
      build: {
        NODE_ENV: 'production'
      }
    }

  });

  // These plugins provide necessary tasks.
  [
    'grunt-env',
    'grunt-contrib-watch',
    'grunt-contrib-jshint',
    'grunt-mocha-test',
    'grunt-apidoc',
  ].forEach(function(task) { grunt.loadNpmTasks(task); });

  // Default task.
  grunt.registerTask('dev', ['env:dev', 'watch', 'jshint', 'mochaTest', 'apidoc']);
  grunt.registerTask('build', ['env:build', 'watch', 'jshint', 'mochaTest', 'apidoc']);
  grunt.registerTask('default', ['watch', 'jshint', 'mochaTest', 'apidoc']);
};
