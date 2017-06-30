const BasicAuth = require('basic-auth');
const Utils = require('../models/utilities');
const Validator = require('../security/validator');
const Errors = require('../security/errors');
const ProfileManagementService = require('../services/profile-management-service');
const ResumeManagementService = require('../services/resume-management-service');

var _validate = (req) => {
  return new Promise((resolve, reject) => {
    if (!req || !req.body || req.body === undefined || req.body.length === 0) {
      reject(Errors.emptyRequestBody);
    }
    if (!req || !req.file || req.file === undefined || req.file.length === 0) {
      reject(Errors.  noResumeFileSentForUpload);
    }

    resolve();
  });
};

/**
 * @api {post} /resumes Add a new resume to the profile.
 * @apiName addResume
 * @apiGroup Resume
 *
 * @apiParam (resume) {Resume} Upload resume file as 'file'
 * @apiParam (credentials) {Credentials} Send username and password for authentication as Request-header (Basic-auth)
 *
 * @apiSuccess (201) {Resume} resume Resume object added against the Profile is sent back.
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 201 Created
 *
 * @apiError (400) {String} BadRequest Error code 400 is returned if the JSON format is incorrect.
 * @apiError (500) {String} InternalServerError Error code 500 is returned in case of some error in the server.
 */
//jshint unused:false
exports.addResume = (req, res) => {
  var profile = null;
  Validator.isValidCredentials(req)
  .then(result => {
    var credentials = new BasicAuth(req);
    return ProfileManagementService.getProfileByUsername(credentials.name);
  })
  .then((verifiedProfile) => {
    // console.log('req.file: %j\n', req.file);
    // console.log('req.body: %j\n', req.body);
    if (!verifiedProfile || verifiedProfile === undefined) {
      throw(Errors.invalidCredentials);
    }
    profile = verifiedProfile;
    return _validate(req);
  })
  .then(() => {
    var resumeDto = {};
    resumeDto.uuid = Utils.getUuid();
    resumeDto.timestamp  = Utils.getTimestamp();
    resumeDto.profile = profile.uuid;
    resumeDto.name = req.file.originalname;
    resumeDto.type = req.file.mimetype;
    resumeDto.status = 'active';

    return ResumeManagementService.addResume(resumeDto, req.file);
  })
  .then(savedResume => {
    if (!savedResume || savedResume === undefined) {
      throw(Errors.errorWhileSavingResume);
    }
    return res.status('201').send(savedResume);
  })
  .catch(err => {
    console.error('Err: %s', JSON.stringify(err));
    return res.status(err.code).send(err);
  });
};

/**
 * @api {get} /resumes Get all resumes for a profile.
 * @apiName getAllResumes
 * @apiGroup Resume
 *
 * @apiParam (credentials) {Credentials} Send username and password for authentication as Request-header (Basic-auth)
 * @apiParam (content-type) {ContentType} Send "Content-type:application/json" as Request-header
 * @apiParamExample {json} Request-header "Content-Type: application/json" must be set.
 *
 * @apiSuccess (201) {Resume} resume Resume object added against the Profile is sent back.
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * [{
 *   "uuid: "26d20448-a4ba-4a09-9ea6-5526e6c50c3d",
 *   "timestamp: {type: Date, required: [true, 'creation timestamp is required']},
 *   "url": "http://183.82.1.143:9058/jobumes/resumes/Arun.docx",
 *   "name": "Arun CV 1",
 *   "status: "active",
 *   "parsedJson: {type: String, required: [true, 'parsed content cannot be null']},
 *   "profile: {type: String, ref: 'Profile'}
 * },
 * {
 *   "uuid: {type: String, required: [true, 'profile uuid is required']},
 *   "timestamp: {type: Date, required: [true, 'creation timestamp is required']},
 *   "url": "http://183.82.1.143:9058/jobumes/resumes/Arun2.docx",
 *   "name": "Arun CV 2",
 *   "status: "active",
 *   "parsedJson: {type: String, required: [true, 'parsed content cannot be null']},
 *   "profile: {type: String, ref: 'Profile'}
 * }]
 *
 * @apiError (403) {String} AuthenticatioFailed Error code 403 is returned if credentials are incorrect.
 */
//jshint unused:false
exports.getResumesByProfile = (req, res) => {
  // if (!req || !req.body) {
  //   throw(Errors.emptyRequestBody);
  // }

  Validator.isValidCredentials(req)
  .then(result => { return ProfileManagementService.getProfileByAuthCredentials(req); })
  .then(profile => { return ResumeManagementService.getResumesByProfile(profile.uuid); })
  .then(resumeDto => { return res.status('200').send(resumeDto); })
  .catch(err => {
    console.error('Err: %s', JSON.stringify(err));
    return res.status(err.code).send(err);
  });
};

/**
 * @api {put} /resumes/coverLetters Updates a resume's cover letter.
 * @apiName addCoverLetterToResume
 * @apiGroup Resume
 *
 * @apiParam (credentials) {Credentials} Send username and password for authentication as Request-header (Basic-auth)
 * @apiParam (content-type) {ContentType} Send "Content-type:application/json" as Request-header
 * @apiParamExample {json} Request-header "Content-Type: application/json" must be set.
 * {
 *   "uuid" : "26d20448-a4ba-4a09-9ea6-5526e6c50c3d",
 *   "coverLetter" : "Dear Hiring Manager,
 *      I feel that my skills and experience are a great fit for this position.
 *      Please feel free to contact me to arrange an interview.
 *      I look forward to learning more about this opportunity. ",
 * }
 * @apiSuccess (200) {Resume} resume Resume object added against the Profile is sent back.
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 *
 * @apiError (403) {String} AuthenticatioFailed Error code 403 is returned if credentials are incorrect.
 */
//jshint unused:false
exports.addCoverLetterToResume = (req, res) => {
  if (!req || !req.body) {
    throw(Errors.emptyRequestBody);
  }

  Validator.isValidCredentials(req)
  .then(result => { return ResumeManagementService.addCoverLetterToResume(req.body); })
  .then(resumeDto => { return res.status('200').send(resumeDto); })
  .catch(err => {
    console.error('Err: %s', JSON.stringify(err));
    return res.status(err.code).send(err);
  });
};

// Get Resumes By Resume Uuid:

exports.getResumeByUuid = (req, res) => {

  Validator.isValidCredentials(req)
  .then(result => { return ResumeManagementService.getResumeByUuid(req.params.resumeUuid); })
  .then(resumeDto => { return res.status('200').send(resumeDto); })
  .catch(err => {
    console.error('Err: %s', JSON.stringify(err));
    return res.status(err.code).send(err);
  });
};
/** Delete Resume functionality*/
exports.deleteResume = (req, res) => {

  Validator.isValidCredentials(req)
  .then(result => {
    console.log('req %j',req);
    return ProfileManagementService.getProfileByAuthCredentials(req);
  })
  .then(profile => {
    console.log('Profile %j',profile);
    return ResumeManagementService.checkResume(req.params.resumeUuid, profile.uuid);
  })
  .then(data => {
    console.log('data %j',data);
    return ResumeManagementService.deleteResume(req.params.resumeUuid); })
  .then(resumeDto => { return res.status('200').send(resumeDto); })
  .catch(err => {
    console.error('Err: %s', JSON.stringify(err));
    return res.status(err.code).send(err);
  });
};

/** Search Resume functionality*/

exports.searchResume = (req, res) => {

  Validator.isValidCredentials(req)
  .then(result => {
    console.log('req %j',req);
    return ProfileManagementService.getProfileByAuthCredentials(req);
  })
  .then(profile => {
    console.log('req %j',req.body);
    return ResumeManagementService.searchResume(req.body);
  }).then(resumeDto => { return res.status('200').send(resumeDto); })
  .catch(err => {
    console.error('Err: %s', JSON.stringify(err));
    return res.status(err.code).send(err);
  });
};

/** Edit Resume functionality*/
exports.editResume = (req, res) => {

  Validator.isValidCredentials(req)
  .then(result => { return ProfileManagementService.getProfileByAuthCredentials(req); })
  .then(profile => { return ResumeManagementService.checkResume(req.params.resumeUuid, profile.uuid); })
  .then(data => { return ResumeManagementService.editResume(req.params.resumeUuid,req.body); })
  .then(resumeDto => { return res.status('200').send(resumeDto); })
  .catch(err => {
    console.error('Err: %s', JSON.stringify(err));
    return res.status(err.code).send(err);
  });
};

//jshint unused:false
exports.addCoverLetter = (req, res) => {
  if (!req || !req.body) {
    throw(Errors.emptyRequestBody);
  }

  Validator.isValidCredentials(req)
  .then(result => { return ProfileManagementService.getProfileByAuthCredentials(req);  })
  .then(profile => { return ResumeManagementService.addCoverLetter(req.body, profile.uuid); })
  .then(coverletterDto => { return res.status('201').send(coverletterDto); })
  .catch(err => {
    console.error('Err: %s', JSON.stringify(err));
    return res.status(err.code).send(err);
  });
};

//jshint unused:false
exports.getCoverLettersByProfile = (req, res) => {
  Validator.isValidCredentials(req)
  .then(result => { return ProfileManagementService.getProfileByAuthCredentials(req);  })
  .then(profile => { return ResumeManagementService.getCoverLettersByProfile(profile.uuid); })
  .then(coverLetters => { return res.status('200').send(coverLetters); })
  .catch(err => {
    console.error('Err: %s', JSON.stringify(err));
    return res.status(err.code).send(err);
  });
};

//jshint unused:false
exports.editCoverLetter = (req, res) => {
  if (!req || !req.body) {
    throw(Errors.emptyRequestBody);
  }

  Validator.isValidCredentials(req)
  .then(result => { return ProfileManagementService.getProfileByAuthCredentials(req);  })
  .then(profile => { return ResumeManagementService.editCoverLetter(req.body, profile.uuid, req.params.cLUuid); })
  .then(coverletterDto => { return res.status('201').send(coverletterDto); })
  .catch(err => {
    console.error('Err: %s', JSON.stringify(err));
    return res.status(err.code).send(err);
  });
};

exports.searchKeyword = (req, res) => {

 Validator.isValidCredentials(req)
  .then(result => {
    console.log('req %j',req);
    return ProfileManagementService.getProfileByAuthCredentials(req);
  })
  .then(profile => {
    console.log('req %j',req.body);
    return ResumeManagementService.searchKeyword(req.body);
  }).then(resumeDto => { return res.status('200').send(resumeDto); })
  .catch(err => {
    console.error('Err: %s', JSON.stringify(err));
    return res.status(err.code).send(err);
  });
};
