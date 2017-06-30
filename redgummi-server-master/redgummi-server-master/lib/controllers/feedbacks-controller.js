var BasicAuth = require('basic-auth');
var Validator = require('../security/validator');
var FeedbackManagementService = require('../services/feedback-management-service');
var utilities = require('../models/utilities');

// Adding Employee feedback
//jshint unused:false
exports.addFeedback = function (req, res) {
  "use strict";

  // Get the credentials
  var credentials = new BasicAuth(req);  // TODO: Change this to JWT based stateless token based authentication
  var feedback = {};
  feedback.uuid = utilities.getUuid();
  feedback.timestamp= utilities.getTimestamp();
  feedback.thinkingtocommentfor = req.body.thinkingtocommentfor;
  feedback.relationship = req.body.relationship;
  feedback.name = req.body.name;
  feedback.emailid = req.body.emailid;
  feedback.subject = req.body.subject;
  feedback.comment = req.body.comment;

  Validator.isValidCredentials(req)
  .then(result =>{ return FeedbackManagementService.addFeedback(credentials, feedback); })
  .then(savedFeedback => {
    console.info('in controller - added new feedback for the employee: ' + JSON.stringify(savedFeedback.uuid));
    return res.sendStatus(201);
  })
  .catch(err => {
    console.error('Err: %s', JSON.stringify(err));
    return res.status(err.code).send(err);
  });
};

// Get all employee feedbacks
exports.getAllFeedbacks = (req, res) => {
  "use strict";

  FeedbackManagementService.getAllFeedbacks()
  .then(feedbacks => { return res.status('200').send(feedbacks); })
  .catch(err => {
    console.error('Err: %s', JSON.stringify(err));
    return res.status(err.code).send(err);
  });
};
