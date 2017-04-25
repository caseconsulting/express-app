'use strict';

module.exports = function(grunt) {

  require('jit-grunt')(grunt);

  // Unified Watch Object
	var watchFiles = {
		serverViews: ['app/views/**/*.*'],
		serverJS: ['gruntfile.js', 'app.js', 'config/**/*.js', 'app/**/*.js', '!app/tests/'],

		clientViews: ['public/modules/**/views/**.html'],
		clientJS: ['public/js/*.js', 'public/form_modules/**/*.js', 'public/modules/**/*.js'],
		clientCSS: ['public/modules/**/*.css', 'public/form_modules/**/*.css', '!public/modules/**/demo/**/*.css', '!public/modules/**/dist/**/*.css'],

		serverTests: ['app/tests/**/*.js'],
		clientTests: ['public/modules/**/tests/*.js', '!public/modules/**/dist/**/*.js', '!public/modules/**/node_modules/**/*.js']
	};

	watchFiles.allTests = watchFiles.serverTests.concat(watchFiles.clientTests);
  // Project configuration.
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),
    watch: {},
    env: {
      test: {
        NODE_ENV: 'test',
        src: '.env'
      },
      production: {
        NODE_ENV: 'production',
        src: '.env'
      },
      dev: {
        NODE_ENV: 'development',
        src: '.env'
      }
    },
    execute: {
      target: {
        src: ['./bin/setup.js']
      }
    },
    run: {
      server: {
        cmd: 'yarn',
        args: ['start']
      }
    }

  });

  grunt.event.on('watch', function(action, filepath, target) {
    grunt.log.writeln(target + ': ' + filepath + ' has ' + action);
  });

  grunt.loadNpmTasks('grunt-contrib-watch');

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // load env
  grunt.loadNpmTasks('grunt-env');

  grunt.option('force',true);

	// A Task for loading the configuration object
	grunt.task.registerTask('loadConfig', 'Task that loads the config into a grunt option.', function() {
		require('./config/init')();
		var config = require('./config/config');
		console.log(config);

	});

  // Default task(s).
  grunt.registerTask('default', ['loadConfig']);

  grunt.registerTask('dev', ['env:dev']);

  grunt.registerTask('setup', ['execute']);

  grunt.registerTask('server', [ 'server']);

};

