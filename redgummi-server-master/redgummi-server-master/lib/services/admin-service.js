var Job = require('../models/job-model').Job;
var CreateAlert = require('../models/create-alert-model').CreateAlert;
var PaymentType = require('../models/payment-type-model').PaymentType;
var Profile = require('../models/profile-model').Profile;
var JobProfile = require('../models/job-profile-model').JobProfile;
var AdminUpload = require('../models/admin-upload-model').AdminUpload;
var Errors = require('../security/errors');
var Utils = require('../models/utilities');
var ProfileManagementService = require('../services/profile-management-service');
const orgManagementService = require('../services/organization-management-service');
var JobsManagementService = require('../services/jobs-management-service');
const fs = require('fs');

//jshint unused:false
var _getQuery = (queryParams) => {
  return new Promise(
    (resolve, reject) => {
      if (queryParams.period < 0) {resolve({});}
      else {
        const periodInMs = Number(queryParams.period)*24*60*60*1000;
        const toDate = new Date();
        const fromDate = new Date(toDate - periodInMs);
        const query = {timestamp : {$lte:toDate, $gte:fromDate}};
        resolve(query);
      }
  });
};

//jshint unused:false
var _getEmployerDetails = (profileUuid) => {
  return new Promise(
    (resolve, reject) => {
      var employerDTO = [];
      ProfileManagementService.getProfileByUuid2(profileUuid)
      .then(empDetails => {
        // console.log('empDetails :: %j',empDetails.organization);
        // resolve(empDetails);
        if(!empDetails.organization || empDetails.organization === undefined || empDetails.organization === '' || empDetails.organization === "undefined"){
          var employer = {};
          employer.employer = empDetails;
          employer.organizationDetails = "";
          employerDTO.push(employer);
          resolve(employerDTO);
        }else{
          orgManagementService.getOrgDetailsByUuid(empDetails.organization)
          .then(orgDetails => {
            var employer = {};
            employer.employer = empDetails;
            employer.organizationDetails = orgDetails;
            employerDTO.push(employer);
            resolve(employerDTO);
           })
          .catch(err => { reject(err); });
        }
       })
       .catch(err => { reject(err); });
  });
};

//jshint unused:false
var _getJobApplicantsCount = (jobUuid) => {
  return new Promise(
    (resolve, reject) => {
        console.log("jobuuid :: "+jobUuid);
       JobsManagementService.getApplicantsByJobForAdmin(jobUuid)
      .then(count => {
         console.log('count :: %j',count);
        if(!count || count === undefined){ resolve("0");}
         resolve(count.length);
       })
       .catch(err => { reject(err); });
  });
};

var _getMoreInfoForJobsCount = (jobs) => {
  return new Promise(
    (resolve, reject) => {
      var returnJobsDTO = {};
      returnJobsDTO.jobsCount = jobs.length;
      returnJobsDTO.details = [];
      var i = 0;
      jobs.forEach(job => {
        // add  employer details
        // add job details
        _getJobApplicantsCount(job.uuid)
        .then(applicantCount =>{
            _getEmployerDetails(job.profile)
          .then(employerObj => {
            i++;
            var obj = {};
            obj.employerDetails = employerObj;
            obj.jobUuid = job.uuid;
            obj.jobApplicantsCount = applicantCount;
            obj.timestamp = job.timestamp;
            obj.name = job.name;
            obj.status = job.status;
            obj.parsedJson = job.parsedJson;
            returnJobsDTO.details.push(obj);
            if (i === returnJobsDTO.jobsCount) { resolve(returnJobsDTO); }
          })
          .catch(err => { reject(err); });
        })
        .catch(err => { reject(err); });

      });
  });
};

var _getJobsCountDto = (moInfoNeeded, jobs) => {
  return new Promise(
    (resolve, reject) => {
      if (jobs.length === 0) { resolve({jobsCount: 0}); }
      else if (moInfoNeeded === false) { resolve({jobsCount: jobs.length}); }
      else { resolve(_getMoreInfoForJobsCount(jobs)); }
  });
};

exports.getAllJobsPosted = (queryParams) => {
  return new Promise(
    (resolve, reject) => {
      _getQuery(queryParams)
      .then(query => {
        console.info('query: %j', query);
        const fieldsNeeded = {"uuid":1,"timestamp":1,"name":1,"status":1,"parsedJson":1,"profile":1};
        return Job.find(query, fieldsNeeded).exec();
      })
      .then(jobs => {
        console.log('jobs %j',jobs);
        return _getJobsCountDto(queryParams.moreInfo, jobs); })
      .then(dto => {
        console.log('dto:: %j',dto);
        resolve(dto); })
      .catch(err => {
        if (err.code === undefined) { reject({code: '500', reason: err}); }
        reject(err);
      });
  });
};

//jshint unused:false
var _getQueryForProfiles = (queryParams,role1,role2) => {
  return new Promise(
    (resolve, reject) => {
      var q = { $or: [ {"role":role1}, { "role": role2 } ] };
      if (queryParams.period < 0) { resolve(q); }
      else {
        const periodInMs = Number(queryParams.period)*24*60*60*1000;
        const toDate = new Date();
        const fromDate = new Date(toDate - periodInMs);
        // const query = { $and : [
        // { "created.timestamp" : {$lte:toDate, $gte:fromDate} },
        // { $or: [{"role":role1},{ "role": role2 } ] }
        // ] };
        const query = {'created.timestamp' : {$lte:toDate, $gte:fromDate},$or: [ {"role":role1}, { "role": role2 } ]};
        resolve(query);
      }
  });
};

//jshint unused:false
var _getQueryForProfilesJS = (queryParams,roleUuid) => {
  return new Promise(
    (resolve, reject) => {
      if (queryParams.period < 0) { resolve({role:roleUuid}); }
      else {
        const periodInMs = Number(queryParams.period)*24*60*60*1000;
        const toDate = new Date();
        const fromDate = new Date(toDate - periodInMs);
        const query = {'created.timestamp' : {$lte:toDate, $gte:fromDate},role:roleUuid};
        resolve(query);
      }
  });
};

//jshint unused:false
var _getMoreInfoForProfilesCount = (profiles) => {
  return new Promise(
    (resolve, reject) => {
      var returnProfilesDTO = {};
      returnProfilesDTO.profilesCount = profiles.length;
      returnProfilesDTO.details = [];
      var i = 0;
      profiles.forEach(profile => {

        if(!profile.organization || profile.organization === undefined || profile.organization === '' || profile.organization === "undefined"){
          i++;
          var obj = {};
          // add  profile details
          obj.profileDetails = profile;
          obj.organizationDetails = "";
          returnProfilesDTO.details.push(obj);
          if (i === returnProfilesDTO.profilesCount) { resolve(returnProfilesDTO); }
        }else{
          orgManagementService.getOrgDetailsByUuid(profile.organization)
          .then(orgDetails => {
            i++;
            var obj = {};
            obj.profileDetails = profile;
            obj.organizationDetails = orgDetails;
            returnProfilesDTO.details.push(obj);
            if (i === returnProfilesDTO.profilesCount) { resolve(returnProfilesDTO); }
          })
          .catch(err => { reject(err); });
        }


      });
  });
};

//jshint unused:false
var _getMoreInfoForJobSeekersCount = (profiles) => {
  return new Promise(
    (resolve, reject) => {
      var returnProfilesDTO = {};
      returnProfilesDTO.profilesCount = profiles.length;
      returnProfilesDTO.details = [];
      var i = 0;
      profiles.forEach(profile => {
        i++;
        var obj = {};
        // add  profile details
        obj.profileDetails = profile;
        returnProfilesDTO.details.push(obj);
        if (i === returnProfilesDTO.profilesCount) { resolve(returnProfilesDTO); }
      });
  });
};

var _getProfilesCountDto = (moInfoNeeded, profiles) => {
  return new Promise(
    (resolve, reject) => {
      if (profiles.length === 0) { resolve({profilesCount: 0}); }
      else if (moInfoNeeded === false) { resolve({profilesCount: profiles.length}); }
      else { resolve(_getMoreInfoForProfilesCount(profiles)); }
  });
};

var _getJobSeekersCountDto = (moInfoNeeded, profiles) => {
  return new Promise(
    (resolve, reject) => {
      if (profiles.length === 0) { resolve({profilesCount: 0}); }
      else if (moInfoNeeded === false) { resolve({profilesCount: profiles.length}); }
      else { resolve(_getMoreInfoForJobSeekersCount(profiles)); }
  });
};

exports.getProfilesByRole = (queryParams,role1,role2) => {
  return new Promise(
    (resolve, reject) => {
    _getQueryForProfiles(queryParams,role1,role2)
    .then(query => {
      console.info('query: %j', query);
      const fieldsNeeded = {"uuid":1,"created":1,"lastModified":1,"status":1,"role":1,
    "login.username":1,"firstName":1,"middleName":1,"lastName":1,"email":1,"phoneNumber":1,"gender":1,"socialProfiles":1,"organization":1};
      return Profile.find(query, fieldsNeeded).exec();
    })
    .then(profiles => {
      console.log('profiles %j',profiles);
      return _getProfilesCountDto(queryParams.moreInfo, profiles); })
    .then(dto => {
      console.log('dto:: %j',dto);
      resolve(dto); })
    .catch(err => {
      if (err.code === undefined) { reject({code: '500', reason: err}); }
      reject(err);
    });
  });
};

exports.getJobSeekersProfiles = (queryParams,roleUuid) => {
  return new Promise(
    (resolve, reject) => {
    _getQueryForProfilesJS(queryParams,roleUuid)
    .then(query => {
      console.info('query: %j', query);
      const fieldsNeeded = {"uuid":1,"created":1,"lastModified":1,"status":1,"role":1,
    "login.username":1,"firstName":1,"middleName":1,"lastName":1,"email":1,"phoneNumber":1,"gender":1,"socialProfiles":1,"organization":1};
      return Profile.find(query, fieldsNeeded).exec();
    })
    .then(profiles => {
      console.log('profiles %j',profiles);
      return _getJobSeekersCountDto(queryParams.moreInfo, profiles); })
    .then(dto => {
      console.log('dto:: %j',dto);
      resolve(dto); })
    .catch(err => {
      if (err.code === undefined) { reject({code: '500', reason: err}); }
      reject(err);
    });
  });
};

//jshint unused:false
var _getJobAlertsQuery = (queryParams) => {
  return new Promise(
    (resolve, reject) => {
      if (queryParams.period < 0) {resolve({});}
      else {
        const periodInMs = Number(queryParams.period)*24*60*60*1000;
        const toDate = new Date();
        const fromDate = new Date(toDate - periodInMs);
        const query = {'created.timestamp' : {$lte:toDate, $gte:fromDate}};
        resolve(query);
      }
  });
};

var _getAlertsCountDto = (moInfoNeeded, alerts) => {
  return new Promise(
    (resolve, reject) => {
      if (alerts.length === 0) { resolve({alertsCount: 0}); }
      else if (moInfoNeeded === false) { resolve({alertsCount: alerts.length}); }
      else { resolve(_getMoreInfoForAlertsCount(alerts)); }
  });
};

var _getMoreInfoForAlertsCount = (alerts) => {
  return new Promise(
    (resolve, reject) => {
      var returnAlertsDTO = {};
      returnAlertsDTO.alertsCount = alerts.length;
      returnAlertsDTO.details = [];
      var i = 0;
      alerts.forEach(alert => {
        _getAlertProfileDetails(alert.profile)
        .then(profileObj => {
          i++;
          var obj = {};
          obj.profileDetails = profileObj;
          obj.alertDetails = alert;
          returnAlertsDTO.details.push(obj);
          if (i === returnAlertsDTO.alertsCount) { resolve(returnAlertsDTO); }
        })
        .catch(err => { reject(err); });
      });
  });
};

//jshint unused:false
var _getAlertProfileDetails = (profileUuid) => {
  return new Promise(
    (resolve, reject) => {
     ProfileManagementService.getProfileByUuid2(profileUuid)
      .then(empDetails => {
        // console.log('empDetails :: %j',empDetails.organization);
        resolve(empDetails);
      })
       .catch(err => { reject(err); });
  });
};

exports.getAllJobsAlerts = (queryParams) => {
  return new Promise(
    (resolve, reject) => {
      _getJobAlertsQuery(queryParams)
      .then(query => {
        console.info('query: %j', query);
        const fieldsNeeded = {"uuid":1,"created":1,"lastName":1,"status":1,"title":1,"profile":1,"email":1};
        return CreateAlert.find(query, fieldsNeeded).exec();
      })
      .then(alerts => {
        console.log('alerts %j',alerts);
        return _getAlertsCountDto(queryParams.moreInfo, alerts); })
      .then(dto => {
        console.log('dto:: %j',dto);
        resolve(dto); })
      .catch(err => {
        if (err.code === undefined) { reject({code: '500', reason: err}); }
        reject(err);
      });
  });
};

var _validateExists = (profileUuid,paymentType) => {
  return new Promise(
    (resolve, reject) => {
      if(!paymentType.name || paymentType.name === undefined) { throw (Errors.emptyName); }
      if(!paymentType.number || paymentType.number === undefined) { throw (Errors.emptyNumber); }


      PaymentType.findOne({"name":paymentType.name}).exec()
      .then(type => {
        if (!type || type === undefined || type === null ) { resolve({exists: false, status: "new" }); }
        else {
          reject(Errors.duplicatePaymentType);
        };

      })
      .catch(err => {
        if (err.code === undefined) { reject({code: '500', reason: err}); }
        reject(err);
      });
  });
};

exports.addPaymentType = (profileUuid,paymentType) => {
  return new Promise(
    (resolve, reject) => {
      _validateExists(profileUuid,paymentType)
      .then(validatedUser => {
        var created = {};
        created.timestamp = Utils.getTimestamp();
        created.by = profileUuid;
        var lastModified = {};
        lastModified.timestamp = Utils.getTimestamp();
        lastModified.by = profileUuid;

          var paymentTypeToSave = new PaymentType({
            uuid: Utils.getUuid(),
            created: created,
            lastModified: lastModified,
            status: "active",
            name: paymentType.name,
            number: paymentType.number
          });

          paymentTypeToSave.save()
          .then(createdPaymentType => {
            resolve(createdPaymentType); })
          .catch(err => {
          if (err.code === undefined) { reject({code: '500', reason: err}); }
            reject(err);
          });
        })
        .catch(err => {
          if (err.code === undefined) { reject({code: '500', reason: err}); }
          reject(err);
        });
  });
};

exports.getPaymentTypes = (profileUuid) => {
  return new Promise(
    (resolve, reject) => {
      PaymentType.find()
       .then(paymentTypes => { resolve(paymentTypes); })
       .catch(err => {
         if (err.code === undefined) {
           reject({code: '500', reason: err});
         }
         reject(err);
       });
  });
};

exports.editPaymentType = (modifiedBy,paymentType) => {
  "use strict";

  return new Promise(
    (resolve, reject) => {
      var lastModified = {};
      lastModified.timestamp = Utils.getTimestamp();
      lastModified.by = modifiedBy;

      var query = {"uuid": paymentType.uuid};
      var update = {$set:{"lastModified":lastModified,"status":paymentType.status,"name":paymentType.name,"number":paymentType.number}};

      var retrieveData = {"uuid":1,"created":1,"lastModified":1,"status":1,"name":1,"number":1};

      PaymentType.findOneAndUpdate(query, update).exec()
      .then(paymentTypes => {
        return PaymentType.find(query,retrieveData);
      }).then(modifiedType => {
        resolve(modifiedType);
      })
      .catch(err => {
        if (err.code === undefined) { reject({code: '500', reason: err}); }
        reject(err);
      });
  });
};


exports.uploadFile = (profileUuid, imageFile) => {
  "use strict";

  return new Promise(
    (resolve, reject) => {
        var adminUploadToSave = new AdminUpload({
          uuid : Utils.getUuid(),
          timestamp : Utils.getTimestamp(),
          name : imageFile.originalname,
          fileUrl : imageFile.path,
          profile : profileUuid,
          type : imageFile.mimetype,
          file : fs.readFileSync(imageFile.path),
          status : "active"
        });
        // console.log('adminUploadToSave :: %j',adminUploadToSave);
      adminUploadToSave.save()
      .then(savedUpload => {
        console.log("upload saved: "+JSON.stringify(savedUpload.uuid));
        resolve(savedUpload);
      })
      .catch(err => {
        if (err.code === undefined) {
          reject({code: '500', reason: err});
        }
        reject(err);
      });
  });
};
