 var utils = require('../models/utilities');
var ProfileManagementService = require('../services/profile-management-service');
var JobsManagementService = require('../services/jobs-management-service');
var ResumeManagementService = require('../services/resume-management-service');
var MailService = require('../services/mail-service');
var Validator = require('../security/validator');
var BasicAuth = require('basic-auth');
var Errors = require('../security/errors');
const nodemailer = require('nodemailer');
const xoauth2 = require('xoauth2');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
     user: 'aredgummi@gmail.com',
     pass:'redgummi123'
            // clientId: '163224009781-sl6let00gr7rkh2amiiuo1ov8hd62s6u.apps.googleusercontent.com',
            // clientSecret: 'Tk9na4aNwQW2TnSis1vq6TqE',
            // refreshToken: '1/Ag8OIJyjnLefihl43WGtWiaY-l8f_vkv9RkuJf-DwB4'
    }
})


/**
 * @api {get} /profiles Get all available profiles. Only admin role can access this URI.
 * @apiName getAllProfiles
 * @apiGroup Profile
 *
 * @apiParam None
 *
 * @apiSuccess (200) {Profile[]} profiles Array of profiles.
 * @apiSuccessExample {json} Success-Response:
 */
//jshint unused:false
exports.getAllProfiles = (req, res) => {
  "use strict";

  // Validate input and exit in case of an error right now
  Validator.isUserAdmin(req)
  .then(result => { return ProfileManagementService.getAllProfiles(); })
  .then(profiles => { return res.status('200').send(profiles); })
  .catch(err => {
    console.error('Err: %s', JSON.stringify(err));
    return res.status(err.code).send(err);
  });
};

/**
 * @api {get} /profiles/:uuid Get profile by given uuid. Admin can access any uuid. Users can access only
 * their details by providing their profile uuid.
 * @apiName getProfile
 * @apiGroup Profile
 *
 * @apiParam None
 *
 * @apiSuccess (200) {Profile[]} Profiles JSON array of 1 profile having given uuid.
 * @apiSuccessExample {json} Success-Response:
 */
//jshint unused:false
exports.getProfile = (req, res) => {
  "use strict";

  Validator.isAuthorizedForGetProfileByUuid(req)
  .then(result => { return ProfileManagementService.getProfile(req.params.uuid); })
  .then(profile => { return res.status('200').send(profile); })
  .catch(err => {
    console.error('Err: %s', JSON.stringify(err));
    return res.status(err.code).send(err);
  });
};

//jshint unused:false
var _prepareToSave = (data) => {
  "use strict";

  return new Promise(
    (resolve, reject) => {
      var profileDTO = {
        uuid: utils.getUuid(),
        timestamp: utils.getTimestamp(),
        firstName: data.firstName,
        lastName: data.lastName,
        middleName: data.middleName,
        gender: data.gender,
        user: data.user
      };
      resolve(profileDTO);
  });
};

/**
 * @api {post} /profiles Add a new profile. Only admin can access this URI.
 * @apiName addProfile
 * @apiGroup Profile
 *
 * @apiParam (profile) {Profile} profile Give a profile as JSON
 * @apiParamExample {json} Request-header "Content-Type: application/json" must be set.  Request-Example:
 * @apiSuccess (201) {Profile} profile Created profile is returned as JSON.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 Created
 *
 * @apiError (400) {String} BadRequest Error code 400 is returned if the JSON format is incorrect.
 * @apiError (500) {String} InternalServerError Error code 500 is returned in case of some error in the server.
 */
//jshint unused:false
exports.addProfile = (req, res) => {
  "use strict";

  Validator.isValidCredentials(req)
  .then(result => {
    if (utils.isEmptyObj(req.body)) { throw(Errors.emptyRequestBody); }
    return _prepareToSave(req.body);
  })
  .then(profileDTO => { return ProfileManagementService.addProfile(profileDTO); })
  .then(profile => {
    if (!profile || profile === undefined) {
      throw(Errors.errorWhileSavingProfile);
    }
    console.log('saved profile: ' + JSON.stringify(profile.firstName));
    return res.status('201').send(profile);
  })
  .catch(err => {
    console.error('Err: %s', JSON.stringify(err));
    return res.status(err.code).send(err);
  });
};

// Code for Change password
//jshint unused:false
exports.changePassword = function (req, res) {
  "use strict";
  if (!req || !req.body) {
    throw(Errors.emptyRequestBody);
  }
  Validator.isValidCredentials(req)
  .then(result => {
    return ProfileManagementService.getProfileByAuthCredentials(req);
  })
  .then(originalProfile => {
    return ProfileManagementService.changePassword(originalProfile.uuid,req.body);
  })
  .then(modifiedProfile => {
    console.log('modifiedProfile :: %j',modifiedProfile);
    MailService.getMailTemplate("ChangePassword")
    .then(template => {
      var modifiedText = "Dear "+modifiedProfile[0].firstName+",\n\n"+template[0].text+"\n\n Username: "+req.body.username+"\n Password: "+req.body.password+"\n\n\n Thanks & Regards \n Red-Gummi.";
        var mailOptions = {
            from: 'Admin<aredgummi@gmail.com>',
            to: ''+req.body.username,
            subject: ''+template[0].subject,
            text: ''+modifiedText
        }
        transporter.sendMail(mailOptions, function (err, res) {
          if(err){
              console.log('Error',err);
          } else {
              console.log('Email Sent');
          }
         })
        return res.status('200').send(modifiedProfile);
      })
    })
  .catch(err => {
    console.error('Err: %s', JSON.stringify(err));
    return res.status(err.code).send(err);
  });

};

/**
 * @api {put} /profiles/images Update the image of the profile of logged in user.
 * @apiName updateProfileImage
 * @apiGroup Profile
 *
 * @apiParam (credentials) {credentials} credentials Logged in users credentials provided as BasicAuth headers
 * @apiParam (image) {image} image Image to be attached to this profile, provided as a form-date in request-body. The image file must be uploaded with the key "file".
 * @apiSuccess (200) {Profile} profile Updated profile is returned as JSON.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *
 * @apiError (403) {String} AuthenticationError Error code 403 is returned if credentials are incorrect.
 * @apiError (400) {String} BadRequest Error code 400 is returned if request-body format is incorrect.
 * @apiError (500) {String} InternalServerError Error code 500 is returned in case of some error in the server.
 */
exports.updateProfileImage = (req, res) => {
  "use strict";

  Validator.isValidCredentials(req)
  .then(result => { return ProfileManagementService.getProfileByAuthCredentials(req); })
  .then(profile => { return ProfileManagementService.updateProfileImage(profile, req.file); })
  .then(updatedProfile => { return res.status(200).send(updatedProfile); })
  .catch(err => {
    console.error('Err: %s', JSON.stringify(err));
    return res.status(err.code).send(err);
  });
};

exports.getProfileImage = (req, res) => {
  "use strict";
  var profile = null;
  Validator.isValidCredentials(req)
  .then(result => {
    return ProfileManagementService.getProfileByAuthCredentials(req);
  })
  .then((verifiedProfile) => {
     if (!verifiedProfile || verifiedProfile === undefined) {
      throw(Errors.invalidCredentials);
    }
    console.log("verified profile: %j",verifiedProfile);
    return ProfileManagementService.getProfileImage(verifiedProfile.login.username);
  })
  .then((verfiedProfileImage) => {
    console.log("verified profile image path: : %j",verfiedProfileImage);
    return res.status('200').send(verfiedProfileImage);
  })
  .catch(err => {
    console.error('Err: %s', JSON.stringify(err));
    return res.status(err.code).send(err);
  });
};

/**
 * @api {put} /profiles/videos Update the video of the profile of logged in user.
 * @apiName updateProfileVideo
 * @apiGroup Profile
 *
 * @apiParam (credentials) {credentials} credentials Logged in users credentials provided as BasicAuth headers
 * @apiParam (video) {video} video Video to be attached to this profile, provided as a form-date in request-body. The video file must be uploaded with the key "file".
 * @apiSuccess (200) {Profile} profile Updated profile is returned as JSON.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *
 * @apiError (403) {String} AuthenticationError Error code 403 is returned if credentials are incorrect.
 * @apiError (400) {String} BadRequest Error code 400 is returned if request-body format is incorrect.
 * @apiError (500) {String} InternalServerError Error code 500 is returned in case of some error in the server.
 */
exports.updateProfileVideo = (req, res) => {
  "use strict";

  Validator.isValidCredentials(req)
  .then(result => { return ProfileManagementService.getProfileByAuthCredentials(req); })
  .then(profile => { return ProfileManagementService.updateProfileVideo(profile, req.file); })
  .then(updatedProfile => { return res.status(200).send(updatedProfile); })
  .catch(err => {
    console.error('Err: %s', JSON.stringify(err));
    return res.status(err.code).send(err);
  });
};

exports.getProfileVideo = (req, res) => {
  "use strict";
  var profile = null;
  Validator.isValidCredentials(req)
  .then(result => {
    return ProfileManagementService.getProfileByAuthCredentials(req);
  })
  .then((verifiedProfile) => {
     if (!verifiedProfile || verifiedProfile === undefined) {
      throw(Errors.invalidCredentials);
    }
    console.log("verified profile: %j",verifiedProfile);
    return ProfileManagementService.getProfileVideo(verifiedProfile.login.username);
  })
  .then((verfiedProfileVideo) => {
    console.log("verified profile video path: : %j",verfiedProfileVideo);
    return res.status('200').send(verfiedProfileVideo);
  })
  .catch(err => {
    console.error('Err: %s', JSON.stringify(err));
    return res.status(err.code).send(err);
  });
};

/**
 * @api {post} /profiles/jobs Save a new job against a user.
 * @apiName saveJobs
 * @apiGroup Profile
 *
 * @apiParam (credentials) {credentials} credentials Logged in users credentials provided as BasicAuth headers
 * @apiParam (content-type) {content-Type} "Content-Type":"application/json" must be set as request-header.
 * @apiParam (job details) {jobDetails} jobdetails The following JSON must be provided in request body..
 * Example 1: User saved a job
 * {
 *   "job": "c42e1317-e936-4163-8ea7-1514460ca60a",
 *   "status" : "saved"
 * }
 * Example 1: User applied for a job
 * {
 *   "job": "c42e1317-e936-4163-8ea7-1514460ca60a",
 *   "status" : "applied",
 *   "resume" : "491eeac5-f7c5-4c08-a19a-0dc376098732"
 * }
 * @apiSuccess (200) {jobProfile} sends back an object giving job, profile, and date when saved.
 * @apiSuccessExample {json} Success-Response:
 * Example 1: User saved (a.k.a bookmarked) a job
 * HTTP/1.1 200 OK
 * {
 *   "__v": 0,
 *   "_id": "58e60eae72f4c32d85aef4fe",
 *   "uuid": "ee202415-74c9-4311-99a7-fb86602f8eda",
 *   "profile": "738b52c9-3660-4b87-93dc-4e783d3be12b",
 *   "job": "c42e1317-e936-4163-8ea7-1514460ca60a",
 *   "saved" : "2017-04-06T09:47:26.795Z",
 *   "created": {
 *     "timestamp": "2017-04-06T09:47:26.795Z",
 *     "by": "738b52c9-3660-4b87-93dc-4e783d3be12b"
 *   }
 * }
 *
 * Example 2: User applied for a job
 * HTTP/1.1 200 OK
 * {
 *   "__v": 0,
 *   "_id": "58e60eae72f4c32d85aef4fe",
 *   "uuid": "ee202415-74c9-4311-99a7-fb86602f8eda",
 *   "profile": "738b52c9-3660-4b87-93dc-4e783d3be12b",
 *   "job": "c42e1317-e936-4163-8ea7-1514460ca60a",
 *   "saved" : "2017-04-06T09:47:26.795Z",
 *   "applied" : "2017-04-06T09:47:26.795Z",
 *   "created": {
 *     "timestamp": "2017-04-06T09:47:26.795Z",
 *     "by": "738b52c9-3660-4b87-93dc-4e783d3be12b"
 *   }
 * }
 *
 * @apiError (403) {String} AuthenticationError Error code 403 is returned if credentials are incorrect.
 * @apiError (500) {String} InternalServerError Error code 500 is returned in case of some error in the server.
 */
exports.saveJobs = (req, res) => {
  "use strict";

  if (utils.isEmptyObj(req.body)) {
    return res.status(Errors.emptyRequestBody.code).send(Errors.emptyRequestBody).end();
  }
    var savedJobs ;
    // Get the credentials
    var credentials = new BasicAuth(req);  // TODO: Change this to JWT based stateless token based authentication
    var profile;
  Validator.isValidCredentials(req)
  .then(result => { return ProfileManagementService.getProfileByAuthCredentials(req);  })
  .then(reqProfile => {
    profile = reqProfile;
    return ProfileManagementService.saveJobs(credentials.name, req.body); })
  .then(savedJobsArray => {
    savedJobs = savedJobsArray;
    // console.log('savedJobsArray :: %j',savedJobsArray);
    return MailService.getMailTemplate("ApplyJob");
  })
  .then(template => {
    // console.log('template :: %j',template);
    if(req.body.status == "applied"){
      var modifiedText = "Dear "+profile.firstName+" "+profile.lastName+",\n"+template[0].text+"\n\n\n Thanks & Regards \n Red-Gummi.";
      var mailOptions = {
          from: 'Admin<aredgummi@gmail.com>',
          to: 'vempatisurya@gmail.com',
          subject: ''+template[0].subject,
          text: ''+modifiedText
      }
      transporter.sendMail(mailOptions, function (err, res) {
        if(err){
            console.log('Error',err);
        } else {
            console.log('Email Sent');
        }
      })
    }
    return res.status(200).send(savedJobs); })
  .catch(err => {
    console.error('Err: %s', JSON.stringify(err));
    return res.status(err.code).send(err);
  });
};

var _getJobDetails = (jobUuid) => {
  return new Promise(
    (resolve, reject) => {
    //  console.log('applicant details from get applicant details: %j',applicant);
      var finalJobDetailsToBeSent = {};
    JobsManagementService.getJobDetailsByUuid(jobUuid)
    .then(fullJobDetails => {
      finalJobDetailsToBeSent.uuid = fullJobDetails.uuid;
      finalJobDetailsToBeSent.parsedJson = fullJobDetails.parsedJson;

      console.log('job details: : %j',finalJobDetailsToBeSent);
      resolve(finalJobDetailsToBeSent);
    });
  });
};

/**
 * @api {get} /profiles/jobs Get all jobs saved by a user.
 * @apiName getSavedJobs
 * @apiGroup Profile
 *
 * @apiParam (credentials) {credentials} credentials Logged in users credentials provided as
 * BasicAuth headers or Social headers. The request-headers must be shared as provides in below examples.
 * For basic auth: basic authorization credentials (and) "role:recruiter" or "role:jobseeker" or "role:admin"
 * For Social auth: "source:facebook" and "user:email" and "role:recruiter"
 * @apiSuccess (200) {jobs} jobs An array of jobs saved by this profile is returned as JSON.
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * [
 *   {
 *     "_id": "58e3b4013d5a543ca434f476",
 *     "uuid": "c42e1317-e936-4163-8ea7-1514460ca60a",
 *     "name": "Software Developer",
 *     "status": "active",
 *     "parsedJson": {...}
 *   }
 * ]
 * @apiError (403) {String} AuthenticationError Error code 403 is returned if credentials are incorrect.
 * @apiError (500) {String} InternalServerError Error code 500 is returned in case of some error in the server.
 */
exports.getSavedJobs = (req, res) => {
  "use strict";

  var profile = null;
  var jobDetailsDTO = [];
  Validator.isValidCredentials(req)
  .then(result => { return ProfileManagementService.getProfileByAuthCredentials(req); })
  .then((verifiedProfile) => { return ProfileManagementService.getSavedJobs(verifiedProfile.login.username); })
  .then(dto => { return res.status('200').send(dto); })
  .catch(err => {
    console.error('Err: %s', JSON.stringify(err));
    return res.status(err.code).send(err);
  });
};

exports.getProfileDetails = (req, res) => {
  "use strict";

  Validator.isValidCredentials(req)
  .then(result => { return ProfileManagementService.getProfileByAuthCredentials(req); })
  .then(profile => { return res.status('200').send(profile); })
  .catch(err => {
    console.error('Err: %s', JSON.stringify(err));
    return res.status(err.code).send(err);
  });
};

exports.editProfile = function (req, res) {
  "use strict";
  if (!req || !req.body) {
    throw(Errors.emptyRequestBody);
  }
  Validator.isValidCredentials(req)
  .then(result => {
    return ProfileManagementService.getProfileByAuthCredentials(req);
  })
  .then(originalProfile => {
    return ProfileManagementService.editProfile(originalProfile.uuid,req.body);
  })
  .then(modifiedProfile => {
    return res.status('200').send(modifiedProfile);
  })
  .catch(err => {
    console.error('Err: %s', JSON.stringify(err));
    return res.status(err.code).send(err);
  });

};

exports.editDefaultResume = (req, res) => {
  "use strict";
  var profileUuid;
  Validator.isValidCredentials(req)
  .then(result => { return ProfileManagementService.getProfileByAuthCredentials(req); })
  .then(profile => {
    profileUuid = profile.uuid;
    return ResumeManagementService.checkResume(req.params.resumeUuid, profile.uuid); })
  .then(data => { return ProfileManagementService.editDefaultResume(profileUuid, req.params.resumeUuid); })
  .then(updatedProfile => { return res.status(200).send(updatedProfile); })
  .catch(err => {
    console.error('Err: %s', JSON.stringify(err));
    return res.status(err.code).send(err);
  });
};

exports.getDefaultResume = (req, res) => {
  "use strict";
  var defaultResume;
  Validator.isValidCredentials(req)
  .then(result => {
    return ProfileManagementService.getProfileByAuthCredentials(req);
  })
  .then((verifiedProfile) => {
    if(!verifiedProfile.defaultResume || verifiedProfile.defaultResume === undefined || verifiedProfile.defaultResume == ""){
      return defaultResume = {};
    }else{
      return ResumeManagementService.getResumeByUuid(verifiedProfile.defaultResume);
    }
  })
  .then((defaultResumeDetails) => {
    console.log("defaultResume: : %j",defaultResumeDetails);
    return res.status('200').send(defaultResumeDetails);
  })
  .catch(err => {
    console.error('Err: %s', JSON.stringify(err));
    return res.status(err.code).send(err);
  });
};

exports.forgotPassword = function (req, res) {
  "use strict";

   ProfileManagementService.forgotPassword(req.params.username)
  .then(retrievedProfile => {
    console.log('retrievedProfile :: %j',retrievedProfile);
    MailService.getMailTemplate("ForgotPassword")
    .then(template => {
      var modifiedText = "Dear "+retrievedProfile.firstName+",\n\n"+template[0].text+"\n\n Username: "+retrievedProfile.login.username+"\n Password: "+retrievedProfile.login.password+"\n\n\n Thanks & Regards \n Red-Gummi.";
        var mailOptions = {
            from: 'Admin<aredgummi@gmail.com>',
            to: ''+retrievedProfile.email,
            subject: ''+template[0].subject,
            text: ''+modifiedText
        }
        transporter.sendMail(mailOptions, function (err, res) {
          if(err){
              console.log('Error',err);
          } else {
              console.log('Email Sent');
          }
         })
        return res.status('200').send(retrievedProfile);
      })
    })
  .catch(err => {
    console.error('Err: %s', JSON.stringify(err));
    return res.status(err.code).send(err);
  });

};
