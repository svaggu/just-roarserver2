/*
 * jobumes-server
 * https://github.com/enhariharan/jobumes-server
 *
 * Copyright (c) 2017 Hariharan Narayanan
 * Licensed under the private license.
 */

/* jshint -W034 */
'use strict';

var express = require('express');
var http = require('http');
var app = express();
var mongoose = require('mongoose');
var cors = require('cors');

var appInfo = require('../../package.json');
var configuration = require('../../configuration').configuration;
var routes = require('./routes.js');

//TODO: Right now, CORS is enabled across the board.  Do check and limit this as needed.
// Refer to these links to see how:
// https://github.com/expressjs/cors
// https://stackoverflow.com/questions/7067966/how-to-allow-cors
// http://enable-cors.org/server_expressjs.html
// https://www.npmjs.com/package/cors
app.use(cors()); // enable CORS across the board
app.options('*', cors()); // enable CORS pre-flight reqeusts across the board

// return mongodb connection string
var getDbConnection = (env) => {
  switch(env) {
    case 'development': return configuration.mongo.development.connectionString;
    case 'test': return configuration.mongo.test.connectionString;
    case 'production': return configuration.mongo.production.connectionString;
    default: return null;
  }
};

// Create the app and start server.
var startServer = () => {
  "use strict";

  var webServer = http.createServer(app);
  webServer.listen(app.get('port'), function() {
    console.log('(%s) started on port (%d) in (%s) mode; press Ctrl+C to terminate', appInfo.name, app.get('port'), app.get('env'));
  });
};

// connect to database
app.set('port', configuration.server.port || 9060);

// configure mongoose to connect to our MongoDB database
var opts = { server: { socketOptions: { keepAlive: 1 } } };

// Connect to MongoDB database instance
console.info('NODE_ENV: %s', app.get('env'));
console.info('opening mongoose connection to: %s', getDbConnection(app.get('env')));
mongoose.connect(getDbConnection(app.get('env')), opts);

// configure REST API routes
routes(app);

// Create the app and start server.
if (require.main === module) {
  startServer();
} else {
  module.exports = startServer;
}
