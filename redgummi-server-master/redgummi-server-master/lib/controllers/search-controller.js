var Validator = require('../security/validator');
var utilities = require('../models/utilities');
var Errors = require('../security/errors');

var searchService = require('../services/search-service');
var ProfileManagementService = require('../services/profile-management-service');

exports.addSearchKeyword = (req, res) => {
 "use strict";

 if (utilities.isEmptyObj(req.body)) { return res.status(400).send(Errors.emptyRequestBody).end(); }

 Validator.isValidCredentials(req)
 .then(result => { return ProfileManagementService.getProfileByAuthCredentials(req); })
 .then(userProfile =>{ return searchService.addSearchKeyword(userProfile.uuid,req.body); })
 .then(createdSearch => { return res.status(201).send(createdSearch).end(); })
 .catch(err => {
   console.info('err: %j', err);
   return res.status(err.code).send(err).end();
 });
};

// Get All alerts by user
exports.getSearchKeywords = (req, res) => {
  "use strict";

  Validator.isValidCredentials(req)
  .then(result => { return ProfileManagementService.getProfileByAuthCredentials(req); })
  .then(profile => { return searchService.getSearchKeywords(profile.uuid); })
  .then(keywords => { return res.status('200').send(keywords); })
  .catch(err => {
    console.error('Err: %s', JSON.stringify(err));
    return res.status(err.code).send(err);
  });
};

// Get All alerts by user
exports.deletesearchKeywords = (req, res) => {

  Validator.isValidCredentials(req)
  .then(result => { return ProfileManagementService.getProfileByAuthCredentials(req); })
  .then(profile => { return searchService.deletesearchKeywords(profile.uuid); })
  .then(keywords => { return res.status('200').send(keywords); })
  .catch(err => {
    console.error('Err: %s', JSON.stringify(err));
    return res.status(err.code).send(err);
  });
};
