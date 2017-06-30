/* jshint -W034 */
'use strict';

var mongoose = require('mongoose');
var FeedbackManagementService = require('../lib/services/feedback-management-service');
var Config = require('../configuration').configuration;

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

var dbConnection = null;
var opts = { server: { socketOptions: { keepAlive: 1 } } };

exports.setUp = (callback) => {
  if (!dbConnection) {
    console.log('\nsetUp() called');
    dbConnection = mongoose.createConnection(Config.mongo.development.connectionString, opts);
  }
  callback();
};

exports.tearDown = (callback) => {
  if (dbConnection) {
    console.log('\ntearDown() called');
    dbConnection.close();
    dbConnection = null;
  }
  callback();
};

exports.testGetAllFeedbacks = (test) => {
  test.ok(FeedbackManagementService !== null, true, 'FeedbacksManangementService should not be null');
  test.ok(FeedbackManagementService !== undefined, true, 'FeedbacksManangementService should not be undefined');
  FeedbackManagementService.getAllFeedbacks()
  .then(feedbacks => {
    console.log('\n%n feedbacks found', feedbacks.length);
    test.ok(feedbacks.length > 0, 'count of feedbacks read from DB should be not 0.');
    test.done();
  })
  .catch(err => {
    console.log('testGetAllFeedbacks failed: ' + err);
    test.done();
  });
};
