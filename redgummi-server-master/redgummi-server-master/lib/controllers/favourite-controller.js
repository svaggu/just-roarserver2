var Validator = require('../security/validator');
var utils = require('../models/utilities');
var errors = require('../security/errors');

var FavouriteService = require('../services/favourite-service');
var ProfileManagementService = require('../services/profile-management-service');


// To add all the favourite profiles by the recruiter
//jshint unused:false
exports.addFavourite = (req, res) => {
  if (!req || !req.body) {
    throw(errors.emptyRequestBody);
  }
  Validator.isValidCredentials(req)
  .then(result => { return ProfileManagementService.getProfileByAuthCredentials(req); })
  .then(profile => { return FavouriteService.addFavourite(profile.uuid,req.body); })
  .then(dto => { return res.status(201).send(dto); })
  .catch(err => {
    console.error('Err: %s', JSON.stringify(err));
    return res.status(err.code).send(err).end();
  });
};

// Get All favourites by Recruiter
exports.listFavourites = (req, res) => {
  "use strict";

  Validator.isValidCredentials(req)
  .then(result => { return ProfileManagementService.getProfileByAuthCredentials(req); })
  .then(profile => { return FavouriteService.listFavourites(profile.uuid); })
  .then(jobSeekersList => { return FavouriteService.getFavApplicants(jobSeekersList); })
  .then(jobsApplicantsDTO => { return res.status('200').send(jobsApplicantsDTO); })
  .catch(err => {
    console.error('Err: %s', JSON.stringify(err));
    return res.status(err.code).send(err);
  });
};

exports.removeFavourite = (req, res) => {
  if (!req || !req.body) {
    throw(errors.emptyRequestBody);
  }
  Validator.isValidCredentials(req)
  .then(result => { return ProfileManagementService.getProfileByAuthCredentials(req); })
  .then(profile => { return FavouriteService.removeFavourite(profile.uuid,req.body); })
  .then(dto => { return res.status(201).send(dto); })
  .catch(err => {
    console.error('Err: %s', JSON.stringify(err));
    return res.status(err.code).send(err).end();
  });
};
