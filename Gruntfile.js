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
    watch: {
	    jshint: {
	    	all: {
	    		src: watchFiles.clientJS.concat(watchFiles.serverJS),
	    		options: {
	    			jshintrc: true
	    		}
	    	},
	    	allTests: {
	    		src: watchFiles.allTests,
	    		options: {
	    			jshintrc: true
	    		}
	    	}
	    }
    }
  });

  grunt.option('force',true);

	// A Task for loading the configuration object
	grunt.task.registerTask('loadConfig', 'Task that loads the config into a grunt option.', function() {
		require('./config/init')();
		var config = require('./config/config');
		console.log(config);

	});



  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');


  // Default task(s).
  grunt.registerTask('default', ['uglify']);

};

