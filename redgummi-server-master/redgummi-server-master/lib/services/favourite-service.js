var Favourite = require('../models/favourite-model').Favourite;
var Profile = require('../models/profile-model').Profile;
const Resume = require('../models/resume-model').Resume;
var Errors = require('../security/errors');
const Utils = require('../models/utilities');

var _validateExists = (recruiterUuid,fav) => {
  return new Promise(
    (resolve, reject) => {
      if(!fav.jobseeker || fav.jobseeker === undefined) { throw (Errors.emptyUserName); }
      if(!fav.status || fav.status === undefined) { throw (Errors.emptyStatus); }
      if(!fav.resumeUuid || fav.resumeUuid === undefined) { throw (Errors.resumeNotFound); }

      Favourite.findOne({"recruiter": recruiterUuid,"jobseeker":fav.jobseeker}).exec()
      .then(user => {
        if (!user || user === undefined || user === null ) { resolve({exists: false, status: "new" }); }
        else {
          if(user.status === "favourite"){ reject(Errors.addedFavourite); }
          else{ resolve({exists: true, status: user.status }); }
        };

      })
      .catch(err => {
        if (err.code === undefined) { reject({code: '500', reason: err}); }
        reject(err);
      });
  });
};

exports.addFavourite = (recruiterUuid,fav) => {
  return new Promise(
    (resolve, reject) => {
      _validateExists(recruiterUuid,fav)
      .then(validatedUser => {
        console.log('validatedUser :: %j',validatedUser);
        if(validatedUser.exists === true && validatedUser.status === "non-favourite"){
          var lastModified = {};
          lastModified.timestamp = Utils.getTimestamp();
          lastModified.by = recruiterUuid;

          var query = {"recruiter": recruiterUuid,"jobseeker":fav.jobseeker};
          var update = {$set:{"status":"favourite","lastModified":lastModified,"resume":fav.resumeUuid}};
          var retrieveData = {"uuid":1,"recruiter":1,"status":1,"jobseeker":1,"timestamp":1,"lastModified":1,"resume":1};

          Favourite.findOneAndUpdate(query, update).exec()
          .then(savedProfile => {
            return Favourite.find(query,retrieveData);
          }).then(modifedProfile => {
            resolve(modifedProfile);
          })
          .catch(err => {
            if (err.code === undefined) { reject({code: '500', reason: err}); }
            reject(err);
          });
        }else{
          var favouriteToSave = new Favourite({
            uuid: Utils.getUuid(),
            timestamp: Utils.getTimestamp(),
            lastModified: [{ timestamp: Utils.getTimestamp(), by: recruiterUuid }],
            status: fav.status,
            recruiter: recruiterUuid,
            jobseeker: fav.jobseeker,
            resume : fav.resumeUuid
          });

          favouriteToSave.save()
          .then(savedFavourite => {
            resolve(savedFavourite); })
          .catch(err => {
          if (err.code === undefined) { reject({code: '500', reason: err}); }
            reject(err);
          });
        }

      })
      .catch(err => {
        if (err.code === undefined) { reject({code: '500', reason: err}); }
        reject(err);
      });

  });
};

var _getResumeDetails = (resumeUuid) =>{
  return new Promise(
    (resolve, reject) => {
      Resume.findOne({uuid: resumeUuid},{"uuid":1,"timestamp":1,"name":1,"status":1,"parsedJson":1,"profile":1}).exec()
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
exports.listFavourites = (profileUuid) => {
  return new Promise(
    (resolve, reject) => {
      var favDTO = [];
      Favourite.find({"recruiter":profileUuid,"status":"favourite"},{"uuid":1,"recruiter":1,"status":1,"jobseeker":1,"timestamp":1,"lastModified":1,"resume":1})
       .then(favs => { resolve(favs); })
       .catch(err => {
         if (err.code === undefined) {
           reject({code: '500', reason: err});
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
};

exports.getFavApplicants = (jobSeekersList) => {
  return new Promise(
    (resolve, reject) => {

    var finalDTO = [];
    if(jobSeekersList.length == 0){ resolve([]); }
    var i = 0;
    var m = jobSeekersList.length;
    jobSeekersList.forEach(jp => {
      _getProfileDetails(jp.jobseeker)
      .then(p => {
        _getResumeDetails(jp.resume)
        .then(res => {
          i++;
          var eachJobApplicantDetails = {};
          eachJobApplicantDetails.jobApplicantDetails = p ;
          eachJobApplicantDetails.resumeDetails = res;
          finalDTO.push(eachJobApplicantDetails);
          if(i === m){
            resolve(finalDTO);
          }
        })
        .catch(err => {throw err;});
      })
      .catch(err => {throw err;});
    });
  });
};

exports.removeFavourite = (recruiterUuid,fav) => {
  return new Promise(
    (resolve, reject) => {

            var lastModified = {};
            lastModified.timestamp = Utils.getTimestamp();
            lastModified.by = recruiterUuid;

            var query = {"recruiter": recruiterUuid,"jobseeker":fav.jobseeker};
            var update = {$set:{"status":"non-favourite","lastModified":lastModified}};
            var retrieveData = {"uuid":1,"recruiter":1,"status":1,"jobseeker":1,"timestamp":1,"lastModified":1};

            Favourite.findOneAndUpdate(query, update).exec()
            .then(savedProfile => {
              return Favourite.find(query,retrieveData);
            }).then(modifedProfile => {
              resolve(modifedProfile);
            })
            .catch(err => {
              if (err.code === undefined) { reject({code: '500', reason: err}); }
              reject(err);
            });

  });
};
