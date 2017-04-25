'use strict';

module.exports = {
	app: {
		google_analytics_id: process.env.GOOGLE_ANALYTICS_ID || '',
		title: process.env.APP_NAME || 'Express Starter Application',
		description: process.env.APP_DESC || 'A Case Consulting starter application to quickly start a new project'
	},
	db: {
		uri: 'mongodb://'+ (process.env.DB_PORT_27017_TCP_ADDR || process.env.DB_HOST || 'localhost')+'/mean',
		options: {
			user: '',
			pass: ''
		}
	},
	aws: {
		"accessKeyId": process.env.AWS_ACCESS_ID,
		"secretAccessKey": process.env.AWS_SECRET_KEY,
		"region": process.env.AWS_REGION
	},

	port: process.env.PORT || 3000,
	socketPort: process.env.SOCKET_PORT || 20523,

	templateEngine: 'ejs',

	baseUrl: '',

	tempUserCollection: 'temporary_users',

	// The secret should be set to a non-guessable string that
	// is used to compute a session hash
	sessionSecret: 'MEAN',
	// The name of the MongoDB collection to store sessions in
	sessionCollection: 'sessions',
	// The session cookie settings
	sessionCookie: {
		path: '/',
		httpOnly: true,
		// If secure is set to true then it will cause the cookie to be set
		// only when SSL-enabled (HTTPS) is used, and otherwise it won't
		// set a cookie. 'true' is recommended yet it requires the above
		// mentioned pre-requisite.
		secure: false,
		// Only set the maxAge to null if the cookie shouldn't be expired
		// at all. The cookie will expunge when the browser is closed.
		maxAge:  24 * 60 * 60 * 1000 // 24 hours
		// To set the cookie in a specific domain uncomment the following
		// setting:
		//domain: process.env.COOKIE_SESSION_URL || process.env.BASE_URL || '.tellform.com'
	},

	// The session cookie name
	sessionName: 'connect.sid',
	log: {
		// Can specify one of 'combined', 'common', 'dev', 'short', 'tiny'
		format: 'combined',
		// Stream defaults to process.stdout
		// Uncomment to enable logging to a log on the file system
		options: {
			stream: 'access.log'
		}
	},
	assets: {
		css: [
			'public/stylesheets/*.css'
		],
		unit_tests: [
			'test/**/*.js'
		]
	}
};
