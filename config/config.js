'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	gruntFile = require('grunt').file,
	bowerFiles = require('main-bower-files'),
	path = require('path'),
	fs = require('fs');

var exists = require('path-exists').sync;

var minBowerFiles = function(type){
    return bowerFiles(type).map( function(path, index, arr) {
      var newPath = path.replace(/.([^.]+)$/g, '.min.$1');
      return exists( newPath ) ? newPath : path;
    });
};

/**
 * Load app configurations
 */
var exports = _.extend(
    require('./env/all'),
    require('./env/' + process.env.NODE_ENV) || {}
    );

//Load keys from api_keys.js if file exists
if( fs.existsSync('./config/env/api_keys.js') ){
	module.exports = _.extend(
		exports,
		require('./env/api_keys')
	);
} else {
	module.exports = exports;
}


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

