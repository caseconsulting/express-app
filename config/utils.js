'use strict';

/**
 * Module dependencies.
 */
var gruntFile = require('grunt').file,
	path = require('path'),
	fs = require('fs');

var exists = require('path-exists').sync;

/**
 * Get files by glob patterns
 */
module.exports.getGlobbedFiles = function(globPatterns, removeRoot, addRoot) {

	var files = gruntFile.expand(globPatterns);
	if (removeRoot) {
		files = files.map(function(file) {
			if(addRoot) return file.replace(removeRoot, addRoot);
			return file.replace(removeRoot, '');
		});
	}

	return files;
};
