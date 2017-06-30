var BasicAuth = require('basic-auth');
var Profile = require('../models/profile-model').Profile;
var ProfileManagementService = require('../services/profile-management-service');
var RoleManagementService = require('../services/role-management-service');
var Errors = require('./errors');
const utilities = require('../models/utilities');

var _isSuperAdmin = (credentials) => {
  return (credentials.name.toLowerCase().localeCompare('jobumesadmin') === 0 && credentials.pass.localeCompare('12hbd76!') === 0);
};

// Validate Social Credentials
// How does login by social work?
// The UI is first expected to validate social login in the UI.
// If that passes then UI must call GET /login with these HTTP request headers set -
// "source" must be set to "facebook" or "google" or other network as appropriate
// "user" must be set to the email use at the social login
// "role" must be set to "recruiter" or "jobseeker" based on the role of calling user
var _validateSocialCredentials = (req) => {
  return new Promise(
    (resolve, reject) => {
      Profile.find({}, {uuid:1, login:1, socialProfiles:1, role:1}).exec()
      .then(profiles => {
        var foundProfile = null;
        profiles.forEach(p => {
          if (p.login.username === req.headers.user) {
            for (var i=0; i< p.socialProfiles.length; i++) {
              var s = p.socialProfiles[i];
              if (s.socialNetworkName === req.headers.source && s.email === req.headers.user) {
                // user's social credentials have been validated. So break this inner loop now.
                foundProfile = p;
                break;
              }
            }
            if (foundProfile && foundProfile !== undefined) {
              // validate that the role of the user is also valid
              RoleManagementService.getRole(foundProfile.role)
              .then(role => {
                // if (role.name === req.headers.role) { resolve(true); }
                // else { throw(Errors.invalidRoleProvidedForAuthentication); }
                if(req.headers.role === 'recruiter' || req.headers.role === 'recruiterAdmin')
                {
                  if(role.name === 'recruiter' || role.name === 'recruiterAdmin') { resolve(true);}
                  else{ reject(Errors.invalidRoleProvidedForAuthentication); }
                }else{
                    if (role.name === req.headers.role) { resolve(true); }
                   else { reject(Errors.invalidRoleProvidedForAuthentication); }
                }
              })
              .catch(err => { reject(err); });
            }
          }
        });
        if (!foundProfile) { throw(Errors.invalidCredentials); }
      })
      .catch(err => { reject(err); });
  });
};

// Validate Basic Credentials
// How does login by BasicAuth work?
// User is expected to set the basic auth credentials while sending the REST request.
// Aprt from this the below HTTP request-header must be set
// "role" must be set to "recruiter" or "jobseeker" based on the role of calling user
var _validateBasicAuthCredentials = (req) => {
  return new Promise(
    (resolve, reject) => {

      var credentials = new BasicAuth(req);
      if (!credentials || credentials === undefined) { throw(Errors.invalidCredentials); }
      if (_isSuperAdmin(credentials)) { resolve(true); }

      Profile.findOne({'login.username': credentials.name}).exec()
      .then(u => {
        if (!u || u === undefined || credentials.name.toLowerCase().localeCompare(u.login.username.toLowerCase()) || credentials.pass.localeCompare(u.login.password)) {
          throw(Errors.invalidCredentials);
        }
        return RoleManagementService.getRole(u.role);
      })
      .then(r => {
        // if (r.name === req.headers.role) { resolve(true); }
        // else { reject(Errors.invalidRoleProvidedForAuthentication); }
        if(req.headers.role === 'recruiter' || req.headers.role === 'recruiterAdmin')
        {
          if(r.name === 'recruiter' || r.name === 'recruiterAdmin') { resolve(true);}
          else{ reject(Errors.invalidRoleProvidedForAuthentication); }
        }else{
            if (r.name === req.headers.role) { resolve(true); }
           else { reject(Errors.invalidRoleProvidedForAuthentication); }
        }

      })
      .catch(err => {reject(err);});
  });
};

var isValidCredentials = (req) => {
  return new Promise(
    (resolve, reject) => {
      if (utilities.isEmptyObj(req)) { throw(Errors.emptyRequestBody); }

      var isRoleProvided = (req.headers.role && req.headers.role !== undefined);
      var isRoleValid = isRoleProvided &&
        (req.headers.role === 'jobseeker' || req.headers.role === 'recruiter' || req.headers.role === 'admin' || req.headers.role === 'recruiterAdmin');
      var isSocialAuthCredsProvided = (req.headers.source && req.headers.source !== undefined &&
          req.headers.user && req.headers.user !== undefined && isRoleValid);
      var isBasicAuthCredsProvided = (req.headers.authorization && req.headers.authorization.includes('Basic') && isRoleValid);
      var authCredentialsProvided =  (isSocialAuthCredsProvided || isBasicAuthCredsProvided);

      // Try with social credentials
      if (!authCredentialsProvided) { reject(Errors.invalidCredentials); }
      else if (isSocialAuthCredsProvided) {
        _validateSocialCredentials(req)
        .then(isValidCredentials => {
          if (isValidCredentials) { resolve(true); }
          else { throw(Errors.invalidCredentials); }
        })
        .catch(err => { reject(err); });
      } else if (isBasicAuthCredsProvided) {
        _validateBasicAuthCredentials(req)
        .then(isValidCredentials => {
          // console.log('isValidCredentials :: %j',isValidCredentials);
          if (isValidCredentials) { resolve(true); }
          else { throw(Errors.invalidCredentials); }
        })
        .catch(err => { reject(err); });
      } else { reject(Errors.invalidCredentials); }
  });
};

var isUserAdmin = (req) => {
  return new Promise(
    (resolve, reject) => {
      isValidCredentials(req)
      .then(result => {
        var credentials = new BasicAuth(req);
        if (_isSuperAdmin(credentials)) { resolve(true); }
        if (!result) { throw(Errors.invalidCredentials); }
        return ProfileManagementService.getProfileByAuthCredentials(req);
      })
      .then(user => {
        if (!user || user === undefined) {
          throw(Errors.invalidCredentials);
        }
        if (!user.role || user.role === undefined) {
          throw(Errors.invalidCredentialsRoleNotAdmin);
          }
        return RoleManagementService.getRole(user.role);
      })
      .then(role => {
        if (!role || role === undefined || role.name !== 'admin') {
          throw(Errors.invalidCredentialsRoleNotAdmin);
        }
        resolve(true);
      })
      .catch(err => { reject(err); });
  });
};

var isUserRecruiter = (req) => {
  return new Promise(
    (resolve, reject) => {
      isValidCredentials(req)
      .then(result => {
        var credentials = new BasicAuth(req);
        if (_isSuperAdmin(credentials)) { resolve(true); }
        if (!result) { throw(Errors.invalidCredentials); }
        return ProfileManagementService.getProfileByAuthCredentials(req);
      })
      .then(user => {
        if (!user || user === undefined) {
          throw(Errors.invalidCredentials);
        }
        if (!user.role || user.role === undefined){
          throw(Errors.invalidCredentialsRoleNotRecruiter);
        }
        if (!user.role || user.role === undefined) {
          throw(Errors.invalidCredentialsRoleNotRecruiter);
        }
       return RoleManagementService.getRole(user.role);
      })
      .then(role => {
        if (!role || role === undefined || role.name !== 'recruiter' || role.name !== 'recruiterAdmin') {
          throw(Errors.invalidCredentialsRoleNotRecruiter);
        }
        resolve(true);
      })
      .catch(err => { reject(err); });
  });
};

module.exports = {isValidCredentials, isUserAdmin, isUserRecruiter};
