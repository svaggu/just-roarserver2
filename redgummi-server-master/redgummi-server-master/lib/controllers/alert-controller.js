var Validator = require('../security/validator');
var utilities = require('../models/utilities');
var Errors = require('../security/errors');

var AlertService = require('../services/alert-service');
var RoleManagementService = require('../services/role-management-service');
var ProfileManagementService = require('../services/profile-management-service');
var RoleManagementService = require('../services/role-management-service');

exports.createAlert = (req, res) => {
 "use strict";

 if (utilities.isEmptyObj(req.body)) { return res.status(400).send(Errors.emptyRequestBody).end(); }

 Validator.isValidCredentials(req)
 .then(result => { return ProfileManagementService.getProfileByAuthCredentials(req); })
 .then(userProfile =>{ return AlertService.createAlert(userProfile.uuid,req.body); })
 .then(createdAlert => { return res.status(201).send(createdAlert).end(); })
 .catch(err => {
   console.info('err: %j', err);
   return res.status(err.code).send(err).end();
 });
};

// Get All alerts by user
exports.listAlerts = (req, res) => {
  "use strict";

  Validator.isValidCredentials(req)
  .then(result => { return ProfileManagementService.getProfileByAuthCredentials(req); })
  .then(profile => { return AlertService.listAlerts(profile.uuid); })
  .then(alerts => { return res.status('200').send(alerts); })
  .catch(err => {
    console.error('Err: %s', JSON.stringify(err));
    return res.status(err.code).send(err);
  });
};
