var fs = require('fs');
var querystring = require('querystring');
var request=require("request");
var soap = require('soap');
var Organization = require('../models/organization-model').Organization;
var Job = require('../models/job-model').Job;
var JobProfile = require('../models/job-profile-model').JobProfile;
var ProfileManagementService = require('../services/profile-management-service');
var IndustryTypeManagementService = require('../services/industry-type-management-service');
var FunctionalAreaManagementService = require('../services/functional-area-management-service');
var Profile = require('../models/profile-model').Profile;
const Resume = require('../models/resume-model').Resume;

const Configuration = require('../../configuration').configuration;
const xml2js = require('xml2js');

const utilities = require('../models/utilities');
const errors = require('../security/errors');

// NOTE: DO NOT CHANGE THIS BELOW LoC UNLESS YOU KNOW WHAT YOU ARE DOING.
// If the below line is not given then saving the JD JSON into mongodb fails.
// The error happens especially while parsing skills in the JD.
// Without this line skills in JD XML is parsed into JSON like so:
// <Skills>
//   <Skill type=\"required\"><![CDATA[Advance Java]]></Skill>
//   <Skill type=\"required\"><![CDATA[Swing]]></Skill>
// </Skills>
// is converted to
// "Skills":[{
//  "Skill":[
//    { "_":"Advance Java", "$":{"type":"required"} },
//    { "_":"Swing", "$":{"type":"required"} },
// ]}]
// This creates the following error while saving into MongoDB:
// Error: key $ must not start with '$'
// The below LoC fixes this by setting options into the xml2js parser such that
// "_" is replaced by "name"
// and
// "$" is replaced by "type"
// in the generated JSON. So now, with this change
// <Skills>
//   <Skill type=\"required\"><![CDATA[Advance Java]]></Skill>
//   <Skill type=\"required\"><![CDATA[Swing]]></Skill>
// </Skills>
// is converted to
// "Skills":[{
//  "Skill":[
//    { "name":"Advance Java", "type":{"type":"required"} },
//    { "name":"Swing", "type":{"type":"required"} },
// ]}]
// This JSON gets saved into mongodb properly.
// Personally, I am not sure if this is the correct way to do it but it works.
// So please change this only if you are sure your way moves it to something that works and is also correct.
var xml2jsParser = new xml2js.Parser({attrkey: 'type', charkey: 'name'});

var _parseJobSoap = (jobDtoToSave) => {
  return new Promise(
    (resolve, reject) => {
      soap.createClient(Configuration.jdParser.serviceUrl, (err, client) => {
        if (err) {
          console.error('\nerror creating SOA client: ', err);
          reject(err);
        }
        console.info('\ncreated RChilli client for URL: %s', Configuration.jdParser.serviceUrl);
        // console.info('\njobDtoToSave.file: %s', jobDtoToSave.file);
        // console.info('\nclient: %s', util.inspect(client));

          var options = {
            fileData: jobDtoToSave.file,
            fileName: jobDtoToSave.name,
            userKey: Configuration.jdParser.userKey,
            version: Configuration.jdParser.version,
            subUserId: Configuration.jdParser.subUserId
          };
          client.ParseJD(options, (err, res) => {
            if (err) {
              reject(err);
            }

            var xml = res.return;
            if (/error/.test(xml) === true) {
              reject(xml);
            }
            else {
              resolve(xml);
            }
          }, { timeout: Configuration.jdParser.timeout }); // client.parseJob(...
      }); // soap.createClient(Configuration.jobParser.serviceUrl, (err, client) => {...
  }); // return new Promise( (reject, resolve) => { ...
};

//jshint unused:false
var _parseJDFileContents = (metadata) => {
  return new Promise(
    (resolve, reject) => {
       var data = fs.readFileSync(metadata.path);
       var contents = new Buffer(data).toString('base64');
       resolve(contents);
  });
};

var _convertXmlToJson = (xml) => {
  return new Promise(
    (resolve, reject) => {
      xml2jsParser.parseString(xml, (err, json) => {
        if (err && err !== undefined) {
          reject(err);
        }
        else {
          resolve(json);
        }
      });
  });
};

exports.addJob = (jobDto, uploadedJDFileMetadata) => {
  return new Promise(
    (resolve, reject) => {
      var jobDtoToSave = jobDto;
      _parseJDFileContents(uploadedJDFileMetadata)
      .then(jdFileData => {
        jobDtoToSave.file = jdFileData;
        return _parseJobSoap(jobDtoToSave);
      })
      .then(parsedJobXml => {
        if (/error/.test(parsedJobXml) === true) {
          throw(parsedJobXml);
        }
        return _convertXmlToJson(parsedJobXml);
      })
      .then(parsedJobJson => {
        jobDtoToSave.parsedJson = parsedJobJson;
        jobDtoToSave.updateParsedJson = parsedJobJson;
        var jobObj = new Job(jobDtoToSave);
        return jobObj.save();
      })
      .then(savedJob => { resolve(savedJob); })
      .catch(err => {
        if (err.code === undefined) {
          reject({code: '500', reason: err.toString()});
        }
        reject(err);
      });
  });
};

var _getProfileDetails = (profileUuid) =>{
  return new Promise(
    (resolve, reject) => {
      Profile.findOne({uuid: profileUuid},{"uuid":1,"created":1,"lastModified":1,"status":1,"role":1,
    "login.username":1,"firstName":1,"middleName":1,"lastName":1,"email":1,"phoneNumber":1,"gender":1,"socialProfiles":1}).exec()
      .then(p => {
        if (!p || p === undefined) { throw(Errors.userProfileCouldNotBeFound); }
        resolve(p);
      })
      .catch(err => {
        if (err.code === undefined) { reject({code: '500', reason: err}); }
        reject(err);
      });
    });
}

var _getResumeDetails = (resumeUuid) =>{
  return new Promise(
    (resolve, reject) => {
      Resume.findOne({uuid: resumeUuid},{"uuid":1,"timestamp":1,"name":1,"status":1,"parsedJson":1,"profile":1,"updateParsedJson":1}).exec()
      .then(resume => {
        if (!resume || resume === undefined) { resolve({}); }
        var resumeDTO = {};
        resumeDTO.resumeUuid = resume.uuid;
        resumeDTO.status = resume.status;
        resumeDTO.skills = resume.parsedJson.ResumeParserData.Skills;
        resumeDTO.location = resume.parsedJson.ResumeParserData.City;
        resumeDTO.preferredLocation = resume.parsedJson.ResumeParserData.PreferredLocation;
        resolve(resumeDTO);
      })
      .catch(err => {
        if (err.code === undefined) { reject({code: '500', reason: err}); }
        reject(err);
      });
    });
}

var _getApplicantsDetails = (jobUuid) => {
  return new Promise(
    (resolve, reject) => {
      var finalDTO = [];

      JobProfile.find({"job": jobUuid},{"uuid":1,"job":1,"profile":1,"resume":1,"appliedOn":1,"savedOn":1}).exec()
      .then(jobProfiles =>{

        if(jobProfiles.length == 0){ resolve ([]); }
        else{
            var k = 0;
            var n = jobProfiles.length;
            jobProfiles.forEach(jp => {

              _getProfileDetails(jp.profile)
              .then(p => {
                  _getResumeDetails(jp.resume)
                  .then(res => {
                      k++;
                      var eachJobApplicantDetails = {};
                      eachJobApplicantDetails.jobApplicantDetails = p ;
                      eachJobApplicantDetails.resume = res;
                      eachJobApplicantDetails.appliedOn = jp.appliedOn;
                      eachJobApplicantDetails.jobUuid = jobUuid;
                      finalDTO.push(eachJobApplicantDetails);
                      if(k === n){
                        var jobApplicantsCount = {};
                        jobApplicantsCount.applicantsCount = n;
                        finalDTO.push(jobApplicantsCount);
                        resolve(finalDTO);
                      }
                  })
                  .catch(err => {throw err;});
              })
              .catch(err => {throw err;});
            })
          }
      })
      .catch(err => {throw err;});
    });
};

exports._getJobApplicants = (jobs) => {
  "use strict";
  return new Promise(
    (resolve, reject) => {

      var applicantsDTO = [];
      if(jobs.length == 0){
          var applicantsDetails = {};
          applicantsDetails.jobDetails = {};
          applicantsDetails.jobProfiles = {};
          applicantsDTO.push(applicantsDetails);
          resolve(applicantsDTO);
       }
      var i = 0;
      var m = jobs.length;
      jobs.forEach(ja => {
          _getApplicantsDetails(ja.uuid)
        .then(applicants => {
            i++;
            // console.log('applications :: %j',applicants);
            var applicantsDetails = {};
            if(applicants.length !== 0){
              applicantsDetails.jobDetails = ja;
              applicantsDetails.jobProfiles = applicants;
              applicantsDTO.push(applicantsDetails);
            }else{
              applicantsDetails.jobDetails = ja;
              applicantsDetails.jobProfiles = {};
              applicantsDTO.push(applicantsDetails);
            }

            if(i === m){
              // console.log('applicant :: %j',applicantsDTO);
              resolve(applicantsDTO);
            }
        })
        .catch(err => {throw err;});
      })
  });
};

exports.getJobsByProfile = (profileUuid) => {
  return new Promise(
    (resolve, reject) => {
      Job.find({profile: profileUuid},{"uuid":1,"timestamp":1,"name":1,"status":1,"parsedJson":1,"profile":1,"organization":1,"updateParsedJson":1}).exec()
       .then(jobs => {
         if (!jobs || jobs === undefined || jobs.length == 0) { resolve([]); }
         resolve(jobs);
      })
      .catch(err => {
         if (err.code === undefined) {
           reject({code: '500', reason: err});
         }
         reject(err);
       });
  });
};


exports.getAllJobs = () => {
  return new Promise(
    (resolve, reject) => {
      Job.find().exec()
       .then(jobs => { resolve(jobs); })
       .catch(err => {
         if (err.code === undefined) {
           reject({code: '500', reason: err});
         }
         reject(err);
       });
  });
};

exports.getApplicantsByJob = (jobUuid) => {
  return new Promise(
    (resolve, reject) => {
      JobProfile.find({job:jobUuid}).exec()
       .then(jobApplicationDetails => { resolve(jobApplicationDetails.applicants); })
       .catch(err => {
         if (err.code === undefined) { reject({code: '500', reason: err}); }
         reject(err);
       });
  });
};

exports.getApplicantsByJobForAdmin = (jobUuid) => {
  return new Promise(
    (resolve, reject) => {
      JobProfile.find({job:jobUuid}).exec()
       .then(jobApplicationDetails => { resolve(jobApplicationDetails); })
       .catch(err => {
         if (err.code === undefined) { reject({code: '500', reason: err}); }
         reject(err);
       });
  });
};

exports.getJobsByProfileAndJobUuid = (profileUuid, jobUuid) => {
  return new Promise(
    (resolve, reject) => {
      JobProfile.find({profile: profileUuid, job:jobUuid}).exec()
       .then(jobs => {
         console.log('jobs: %j', jobs);
         resolve(jobs); })
       .catch(err => {
         if (err.code === undefined) {
           reject({code: '500', reason: err});
         }
         reject(err);
       });
  });
};

exports.getJobDetailsByUuid = (jobUuid) => {
  return new Promise(
    (resolve, reject) => {
      Job.findOne({uuid: jobUuid},{"uuid":1,"name":1,"status":1,"parsedJson":1,"updateParsedJson":1}).exec()
       .then(job => {
         var jobToBeSent = job;
        //  console.log('job :: %j',job);
         if(!job.updateParsedJson || job.updateParsedJson === undefined){
           resolve(jobToBeSent);
         }else{

           IndustryTypeManagementService.getIndustryTypeByUuid(job.updateParsedJson.JobData.IndustryType)
           .then(industryType => {
             if(industryType === ""){
               jobToBeSent.updateParsedJson.JobData.IndustryTypeName = "";
             }else{
               jobToBeSent.updateParsedJson.JobData.IndustryTypeName = industryType.name;
             }
             return FunctionalAreaManagementService.getFunctionalAreaByUuid(job.updateParsedJson.JobData.FunctionalArea);
           })
           .then(functionalArea => {
             if(functionalArea == ""){
               jobToBeSent.updateParsedJson.JobData.FunctionalAreaName = "";
               resolve(jobToBeSent);
             }else{
               jobToBeSent.updateParsedJson.JobData.FunctionalAreaName = functionalArea.name;
               resolve(jobToBeSent);
             }
           })
            .catch(err => { reject(err); });
         }
         })
       .catch(err => {
         if (err.code === undefined) {
           reject({code: '500', reason: err});
         }
         reject(err);
       });
  });
};

// the below function checks if the provided status string is valid.
// status is considered valid if it is one of (active|inactive|hold|closed)
// if status is sent empty then "false" is returned
// if status is not empty and valid then "true" is returned
// if status is not empty and invalid then an error code is returned
function _isJobStatusPresentAndValid(status) {
  return new Promise(
    (resolve, reject) => {
      if (status === null || status === undefined) { resolve(false); }

      var statusFound = false;
      ["active", "inactive", "hold", "closed"].forEach(s => {
        if (s === status) {
          statusFound = true;
          resolve(true);
        }
      });
      if (!statusFound) { reject(errors.incorrectJobStatus); }
  });
}

// the below function checks if the provided organization uuid is valid.
// And organiation is considered valid if it is present in the "organizations" collection
// if org is sent empty then "false" is returned
// if org is not empty and is a valid uuid then "true" is returned
// if org is not empty and is an invalid uuid then an error code is returned
function _isOrganizationPresentAndValid(org) {
  return new Promise(
    (resolve, reject) => {
      if (utilities.isEmptyObj(org) === true) { resolve(false); }

      Organization.findOne({uuid: org}).exec()
      .then(foundOrg => {
        if (utilities.isEmptyObj(foundOrg) === false) { resolve(true); }
        else { throw(errors.orgNotFound); }
      })
      .catch(err => { reject(err); });
  });
}

exports.updateJob = (job) => {
  return new Promise(
    (resolve, reject) => {

      var fieldsToUpdate = {};
      var jobToUpdate = null;

      Job.findOne({uuid: job.uuid}).exec() // First, ensure that job is valid
      .then(foundJob => {
        if (utilities.isEmptyObj(foundJob)) { throw(errors.jobNotFound); }
        jobToUpdate = foundJob;
        return _isOrganizationPresentAndValid(job.organization);
      })
      .then(isOrganizationPresentAndValid => { // next, ensure that org is valid, if present
        if (isOrganizationPresentAndValid === true) { fieldsToUpdate.organization = job.organization; }
        return _isJobStatusPresentAndValid(job.status);
      })
      .then(isJobStatusPresentAndValid => { // next, ensure that job status is valid, if present
        if (isJobStatusPresentAndValid === true) { fieldsToUpdate.status = job.status; }
        var lastModified = [];
        if (utilities.isEmptyObj(jobToUpdate.lastModified) === false) { lastModified = jobToUpdate.lastModified; }

        // finally, add updated timestamp
        var latestTimeStamp = {};
        latestTimeStamp.timestamp = utilities.getTimestamp();
        latestTimeStamp.by = job.profile;
        lastModified.push(latestTimeStamp);
        fieldsToUpdate.lastModified = lastModified;

        // and then, update colelction with new details
        const query = {uuid: job.uuid};
        const update = {$set: fieldsToUpdate};
        const options = {new: true};

        return Job.findOneAndUpdate(query, update, options).exec();
      })
      .then(updatedJob => { resolve(updatedJob); })
      .catch(err => {
        if (err.code === undefined) { reject({code: '500', reason: err.toString()}); }
        reject(err);
      });
  });
};

exports.searchJob = (job) => {
  return new Promise(
    (resolve, reject) => {

      var query ={"name": job.name};
      Job.find(query).exec() // First, ensure that job is valid
      .then(searchJob => {
        resolve(searchJob);
      })
      .catch(err => {
        if (err.code === undefined) { reject({code: '500', reason: err.toString()}); }
        reject(err);
      });
  });
};

exports.checkJob = (jobUuid,profileUuid) => {
  return new Promise(
    (resolve, reject) => {
        var query ={"uuid": jobUuid,"profile":profileUuid};

      Job.findOne(query).exec()
      .then(res=> {
        console.log("res %j",res);
         if (res.length===0) {throw (Errors.unauthorisedUserForResume); }
         resolve(res);
      })
      .catch(err => {

        reject(err);
      });
  });
};

/**Start Edit Functionality */
exports.editJob = (jobUuid,jobJson) => {
  return new Promise(
    (resolve, reject) => {
      var query ={uuid: jobUuid};
      Job.findOne(query).exec()
      .then(exists => {
        // console.log('exists :: %j',exists);
        if(!exists.updateParsedJson || exists.updateParsedJson === undefined){
          // updateParsedJson is empty

          var updateParsedJson = {};
          updateParsedJson.JobData = {};
          updateParsedJson.JobData.JobProfile = jobJson.JobProfile;
          updateParsedJson.JobData.Organization = jobJson.Organization;
          updateParsedJson.JobData.ContactEmail = jobJson.ContactEmail;
          updateParsedJson.JobData.JobDescription = jobJson.JobDescription;
          updateParsedJson.JobData.NoOfOpenings = jobJson.NoOfOpenings;
          updateParsedJson.JobData.IndustryType = jobJson.IndustryType;
          updateParsedJson.JobData.FunctionalArea = jobJson.FunctionalArea;
          updateParsedJson.JobData.Skills = jobJson.Skills;
          updateParsedJson.JobData.JobType = jobJson.JobType;
          updateParsedJson.JobData.SalaryOffered = jobJson.SalaryOffered;
          updateParsedJson.JobData.Qualifications = jobJson.Qualifications;
          updateParsedJson.JobData.HotCool = jobJson.HotCool;
          updateParsedJson.JobData.Notes = jobJson.Notes;

          var update = {$set:{"updateParsedJson":updateParsedJson}};

                console.log('update :: %j',update);
          Job.findOneAndUpdate(query, update).exec()
          .then(res=> {
            resolve({code:200,'Response':'Done'});
          })
          .catch(err => {
            if (err.code === undefined) { reject({code: '500', reason: err}); }
            reject(err);
          });
        }else{
          // updateParsedJson is not empty

          var update = {$set:{"updateParsedJson.JobData.JobProfile":jobJson.JobProfile,
                              "updateParsedJson.JobData.Organization":jobJson.Organization,
                              "updateParsedJson.JobData.ContactEmail":jobJson.ContactEmail,
                              "updateParsedJson.JobData.JobDescription":jobJson.JobDescription,
                              "updateParsedJson.JobData.NoOfOpenings":jobJson.NoOfOpenings,
                              "updateParsedJson.JobData.IndustryType":jobJson.IndustryType,
                              "updateParsedJson.JobData.FunctionalArea":jobJson.FunctionalArea,
                              "updateParsedJson.JobData.JobType":jobJson.JobType,
                              "updateParsedJson.JobData.SalaryOffered":jobJson.SalaryOffered,
                              "updateParsedJson.JobData.Qualifications":jobJson.Qualifications,
                              "updateParsedJson.JobData.Skills":jobJson.Skills,
                              "updateParsedJson.JobData.HotCool":jobJson.HotCool,
                              "updateParsedJson.JobData.Notes":jobJson.Notes}};

          console.log('update :: %j',update);
          Job.findOneAndUpdate(query, update).exec()
          .then(res=> {
            resolve({code:200,'Response':'Done'});
          })
          .catch(err => {
            if (err.code === undefined) { reject({code: '500', reason: err}); }
            reject(err);
          });
        }
      })
      .catch(err => {throw err;});

  });
};

exports.searchKeyword = (job) => {
  return new Promise(
    (resolve, reject) => {
      var uname = "elastic";
      var pword = "uajtZQrNPCDIMM1CkWyCeP60";
      var keyword = job.keyword;
             // Set the headers
          var headers = {'Accept':'application/json','Content-Type': 'application/json; charset=UTF-8;','Authorization': 'Basic ' + new Buffer(uname + ':' + pword).toString('base64')};

          // Configure the request
          var options = {
              url: 'https://0b0d431e9efd3e19da228bd1b080f332.us-east-1.aws.found.io:9243/resumes/_search',
              method: 'POST',
              headers: headers,
              body: {
                    "_source":["uuid","status", "name","parsedJson","updateParsedJson"],
                        "query": {
                            "bool": {
                                "must": [
                                    {
                                        "match" : {
                          "parsedJson.ResumeParserData.HtmlResume" : keyword
                         }

                                    },
                                    {
                                        "match" : {
                          "status" : "active"
                         }

                                    }

                                ]
                            }
                        }
                    },
                json: true
          };
          console.log('options :: %j',options);
          // Start the request
          request(options, function (error, response, body) {
               console.log('response headers :: %j',response.headers);
              if (!error && response.statusCode == 200) {
                  // Print out the response body
                console.log(body);
                  resolve(body);
              }else{
                console.log('error :: %j',error);
                console.log('body :: %j',body);
                resolve(body);
              }
          });
// Trial 1
  });
};
