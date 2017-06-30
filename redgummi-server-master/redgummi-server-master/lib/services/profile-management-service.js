var BasicAuth = require('basic-auth');
var Job = require('../models/job-model').Job;
var Resume = require('../models/resume-model').Resume;
var Profile = require('../models/profile-model').Profile;
var JobProfile = require('../models/job-profile-model').JobProfile;
var Role = require('../models/role-model').Role;
var Utilities = require('../models/utilities');
var Errors = require('../security/errors');
var JobsManagementService = require('../services/jobs-management-service');
const fs = require('fs');

var getProfileByUuid = (profileUuid) => {
  "use strict";

  return new Promise(
    (resolve, reject) => {
      // Now get the results of the async queries and collect all results into the result DTO
      Profile.findOne({uuid: profileUuid},{"uuid":1,"created":1,"lastModified":1,"status":1,"role":1,
    "login.username":1,"firstName":1,"middleName":1,"lastName":1,"email":1,"phoneNumber":1,"gender":1,"socialProfiles":1,"organization":1}).exec()
      .then(p => {
        if (!p || p === undefined) { throw(Errors.userProfileCouldNotBeFound); }
        resolve(p);
      })
      .catch(err => {
        if (err.code === undefined) { reject({code: '500', reason: err}); }
        reject(err);
      });
  });
};

var getProfileByUser = (userUuid) => {
  "use strict";

  return new Promise(
    (resolve, reject) => {
      // Now get the results of the async queries and collect all results into the result DTO
      Profile.findOne({user: userUuid}).exec()
      .then(p => {
        if (!p || p === undefined) { throw(Errors.userProfileCouldNotBeFound); }
        resolve(p);
      })
      .catch(err => {
        if (err.code === undefined) { reject({code: '500', reason: err}); }
        reject(err);
      });
  });
};

var getProfileByUsername = (username) => {
  "use strict";

  return new Promise(
    (resolve, reject) => {
      Profile.findOne({'login.username': username},{"uuid":1,"created":1,"lastModified":1,"status":1,"role":1,
    "login.username":1,"firstName":1,"middleName":1,"lastName":1,"email":1,"phoneNumber":1,"gender":1,"socialProfiles":1,"organization":1,"defaultResume":1}).exec()
      .then(profile => { resolve(profile); })
      .catch(err => {
        if (err.code === undefined) { reject({code: '500', reason: err}); }
        reject(err);
      });
  });
};

var checkProfileExists = (username) => {
  "use strict";

  return new Promise(
    (resolve, reject) => {
      Profile.findOne({'login.username': username},{"uuid":1}).exec()
      .then(profile => {
        if(!profile || profile === undefined) { resolve(false); }
        else { throw(Errors.duplicateUserName);  }})
      .catch(err => {
        reject(err);
      });
  });
};

var getProfileByAuthCredentials = (req) => {
  "use strict";

  return new Promise(
    (resolve, reject) => {
      // If social credentials are present then try to find profile by social credentials
      // else try to find profile by BasicAuth credentials
      if (req.headers.source && req.headers.source !== undefined && req.headers.user && req.headers.user !== undefined) { // social login
        getProfileByUsername(req.headers.user)
        .then(profile => { resolve(profile); })
        .catch(err => {
          if (err.code === undefined) { reject({code: '500', reason: err}); }
          reject(err);
        });
      }
      else { // BasicAuth login
        var credentials = new BasicAuth(req);
        getProfileByUsername(credentials.name)
        .then(profile => { resolve(profile); })
        .catch(err => {
          if (err.code === undefined) { reject({code: '500', reason: err}); }
          reject(err);
        });
      }
  });
};

var _validate = (profile) => {
  "use strict";

  return new Promise(
    (resolve, reject) => {
      Profile.findOne({'login.username': profile.login.username})
      .then(user => {
        if (user && user !== undefined) { throw(Errors.duplicateUser); }
        return(Role.findOne({uuid: user.role}).exec());
      })
      .then(role => {
        if (!role || role === undefined) { throw(Errors.invalidRoleUuid); }
        resolve(profile);
      })
      .catch(err => {
        if (err.code === undefined) { reject({code: '500', reason: err}); }
        reject(err);
      });
  });
};

var addProfile = (profile) => {
  "use strict";

  return new Promise(
    (resolve, reject) => {
      _validate(profile)
      .then(validProfile => {
        return new Profile({
          uuid: Utilities.getUuid(),
          timestamp: Utilities.getTimestamp(),
          firstName: validProfile.firstName,
          lastName: validProfile.lastName,
          middleName: validProfile.middleName,
          gender: validProfile.gender,
          role: validProfile.role,
          user: validProfile.user,
        }).save();
      })
      .then(result => { resolve(result); })
      .catch(err => {
        if (err.code === undefined) { reject({code: '500', reason: err}); }
        reject(err);
      });
  });
};

var updateProfileImage = (profile, imageFile) => {
  "use strict";

  return new Promise(
    (resolve, reject) => {
      // Make record of change for journaling
      var lastModified = {
        timestamp: Utilities.getTimestamp(),
        by: profile.uuid,
      };
      profile.lastModified.push(lastModified);

      // Read image into a buffer
      var image = {};
      image.fileName = imageFile.originalname;
      image.type = imageFile.mimetype;
      image.file = fs.readFileSync(imageFile.path);
      image.path = imageFile.path;

      var query = {"uuid": profile.uuid};
      var update = {$set:{
        "lastModified": lastModified,
        "image.fileName": imageFile.originalname,
        "image.type": imageFile.mimetype,
        "image.file": image.file,
        "image.imagePath": image.path
      }};
      var options = {new: true};

      Profile.findOneAndUpdate(query, update, options).exec()
      .then(updatedProfile => {
        var updatedProfileDto = {
          uuid: updatedProfile.uuid,
          lastModified: updatedProfile.lastModified,
          status: updatedProfile.status,
          role: updatedProfile.role,
          username: updatedProfile.login.username,
          firstName: updatedProfile.firstName,
          middleName: updatedProfile.firstName,
          lastName: updatedProfile.firstName,
          email: updatedProfile.email,
          phoneNumber: updatedProfile.phoneNumber,
          gender: updatedProfile.gender,
          image: {
            fileName: updatedProfile.image.fileName,
            type: updatedProfile.image.type,
            imagePath: updatedProfile.image.imagePath
          },
        };

        resolve(updatedProfileDto);
      })
      .catch(err => {
        console.log(err);
        if (err.code === undefined) { reject({code: '500', reason: err}); }
        reject(err);
      });
  });
};

var updateProfileVideo = (profile, videoFile) => {
  "use strict";

  return new Promise(
    (resolve, reject) => {
      // Make record of change for journaling
      var lastModified = {
        timestamp: Utilities.getTimestamp(),
        by: profile.uuid,
      };
      profile.lastModified.push(lastModified);

      // Read video into a buffer
      var video = {};
      video.fileName = videoFile.originalname;
      video.type = videoFile.mimetype;
      video.file = fs.readFileSync(videoFile.path);
      video.path = videoFile.path;

      var query = {"uuid": profile.uuid};
      var update = {$set:{
        "lastModified": lastModified,
        "video.fileName": videoFile.originalname,
        "video.type": videoFile.mimetype,
        "video.file": video.file,
        "video.videoPath": video.path
      }};
      var options = {new: true};

      Profile.findOneAndUpdate(query, update, options).exec()
      .then(updatedProfile => {
        var updatedProfileDto = {
          uuid: updatedProfile.uuid,
          lastModified: updatedProfile.lastModified,
          status: updatedProfile.status,
          role: updatedProfile.role,
          username: updatedProfile.login.username,
          firstName: updatedProfile.firstName,
          middleName: updatedProfile.firstName,
          lastName: updatedProfile.firstName,
          email: updatedProfile.email,
          phoneNumber: updatedProfile.phoneNumber,
          gender: updatedProfile.gender,
          video: {
            fileName: updatedProfile.video.fileName,
            type: updatedProfile.video.type,
            videoPath : updatedProfile.video.videoPath
          },
        };

        resolve(updatedProfileDto);
      })
      .catch(err => {
        console.log(err);
        if (err.code === undefined) { reject({code: '500', reason: err}); }
        reject(err);
      });
  });
};

var getProfileVideo = (username) => {
  "use strict";

  return new Promise(
    (resolve, reject) => {
      Profile.findOne({'login.username': username},{"uuid":1,"video.fileName":1,"video.videoPath":1}).exec()
      .then(profile => {
        resolve(profile); })
      .catch(err => {
        if (err.code === undefined) { reject({code: '500', reason: err}); }
        reject(err);
      });
  });
};

var getProfileImage = (username) => {
  "use strict";

  return new Promise(
    (resolve, reject) => {
      Profile.findOne({'login.username': username},{"uuid":1,"image.fileName":1,"image.imagePath":1}).exec()
      .then(profile => {
        resolve(profile); })
      .catch(err => {
        if (err.code === undefined) { reject({code: '500', reason: err}); }
        reject(err);
      });
  });
};

var _createNewJobProfile = (profile, bookmark) => {
  return new Promise(
    (resolve, reject) => {
      var timestamp = Utilities.getTimestamp();
      var model = {
        uuid: Utilities.getUuid(),
        created: { timestamp: timestamp, by: profile.uuid },
        job: bookmark.job,
        profile: profile.uuid
      };

      if (bookmark.status === 'saved') { model.savedOn = timestamp; }
      else if (bookmark.status === 'applied') { model.appliedOn = timestamp; }

      if (bookmark.resume !== null && bookmark.resume !== undefined) {
        model.resume = bookmark.resume;
      }

      new JobProfile(model).save()
      .then(savedJobProfile => { resolve(savedJobProfile); })
      .catch(err => { reject(err); });
  });
};

var _modifyExistingJobProfile = (jp, bookmark) => {
  return new Promise(
    (resolve, reject) => {
      var timestamp = Utilities.getTimestamp();
      var updateRequired = false;
      var updateFields = {};

      if (bookmark.status === 'saved' && (jp.savedOn === null || jp.savedOn === undefined)) {
        updateFields.savedOn = timestamp;
        updateRequired = true;
      }
      else if ((bookmark.status === 'applied')  && (jp.appliedOn === null || jp.appliedOn === undefined)) {
        updateFields.appliedOn = timestamp;
        updateRequired = true;
      }

      if (bookmark.resume !== null && bookmark.resume !== undefined) {
        updateFields.resume = bookmark.resume;
        updateRequired = true;
      }

      if (updateRequired === false) {
        // Nothing to update, simple return given object
        resolve(jp);
      }
      else {
        const condition = {profile:jp.profile, job:jp.job};
        const update = {$set: updateFields};
        const options = {new: true}; // Need updated document immediately after findOneAndUpdate()
        JobProfile.findOneAndUpdate(condition, update, options).exec()
        .then(updatedJp => { resolve(updatedJp); })
        .catch(err => { reject(err); });
      }
  });
};

// Save a job against the logged in user's account
// The user's uuid and job's uuid will be saved together as a new document in job-profile-model
// If a document with the given user's uuid and job's uuid is already present then the existing document
// is updated with the details provided in the request-body JSON.
// If the "status" field in request-body JSON is "saved"
//   then the nearby timestamp is saved into job-profile-model.savedOn.
// If the "status" field in request-body JSON is "applied"
//   then the nearby timestamp is saved into job-profile-model.appliedOn.
var saveJobs = (username, bookmarkDetails) => {
  "use strict";

  return new Promise(
    (resolve, reject) => {
      var profile = null;
      var job = null;
      var status = null;

      // first, get logged in user's uuid
      Profile.findOne({'login.username': username}, {'uuid': 1}).exec()
      .then(p => {
        if (Utilities.isEmptyObj(p)) { throw(Errors.userProfileCouldNotBeFound); }
        profile = p;

        // next, validate that the job is valid
        return Job.findOne({uuid: bookmarkDetails.job}, {uuid: 1});
      })
      .then(j => {
        if (Utilities.isEmptyObj(j)) { throw(Errors.jobNotFound); }
        job = j;
        status = bookmarkDetails.status;

        // next, validate that the resume shared is valid
        // if resume is not at all shared then simply return false here
        if (bookmarkDetails.resume !== null && bookmarkDetails.resume !== undefined) {
          return Resume.findOne({uuid: bookmarkDetails.resume}).exec();
        } else {
          return false;
        }
      })
      .then(r => {
        // if r is false, then do not check for valid resumeNotFound
        // else check that the resume is valid and present in the db
        if (r !== false && Utilities.isEmptyObj(r)) { throw(Errors.resumeNotFound); }

        // next, check if a document already exists in JobProfile
        return JobProfile.findOne({profile: profile.uuid, job: job.uuid}).exec();
      })
      .then(jp => {
        if (Utilities.isEmptyObj(jp)) { return _createNewJobProfile(profile, bookmarkDetails); }
        else { return _modifyExistingJobProfile(jp, bookmarkDetails); }
      })
      .then(result => {
        console.log('result %J' ,result);
        resolve(result); })
      .catch(err => {
        if (err.code === undefined) { reject({code: '500', reason: err}); }
        reject(err);
      });
  });
};

var _getSavedJobsDetails = (savedJobs) => {
  return new Promise(
    (resolve, reject) => {
      var dto = [];
      savedJobs.forEach(job => {
        JobsManagementService.getJobDetailsByUuid(job.job)
        .then(jobDetails => {
          console.log('Job Deatails %j',jobDetails)
          dto.push({job: job.job, savedOn: job.savedOn, appliedOn: job.appliedOn, jobDetails: jobDetails});
          if (dto.length === savedJobs.length) { resolve(dto); }
        })
        .catch(err => { reject(err); });
      });
    });
};

var getSavedJobs = (username) => {
  "use strict";

  return new Promise(
    (resolve, reject) => {
      Profile.findOne({'login.username': username}, {"uuid":1}).exec()
      .then(profile => { return JobProfile.find({profile: profile.uuid}).exec(); })
      .then(savedJobs => { return _getSavedJobsDetails(savedJobs); })
      .then(dto => {
        resolve(dto); })
      .catch(err => {
        if (err.code === undefined) { reject({code: '500', reason: err}); }
        reject(err);
      });
  });
};

var changePassword = (modifiedBy,cp) => {
  "use strict";

  return new Promise(
    (resolve, reject) => {
      var lastModified = {};
      lastModified.timestamp = Utilities.getTimestamp();
      lastModified.by = modifiedBy;

      var query = {"login.username": cp.username};
      var update = {$set:{"login.password":cp.password,"lastModified":lastModified}};

      var retrieveData = {"uuid":1,"created":1,"lastModified":1,"status":1,"role":1,
    "login.username":1,"login.password":1,"firstName":1,"middleName":1,"lastName":1,"email":1,"phoneNumber":1,"gender":1,"socialProfiles":1,"organization":1};

      Profile.findOneAndUpdate(query, update).exec()
      .then(savedProfile => {
        return Profile.find(query,retrieveData);
      }).then(modifedProfile => {
        resolve(modifedProfile);
      })
      .catch(err => {
        if (err.code === undefined) { reject({code: '500', reason: err}); }
        reject(err);
      });
  });
};

var editProfile = (modifiedBy,changeProfile) => {
  "use strict";

  return new Promise(
    (resolve, reject) => {
      var lastModified = {};
      lastModified.timestamp = Utilities.getTimestamp();
      lastModified.by = modifiedBy;

      var query = {"login.username": changeProfile.username};
      var update = {$set:{"firstName":changeProfile.firstName,"middleName":changeProfile.middleName,"lastName":changeProfile.lastName,"email":changeProfile.email,"phoneNumber":changeProfile.phoneNumber,"lastModified":lastModified}};

      var retrieveData = {"uuid":1,"created":1,"lastModified":1,"status":1,"role":1,
    "login.username":1,"login.password":1,"firstName":1,"middleName":1,"lastName":1,"email":1,"phoneNumber":1,"gender":1,"socialProfiles":1,"organization":1};

      Profile.findOneAndUpdate(query, update).exec()
      .then(savedProfile => {
        return Profile.find(query,retrieveData);
      }).then(modifedProfile => {
        resolve(modifedProfile);
      })
      .catch(err => {
        if (err.code === undefined) { reject({code: '500', reason: err}); }
        reject(err);
      });
  });
};

var updatedOrganization = (modifiedBy,org) => {
  "use strict";

  return new Promise(
    (resolve, reject) => {
      var lastModified = {};
      lastModified.timestamp = Utilities.getTimestamp();
      lastModified.by = modifiedBy;

      var query = {"uuid": org.admin};
      var update = {$set:{"organization":org.uuid}};

      var retrieveData = {"uuid":1,"created":1,"lastModified":1,"status":1,"role":1,
    "login.username":1,"firstName":1,"middleName":1,"lastName":1,"email":1,"phoneNumber":1,"gender":1,"socialProfiles":1,"organization":1};

      Profile.findOneAndUpdate(query, update).exec()
      .then(savedProfile => {
        return Profile.find(query,retrieveData);
      }).then(modifedProfile => {
        resolve(modifedProfile);
      })
      .catch(err => {
        if (err.code === undefined) { reject({code: '500', reason: err}); }
        reject(err);
      });
  });
};

var checkRecruiterAdminCount = (userUuid) => {
  "use strict";

  return new Promise(
    (resolve, reject) => {
      Profile.find({'created.by': userUuid},{"uuid":1}).count().exec()
      .then(profile => {
        if(!profile || profile === undefined || profile <= 2 ) { resolve(true); }
        else { reject(Errors.exceedCount);  }
        })
      .catch(err => {
        reject(err);
      });
  });
};

// Temporary function to get total profiles of jobumes without
var getProfileByUuid2 = (profileUuid) => {
  "use strict";

  return new Promise(
    (resolve, reject) => {
      // Now get the results of the async queries and collect all results into the result DTO
      Profile.findOne({uuid: profileUuid},{"uuid":1,"created":1,"lastModified":1,"status":1,"role":1,
    "login.username":1,"firstName":1,"middleName":1,"lastName":1,"email":1,"phoneNumber":1,"gender":1,"socialProfiles":1,"organization":1}).exec()
      .then(p => {
        if (!p || p === undefined) { resolve({}); }
        resolve(p);
      })
      .catch(err => {
        if (err.code === undefined) { reject({code: '500', reason: err}); }
        reject(err);
      });
  });
};

var editDefaultResume = (modifiedBy,resumeUuid) => {
  "use strict";

  return new Promise(
    (resolve, reject) => {
      var lastModified = {};
      lastModified.timestamp = Utilities.getTimestamp();
      lastModified.by = modifiedBy;

      var query = {"uuid": modifiedBy};
      var update = {$set:{"defaultResume":resumeUuid,"lastModified":lastModified}};

      var retrieveData = {"uuid":1,"created":1,"lastModified":1,"status":1,"role":1,"login.username":1,"login.password":1,"firstName":1,"middleName":1,"lastName":1,"email":1,"phoneNumber":1,"gender":1,"socialProfiles":1,"organization":1,"defaultResume":1};

      Profile.findOneAndUpdate(query, update).exec()
      .then(savedProfile => {
        return Profile.find(query,retrieveData);
      }).then(modifedProfile => {
        resolve(modifedProfile);
      })
      .catch(err => {
        if (err.code === undefined) { reject({code: '500', reason: err}); }
        reject(err);
      });
  });
};

var forgotPassword = (username) => {
  "use strict";

  return new Promise(
    (resolve, reject) => {

      var query = {"login.username": username};

      var retrieveData = {"uuid":1,"created":1,"lastModified":1,"status":1,"role":1,
    "login.username":1,"login.password":1,"firstName":1,"middleName":1,"lastName":1,"email":1,"phoneNumber":1,"gender":1,"socialProfiles":1,"organization":1};

      Profile.findOne(query,retrieveData).exec()
      .then(retrievedProfile => {
        resolve(retrievedProfile);
      })
      .catch(err => {
        if (err.code === undefined) { reject({code: '500', reason: err}); }
        reject(err);
      });
  });
};


module.exports = {getProfileByUuid, getProfileByUser, getProfileByUsername, getProfileByAuthCredentials,
  addProfile, changePassword, updateProfileImage, updateProfileVideo, getProfileVideo, getProfileImage,
  saveJobs, getSavedJobs, checkProfileExists, editProfile, updatedOrganization, checkRecruiterAdminCount, getProfileByUuid2, editDefaultResume, forgotPassword};
