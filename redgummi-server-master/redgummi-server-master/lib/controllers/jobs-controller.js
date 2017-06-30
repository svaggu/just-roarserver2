var BasicAuth = require('basic-auth');

var utils = require('../models/utilities');
var Validator = require('../security/validator');
var Errors = require('../security/errors');

var JobsManagementService = require('../services/jobs-management-service');
const ProfileManagementService = require('../services/profile-management-service');
const ResumeManagementService = require('../services/resume-management-service');

var _validate = (req) => {
  return new Promise((resolve, reject) => {
    if (!req || !req.body || req.body === undefined || req.body.length === 0) {
      reject(Errors.emptyRequestBody);
    }
    if (!req || !req.file || req.file === undefined || req.file.length === 0) {
      reject(Errors.noJDFileSentForUpload);
    }

    resolve();
  });
};

/**
 * @api {post} /jobs Add a new job.
 * @apiName addJob
 * @apiGroup Job
 *
 * @apiParam (job) {Job} Give job URL as JSON
 * @apiParam (credentials) {Credentials} Send username and password for authentication as Request-header (Basic-auth). If sending social params then send "source":"facebook" and "user":"user-email-here"
 * @apiParam (content-type) {ContentType} Send "Content-Type: multipart/form-data" as Request-header
 * @apiParam (role) {role} Send "role: jobseeker", or "role: recruiter", or "role: admin" as Request-header
 * @apiParam (organization) {organization} Send "organization: uuid-of-org" as Request-header to attach an org to this JD
 * @apiParam (file) {Request-body} Upload the JD file as "file"
 * @apiParamExample {json} Request-header "Content-Type: multipart/form-data" must be set.  Request-Example:
 * request-headers:
 *   "role: recruiter"
 *   "source: facebook"
 *   "user: abc@gmail.com"
 *   "organization: 10ead161-e778-49e9-abc8-228505162026"
 *   "Content-Type: multipart/form-data"
 *
 * request-headers:
 *   "file: <uploaded-file-contents>"
 *
 * @apiSuccess (201) {Job} job Job object added is sent back.
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 201 Created
 * {
 *   "__v": 0,
 *   "uuid: 65c03e18-4fee-44cd-b3d2-acad224b5648,
 *   "timestamp: 2017-02-23T17:24:30.977Z,
 *   "name": "Software Developer",
 *   "type": "text/plain",
 *   "status": "active",
 *   "file": {
 *     "type": "Buffer",
 *     "data": [ ...]
 *   },
 *   "parsedJson": {...},
 *   "profile": "cc11cb41-b146-4cf8-9343-692419d5ef72",
 *   "organization": "10ead161-e778-49e9-abc8-228505162026",
 *   "_id": "58ecc80b88217a2bd37ec33f"
 * },
 *
 * @apiError (400) {String} BadRequest Error code 400 is returned if the JSON format is incorrect.
 * @apiError (500) {String} InternalServerError Error code 500 is returned in case of some error in the server.
 */
//jshint unused:false
exports.addJob = (req, res) => {

  if (utils.isEmptyObj(req.file)) { return res.status(400).send(Errors.noJDFileSentForUpload).end(); }

  var profile = null;
  Validator.isValidCredentials(req)
  .then(result => {
    var credentials = new BasicAuth(req);
    return ProfileManagementService.getProfileByUsername(credentials.name);
  })
  .then((verifiedProfile) => {
    if (utils.isEmptyObj(verifiedProfile)) { throw(Errors.invalidCredentials); }
    profile = verifiedProfile;
    return _validate(req);
  })
  .then(() => {
    var job = {};
    job.uuid = utils.getUuid();
    job.timestamp  = utils.getTimestamp();
    job.name = req.file.originalname;
    job.type = req.file.mimetype;
    job.status = 'active';
    job.file = '';
    job.parsedJson = '';
    job.updateParsedJson = '';
    job.profile = profile.uuid;
    if (utils.isEmptyObj(req.headers.organization) === false) { job.organization = req.headers.organization; }

    return JobsManagementService.addJob(job, req.file);
  })
  .then(savedJob => {
    console.info('saved job: ', savedJob.name);
    if (utils.isEmptyObj(savedJob)) { throw(Errors.errorWhileSavingJob); }
    return res.status('201').send(savedJob);
  })
  .catch(err => {
    console.error('Err: %s', JSON.stringify(err));
    return res.status(err.code).send(err);
  });
};

/**
 * @api {get} /jobs Get all jobs.
 * @apiName getAllJobs
 * @apiGroup Job
 *
 * @apiParam (credentials) {Credentials} Send username and password for authentication as Request-header (Basic-auth)
 * @apiParam (content-type) {ContentType} Send "Content-type:application/json" as Request-header
 * @apiParamExample {json} Request-header "Content-Type: application/json" must be set.
 *
 * @apiSuccess (201) {Job} job Job object added against the Profile is sent back.
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * [{
 *   "uuid: 65c03e18-4fee-44cd-b3d2-acad224b5648,
 *   "timestamp: 2017-02-23T17:24:30.977Z,
 *   "url": "http://183.82.1.143:9058/jobumes/jobs/Developer.docx",
 *   "name": "Software Developer",
 *   "status": "active",
 *   "parsedJson": {...},
 * },
 * {
 *   "uuid: 65c03e18-4fee-44cd-b3d2-acad224b5648,
 *   "timestamp: 2017-02-23T17:24:30.977Z,
 *   "url": "http://183.82.1.143:9058/jobumes/jobs/Manager.docx",
 *   "name": "Engineering Manager",
 *   "status": "closed",
 *   "parsedJson": {...},
 * }]
 *
 * @apiError (403) {String} AuthenticatioFailed Error code 403 is returned if credentials are incorrect.
 */
//jshint unused:false

// Get All jobs by Recruiter details
exports.getAllJobsByRecruiter = (req, res) => {
  "use strict";

  var finalDTO = [];
  Validator.isValidCredentials(req)
  .then(result => {
    return ProfileManagementService.getProfileByAuthCredentials(req);
  })
  .then(profile => {
    return JobsManagementService.getJobsByProfile(profile.uuid);
  })
  .then(jobs => {
    // console.log('jobs.length : '+jobs.length);
    return JobsManagementService._getJobApplicants(jobs);
  })
  .then(jobsApplicantsDTO => {
    return res.status('200').send(jobsApplicantsDTO);
  })
  .catch(err => {
    console.error('Err: %s', JSON.stringify(err));
    return res.status(err.code).send(err);
  });
};

// Get all jobs
exports.getAllJobs = (req, res) => {
  "use strict";
  // if (!req || !req.body) {
  //   throw(Errors.emptyRequestBody);
  // }
  JobsManagementService.getAllJobs()
  .then(jobs => {
    console.log("jobs count: "+jobs.length);
    return res.status('200').send(jobs);
  })
  .catch(err => {
    console.error('Err: %s', JSON.stringify(err));
    return res.status(err.code).send(err);
  });
};


var _getApplicantDetails = (applicant) => {
  return new Promise(
    (resolve, reject) => {
    //  console.log('applicant details from get applicant details: %j',applicant);
      var finalJobApplicantDetailsToBeSent = {};
  var jobApplicant = {};
    var applicantProfile = {};
    var applicantResume = {};
    ProfileManagementService.getProfileByUuid(applicant.profile)
    .then(applicantProfile => {
      //get applicant resume
      jobApplicant.appProfile = applicantProfile;
      //console.log('job applicant profile: %j',jobApplicant.appProfile);
      return ResumeManagementService.getResumesByProfileAndResumeUuid(applicantProfile.uuid,applicant.resume);
    })
    .then(applicantResume => {
      jobApplicant.appResume = applicantResume;
      // console.log('job Applicant app resume: %j', jobApplicant.appResume);

      finalJobApplicantDetailsToBeSent.profileId = jobApplicant.appProfile.uuid;
      finalJobApplicantDetailsToBeSent.appliedOn = applicant.appliedOn;
      finalJobApplicantDetailsToBeSent.resume = jobApplicant.appResume.resumes;
      finalJobApplicantDetailsToBeSent.userName = jobApplicant.appProfile.login.username;
      finalJobApplicantDetailsToBeSent.mainSkill = jobApplicant.appResume.resumes[0].name;

    //  console.log('job applicant from get applicant details: : %j',finalJobApplicantDetailsToBeSent);
      resolve(finalJobApplicantDetailsToBeSent);
    });
  });
};

// Get all job applicants
exports.getAllJobApplicants = (req, res) => {
  "use strict";
  if (!req || !req.body) { throw(Errors.emptyRequestBody); }
  var jobApplicantsDTO = [];
  console.log('req.headers: %j: ', req.headers);
  console.log('req.params: %j', req.params);
  var obj = {};
  obj.job = req.params.jobUuid;
  Validator.isUserRecruiter(req)
  .then(result => {
    return ProfileManagementService.getProfileByAuthCredentials(req);
  })
  .then(profile => {
    // console.log("obj: "+obj.job);
    return JobsManagementService.getJobsByProfileAndJobUuid(profile.uuid, obj.job); })
  .then(job => {
    if(!job || job === undefined) { throw (Errors.unauthorisedRecruiterAccessToJob); }
    return JobsManagementService.getApplicantsByJob(obj.job);
  })
  .then(applicants => {
    return new Promise(
      (resolve, reject) => {
        var i = 0;
        var m = applicants.length;
    // console.log("applicants count: "+applicants.length);
    applicants.forEach(a => {
      // console.log("applicant: "+a.profile+", applied on: "+a.appliedOn);
        i++;
      _getApplicantDetails(a)
      .then(jobApplicantObj => {
        // console.log("jobApplicant: %j", jobApplicantObj);
        console.log("jobApplicantObj: "+jobApplicantsDTO.length);
        jobApplicantsDTO.push(jobApplicantObj);
        console.log("length: "+jobApplicantsDTO.length);
          if(i === m){
          console.log("jobApplicantsDTO: "+jobApplicantsDTO[0]);
          resolve(jobApplicantsDTO);
        }
        })
      .catch(err => {throw err;});
    });

  });
})
  .then(jobApplicantsDTO => {
    console.log('job applicants dto: %j',jobApplicantsDTO);
    return res.status('200').send(jobApplicantsDTO);
  })
  .catch(err => {
    console.error('Err: %s', JSON.stringify(err));
    return res.status(err.code).send(err);
  });

};

/**
 * @api {put} /jobs Updates a job.
 * @apiName updateJob
 * @apiGroup Job
 *
 * @apiParam (job) {Job} Give a job's updatable details as JSON
 * @apiParam (credentials) {Credentials} Send username and password for authentication as Request-header (Basic-auth). If sending social params then send "source":"facebook" and "user":"user-email-here"
 * @apiParam (role) {role} Send "role: jobseeker", or "role: recruiter", or "role: admin" as Request-header
 * @apiParam (job) {Request-body} The details to be updated will be sent as a JSON, as below
 *   {
 *     "uuid": "338034da-12f9-4352-9fff-854a524f75cd",
 *     "status": "inactive",
 *     profile: {type: String, ref: 'Profile'}, // Profile UUID of the recruiter who posted this JD
 *     organization: {type: String, ref: 'Organization'}
 *   }
 * @apiParamExample {json} Request-header "Content-Type: multipart/form-data" must be set.  Request-Example:
 * request-headers:
 *   "role: recruiter"
 *   "source: facebook"
 *   "user: abc@gmail.com"
 *   "Content-Type: application/json"
 *
 * request-body:
 *   {
 *     "uuid": "338034da-12f9-4352-9fff-854a524f75cd",
 *     "status": "inactive",
 *     "profile": "ba85c9cc-0a25-4f79-a97e-6d9d90839eaa",
 *     "organization": "10ead161-e778-49e9-abc8-228505162026"
 *   }
 *
 * @apiSuccess (200) {Job} job Job object updated is sent back.
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 Created
 * {
 *   "__v": 0,
 *   "uuid": "338034da-12f9-4352-9fff-854a524f75cd",
 *   "timestamp: 2017-02-23T17:24:30.977Z,
 *   "name": "Software Developer",
 *   "type": "text/plain",
 *   "status": "active",
 *   "file": {
 *     "type": "Buffer",
 *     "data": [ ...]
 *   },
 *   "parsedJson": {...},
 *   "profile": "cc11cb41-b146-4cf8-9343-692419d5ef72",
 *   "organization": "10ead161-e778-49e9-abc8-228505162026",
 *   "_id": "58ecc80b88217a2bd37ec33f"
 * },
 *
 * @apiError (400) {String} BadRequest Error code 400 is returned if the JSON format is incorrect.
 * @apiError (500) {String} InternalServerError Error code 500 is returned in case of some error in the server.
 */
//jshint unused:false
exports.updateJob = (req, res) => {

  if (utils.isEmptyObj(req.body)) { return res.status(400).send(Errors.emptyRequestBody).end(); }

  var profile = null;
  Validator.isValidCredentials(req)
  .then(result => {
    var credentials = new BasicAuth(req);
    return ProfileManagementService.getProfileByUsername(credentials.name);
  })
  .then(verifiedProfile => {
    if (utils.isEmptyObj(verifiedProfile)) { throw(Errors.invalidCredentials); }

    var job = {};
    job.uuid = req.body.uuid;
    job.status = req.body.status;
    job.profile = verifiedProfile.uuid;
    job.organization = req.body.organization;
    return JobsManagementService.updateJob(job);
  })
  .then(updatedJob => {
    console.info('updated job: ', updatedJob.name);
    if (utils.isEmptyObj(updatedJob)) { throw(Errors.errorWhileSavingJob); }
    return res.status('200').send(updatedJob);
  })
  .catch(err => {
    console.error('Err: %s', JSON.stringify(err));
    return res.status(err.code).send(err);
  });
};


exports.searchJob = (req, res) => {

 Validator.isValidCredentials(req)
  .then(result => {
    console.log('req %j',req);
    return ProfileManagementService.getProfileByAuthCredentials(req);
  })
  .then(profile => {
    console.log('req %j',req.body);
    return JobsManagementService.searchJob(req.body);
  }).then(jobDto => { return res.status('200').send(jobDto); })
  .catch(err => {
    console.error('Err: %s', JSON.stringify(err));
    return res.status(err.code).send(err);
  });
}

//jshint unused:false
exports.updateJobStatus = (req, res) => {

  if (utils.isEmptyObj(req.body)) { return res.status(400).send(Errors.emptyRequestBody).end(); }

  Validator.isValidCredentials(req)
  .then(result => {
    return ProfileManagementService.getProfileByAuthCredentials(req);
  })
  .then(verifiedProfile => {
    if (utils.isEmptyObj(verifiedProfile)) { throw(Errors.invalidCredentials); }

    var job = {};
    job.uuid = req.body.uuid;
    job.status = req.body.status;
    job.profile = verifiedProfile.uuid;
    job.organization = verifiedProfile.organization;
    return JobsManagementService.updateJob(job);
  })
  .then(updatedJob => {
    console.info('updated job: ', updatedJob.name);
    if (utils.isEmptyObj(updatedJob)) { throw(Errors.errorWhileSavingJob); }
    return res.status('200').send(updatedJob);
  })
  .catch(err => {
    console.error('Err: %s', JSON.stringify(err));
    return res.status(err.code).send(err);
  });
};

//jshint unused:false
exports.editJob = (req, res) => {

  if (utils.isEmptyObj(req.body)) { return res.status(400).send(Errors.emptyRequestBody).end(); }

  Validator.isValidCredentials(req)
  .then(result => {
    var credentials = new BasicAuth(req);
    return ProfileManagementService.getProfileByUsername(credentials.name);
  })
  .then(verifiedProfile => {
    if (utils.isEmptyObj(verifiedProfile)) { throw(Errors.invalidCredentials); }
    return JobsManagementService.checkJob(req.params.jobUuid, verifiedProfile.uuid);
  })
  .then(data => {
    return JobsManagementService.editJob(req.params.jobUuid,req.body); })
  .then(jobDto => { return res.status('200').send(jobDto); })
  .catch(err => {
    console.error('Err: %s', JSON.stringify(err));
    return res.status(err.code).send(err);
  });
};

// Get job details by Uuid
exports.getJobsByUuid = (req, res) => {
  "use strict";
  JobsManagementService.getJobDetailsByUuid(req.params.jobUuid)
  .then(jobDTO => { return res.status('200').send(jobDTO); })
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
    return JobsManagementService.searchKeyword(req.body);
  }).then(jobDto => { return res.status('200').send(jobDto); })
  .catch(err => {
    console.error('Err: %s', JSON.stringify(err));
    return res.status(err.code).send(err);
  });
};
