const validator = require('../security/validator');
const Errors = require('../security/errors');
const utilities = require('../models/utilities');
const profileManagementService = require('../services/profile-management-service');
const orgManagementService = require('../services/organization-management-service');
var SignupManagementService = require('../services/signup-management-service');
var RoleManagementService = require('../services/role-management-service');

/**
 * @api {get} /organizations Request User information
 * @apiName addNewOrganization
 * @apiGroup Organization
 *
 * @apiParam {json} json send the following as request-body
 * {
 *   "name": "mandatory-name-of-the-organization",
 *   "adminEmail": "mandatory-admin-email",
 *   "adminPassword": "mandatory-admin-password",
 *   "status": "optional-status",
 *   "description": "optional-description-of-the-organization",
 *   "address": {
 *     "line1": "line-1-details",
 *     "line2": "line-2-details",
 *     "city": "city-details",
 *     "state": "state-details",
 *     "country": "country-name",
 *     "zip": "zip-code",
 *     "googleMapsUri": "optional-google-maps-uri",
 *   },
 *   "internet": [
 *   {"name": "optional-page-name-1", "url": "url-of-page-2"},
 *   {"name": "optional-page-name-1", "url": "url-of-page-2"}
 *   ],
 *   "email": [
 *     {"name": "optional-email-1-name", "id": "org-work-email"},
 *     {"name": "optional-email-2-name", "id": "primary-employee-contact"}
 *   ],
 *   "phone": [
 *     {"type": "optional-phone-name-1", "number": "phone-number"},
 *     {"type": "optional-phone-name-2", "number": "phone-number"}
 *   ],
 *   "socialProfile" : [
 *     {"name": "optional-social-profile-name-1", "url": "url-1"},
 *     {"name": "optional-social-profile-name-2", "url": "url-2"}
 *   ],
 * }
 *
 * @apiParamExample {json} Request-Example:
 * {
 *   "name": "Wipro Technologies Pvt Ltd",
 *   "status": "active",
 *   "adminEmail": "subhashis.patil@wipro.com",
 *   "adminPassword": "password",
 *   "description": "Wipro delivers IT Services, Business and Technology Consulting, IT Outsourcing and System Integration services & solutions.",
 *   "address": {
 *     "line1": "Wipro Limited, Doddakannelli, Sarjapur Road",
 *     "city": "Bangalore",
 *     "state": "Karnataka",
 *     "country": "India",
 *     "zip": "560035"
 *   },
 *   "internet": [{"name": "home page", "url": "http://www.wipro.com/"}],
 *   "email": [
 *     {"name": "Vipin Nair", "id": "vipin.nair1@wipro.com"},
 *     {"name": "Purnima Burman", "id": "purnima.burman@wipro.com"}],
 *   "phone": [
 *     {"type": "board", "number": "+91 (80) 28440011"},
 *     {"type": "fax", "number": "+91 (80) 28440256"}],
 *   "socialProfile" : [
 *     {"name": "google+", "url": "https://plus.google.com/b/101310565991236855132/+wipro/posts"},
 *     {"name": "facebook", "url": "https://www.facebook.com/WiproTechnologies"},
 *     {"name": "youtube", "url": "https://www.youtube.com/user/Wiprovideos"},
 *     {"name": "linkedin", "url": "https://www.linkedin.com/company/wipro"},
 *     {"name": "twitter", "url": "https://twitter.com/wipro"},
 *   ]
 * }
 *
 * @apiSuccess {json} createdOrganization created organization details is returned as JSON.
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 201 CREATED
 * {
 *   "uuid": "1a6decf9-86c7-47ae-9776-24ed7ece6462",
 *   "created": {
 *     "timestamp": "2017-04-17T11:52:42.798Z",
 *     "by": "33eebe2b-8e5a-4138-b9cc-6672d57cb6cc",
 *   },
 *   "name": "Wipro Technologies Pvt Ltd",
 *   "status": "active",
 *   "admin": "34eebe2b-8e5a-4138-b9cc-6672d57cb6cc",
 *   "description": "Wipro delivers IT Services, Business and Technology Consulting, IT Outsourcing and System Integration services & solutions.",
 *   "address": {
 *     "line1": "Wipro Limited, Doddakannelli, Sarjapur Road",
 *     "city": "Bangalore",
 *     "state": "Karnataka",
 *     "country": "India",
 *     "zip": "560035"
 *   },
 *   "internet": [{"name": "home page", "url": "http://www.wipro.com/"}],
 *   "email": [
 *     {"name": "Vipin Nair", "id": "vipin.nair1@wipro.com"},
 *     {"name": "Purnima Burman", "id": "purnima.burman@wipro.com"}],
 *   "phone": [
 *     {"type": "board", "number": "+91 (80) 28440011"},
 *     {"type": "fax", "number": "+91 (80) 28440256"}],
 *   "socialProfile" : [
 *     {"name": "google+", "url": "https://plus.google.com/b/101310565991236855132/+wipro/posts"},
 *     {"name": "facebook", "url": "https://www.facebook.com/WiproTechnologies"},
 *     {"name": "youtube", "url": "https://www.youtube.com/user/Wiprovideos"},
 *     {"name": "linkedin", "url": "https://www.linkedin.com/company/wipro"},
 *     {"name": "twitter", "url": "https://twitter.com/wipro"},
 *   ]
 * }
 */
 exports.addNewOrganization = (req, res) => {
  "use strict";

  if (utilities.isEmptyObj(req.body)) { return res.status(400).send(Errors.emptyRequestBody).end(); }
  var user = {};
  validator.isUserAdmin(req)
  .then(() => { return orgManagementService.checkOrganizationExists(req.body.name); })
  .then(() => { return profileManagementService.getProfileByAuthCredentials(req); })
  .then(userProfile =>{
    user = userProfile;
    return profileManagementService.checkProfileExists(req.body.email[0].id); })
  .then(result => {
    return RoleManagementService.getRoleByRoleName(req.body.role); })
  .then(role => {
    var signup = {};
     signup.created = {};
    // signup.created.timestamp = utilities.getTimestamp();
     signup.createdBy = user.uuid;
     signup.lastModified = {};
    // signup.lastModified.timestamp = utilities.getTimestamp();
     signup.lastModifiedBy = user.uuid;
    signup.firstName = req.body.admin;
    signup.lastName = "admin";
    signup.username = req.body.email[0].id;
    signup.password = req.body.password;
    signup.phoneNumber = req.body.phone[0].number;
    signup.role = role.uuid;

    signup.socialProfiles = "";
    console.log('signup :: %j',signup);
    return SignupManagementService.addNewUser(signup,role.uuid);

  })
  .then(profile => {
    //  console.log('profile:: %j',profile);
    var org = {};
    org.uuid = utilities.getUuid();
    org.created = {};
    org.created.timestamp = utilities.getTimestamp();
    org.created.by = user.uuid;
    org.name = req.body.name;
    org.admin = profile.profile.uuid;
    org.logo = req.body.logo;
    org.status = req.body.status;
    org.description = req.body.description;
    org.address = {};
    org.address.line1 = req.body.address.line1;
    org.address.line2 = req.body.address.line2;
    org.address.city = req.body.address.city;
    org.address.state = req.body.address.state;
    org.address.country = req.body.address.country;
    org.address.zip = req.body.address.zip;
    org.address.googleMapsUri = req.body.address.googleMapsUri;
    org.internet = [];
    req.body.internet.forEach(a => { org.internet.push(a); });
    org.email = [];
    req.body.email.forEach(e => { org.email.push(e); });
    org.phone = [];
    req.body.phone.forEach(p => { org.phone.push(p); });
    org.socialProfile = [];
    req.body.socialProfile.forEach(sp => { org.socialProfile.push(sp); });

     return orgManagementService.addNewOrganization(org);
  })
  .then(org => {
    return profileManagementService.updatedOrganization(user.uuid,org);
  })
  .then(savedOrg => {
    console.info('saved organization ', savedOrg.name);
    return res.status(201).send(savedOrg).end();
  })
  .catch(err => {
    console.info('err: %j', err);
    return res.status(err.code).send(err).end();
  });
};

exports.getAllOrganizations = (req, res) => {
  "use strict";

  validator.isValidCredentials(req)
  .then(() => { return orgManagementService.getAllOrganizations(); })
  .then(orgs => {
    console.info('orgs: %j ', orgs);
    return res.status(200).send(orgs).end();
  })
  .catch(err => {
    console.info('err: %j', err);
    return res.status(err.code).send(err).end();
  });
};

exports.updateLogo = (req, res) => {
  "use strict";
  console.log('req :: %j',req.headers);
  validator.isValidCredentials(req)
  .then(result => { return profileManagementService.getProfileByAuthCredentials(req); })
  .then(profile => {return orgManagementService.updateLogo(profile,req.headers.orguuid, req.file); })
  .then(updatedLogo => { return res.status(200).send(updatedLogo); })
  .catch(err => {
    console.error('Err: %s', JSON.stringify(err));
    return res.status(err.code).send(err);
  });
};

exports.getOrganizationsByProfile = (req, res) => {
  "use strict";
  validator.isValidCredentials(req)
  .then(result => { return profileManagementService.getProfileByAuthCredentials(req); })
  .then(profile => { return orgManagementService.getOrganizationsByProfile(profile); })
  .then(orgs => { return res.status(200).send(orgs); })
  .catch(err => {
    console.info('err: %j', err);
    return res.status(err.code).send(err).end();
  });
};

exports.updateOrganizations = (req, res) => {
  "use strict";
  validator.isValidCredentials(req)
  .then(result => { return orgManagementService.validateOrgAdmin(req.body.orgUuid); })
  .then(result => { return orgManagementService.checkUpdatedOrganizationExists(req.body.name,req.body.orgUuid); })
  .then(org => { return profileManagementService.getProfileByAuthCredentials(req); })
  .then(profile => { return orgManagementService.updateOrganizations(profile.uuid,req.body); })
  .then(organization => { return res.status(200).send(organization); })
  .catch(err => {
    console.info('err: %j', err);
    return res.status(err.code).send(err).end();
  });
};

exports.addNewRecruiter = (req, res) => {
 "use strict";

 if (utilities.isEmptyObj(req.body)) { return res.status(400).send(Errors.emptyRequestBody).end(); }
 var user = {};
 validator.isValidCredentials(req)
 .then(() => { return profileManagementService.getProfileByAuthCredentials(req); })
 .then(userProfile =>{
   user = userProfile;
   return profileManagementService.checkProfileExists(req.body.email); })
 .then(result => { return profileManagementService.checkRecruiterAdminCount(user.uuid); })
 .then(notExists => {
   return RoleManagementService.getRoleByRoleName(req.body.role); })
 .then(role => {
   var signup = {};
    signup.created = {};
   // signup.created.timestamp = utilities.getTimestamp();
    signup.createdBy = user.uuid;
    signup.lastModified = {};
   // signup.lastModified.timestamp = utilities.getTimestamp();
    signup.lastModifiedBy = user.uuid;
   signup.firstName = req.body.firstName;
   signup.lastName = req.body.lastName;
   signup.username = req.body.email;
   signup.password = req.body.password;
   signup.phoneNumber = req.body.phone;
   signup.role = role.uuid;
   signup.organization = user.organization;

   signup.socialProfiles = "";
   console.log('signup :: %j',signup);
   return SignupManagementService.addNewUser(signup,role.uuid);

 })
 .then(profile => {
   console.info('saved profile ', profile);
   return res.status(201).send(profile).end();
 })
 .catch(err => {
   console.info('err: %j', err);
   return res.status(err.code).send(err).end();
 });
};
