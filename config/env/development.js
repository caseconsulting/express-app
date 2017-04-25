'use strict';

module.exports = {
	baseUrl: process.env.BASE_URL || 'http://localhost:3000',
	db: {
		uri: 'mongodb://'+( process.env.DB_PORT_27017_TCP_ADDR || process.env.DB_HOST || '0.0.0.0') +'/mean',
		options: {
			user: process.env.MONGO_USER || '',
			pass: process.env.MONGO_PASS || ''
		}
	},

	log: {
		// Can specify one of 'combined', 'common', 'dev', 'short', 'tiny'
		format: 'dev',
		// Stream defaults to process.stdout
		// Uncomment to enable logging to a log on the file system
		options: {
			// stream: 'access.log'
		}
	}
};

