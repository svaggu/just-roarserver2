const utilities = require('../models/utilities');
const Validator = require('../security/validator');
const Errors = require('../security/errors');
const ProfileManagementService = require('../services/profile-management-service');
const RoleManagementService = require('../services/role-management-service');
const ResumeManagementService = require('../services/resume-management-service');

/**
 * @api {get} /login login into the service
 * @apiName login
 * @apiGroup Profile
 *
 * @apiParam (profile) {Credentials} credentials Credentials sent as authentication headers
 *
 * @apiSuccess (200) {Client} client client object matching the credentials.
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "uuid": "26d20448-a4ba-4a09-9ea6-5526e6c50c3d",
 *   "role": "e23332e1-8f78-4b83-a6e2-3c84fa2f54df",
 *   "firstName": "Surya",
 *   "lastName": "Vempati",
 *   "gender": "male",
 *   "email": "surya@snigdha.co.in",
 *   "phoneNumber": "+911234567890",
 *   "socialProfiles":
 *     [
 *       {
 *         socialNetworkName: "facebook"
 *         email: 'vempatisurya@gmail.com'
 *         details: {...}
 *       },
 *     ]
 * }
 */
//jshint unused:false
exports.login = function (req, res) {
  "use strict";

  // validate if the user is present and passwords match
  // if match found, send back profile details
  // if match not found, send error code 400 or 500 as needed

  var profileDTO = [];
  var userProfile;
  Validator.isValidCredentials(req)
  .then(result => {
    // console.log('result:: %j',result);
    return ProfileManagementService.getProfileByAuthCredentials(req);
  })
  .then(profile => {
    console.log('profile %j',profile);
    userProfile = profile;
    var profileDto = {};
    profileDto.profile = profile;
    profileDTO.push(profileDto);
    return RoleManagementService.getRole(profile.role);
  })
  .then(role => {
    var roleDto = {};
    roleDto.role = role;
    profileDTO.push(roleDto);
    if(!userProfile.defaultResume || userProfile.defaultResume === undefined || userProfile.defaultResume == null || userProfile.defaultResume == ""){
      var resumeDto = {};
      resumeDto.defaultResume = "";
      profileDTO.push(resumeDto);
      return res.status(200).send(profileDTO);
    }else{
      ResumeManagementService.getDefaultResume(userProfile.defaultResume)
      .then(resume => {
        console.log('resume :: %j',resume);
        var resumeDto = {};
        resumeDto.defaultResume = resume;
        profileDTO.push(resumeDto);
        return res.status(200).send(profileDTO);
      })
      .catch(err => {
        console.error('Err: %s', JSON.stringify(err));
        return res.status(err.code).send(err);
      });
    }

  })
  .catch(err => {
    console.error('Err: %s', JSON.stringify(err));
    return res.status(err.code).send(err);
  });
};
