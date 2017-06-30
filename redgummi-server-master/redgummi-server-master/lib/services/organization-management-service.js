var Organization = require('../models/organization-model').Organization;
var Errors = require('../security/errors');
const Utilities = require('../models/utilities');
const fs = require('fs');

exports.getAllOrganizations = () => {
  return new Promise(
    (resolve, reject) => {
      Organization.find({},{"uuid":1,"name":1,"status":1,"description":1,"address":1,"internet":1,
    "email":1,"phone":1,"socialProfile":1,"logo.fileName":1,"logo.type":1,"logo.uri":1})
       .then(orgs => { resolve(orgs); })
       .catch(err => {
         if (err.code === undefined) {
           reject({code: '500', reason: err});
         }
         reject(err);
       });
  });
};

exports.addNewOrganization = (org) => {
  return new Promise(
    (resolve, reject) => {
      var orgToSave = new Organization(org);
      orgToSave.save()
      .then(savedOrg => { resolve(savedOrg); })
      .catch(err => {
        if (err.code === undefined) {
          reject({code: '500', reason: err});
        }
        reject(err);
      });
  });
};

exports.updateLogo = (profile,orgUuid, imageFile) => {
  "use strict";

  return new Promise(
    (resolve, reject) => {
      // Make record of change for journaling
      var lastModified = {
        timestamp: Utilities.getTimestamp(),
        by: profile.uuid,
      };
      // Organization.lastModified.push(lastModified);
      console.log('lastModified:: %j',lastModified);
      // Read image into a buffer
      var image = {};
      image.fileName = imageFile.originalname;
      image.type = imageFile.mimetype;
      image.file = fs.readFileSync(imageFile.path);
      console.log('imageFile path :: %j',imageFile.path);
      // var path1 = imageFile.path;
      // var path2 = path1.substring(12,path1.length-1);
      // console.log("path2 :: "+path2);
      //  image.path = "http://183.82.1.143:9060/"+path2;
       image.path = imageFile.path;
      console.log('image path :: %j',image.path);
      var query = {"uuid": orgUuid};
      var update = {$set:{
        "lastModified": lastModified,
        "logo.fileName": imageFile.originalname,
        "logo.type": imageFile.mimetype,
        "logo.file": image.file,
        "logo.uri": image.path
      }};
      var options = {new: true};

      Organization.findOneAndUpdate(query, update, options).exec()
      .then(updatedOrganization => {
        var updatedOrgDto = {
          uuid: updatedOrganization.uuid,
          lastModified: updatedOrganization.lastModified,
          status: updatedOrganization.status,
          name: updatedOrganization.name,
          description: updatedOrganization.description,
          address: updatedOrganization.address,
          email: updatedOrganization.email,
          phone: updatedOrganization.phone,
          logo: {
            fileName: updatedOrganization.logo.fileName,
            type: updatedOrganization.logo.type,
            uri: updatedOrganization.logo.uri
          },
        };

        resolve(updatedOrgDto);
      })
      .catch(err => {
        console.log(err);
        if (err.code === undefined) { reject({code: '500', reason: err}); }
        reject(err);
      });
  });
};

exports.getOrganizationsByProfile = (profile) => {
  return new Promise(
    (resolve, reject) => {
      var orgDTO = [];
      var query;
      if(profile.organization === "" || profile.organization === undefined){
        query = {"admin":profile.uuid};
      }else{
        query = { $or: [ {"admin":profile.uuid}, { "uuid": profile.organization } ] }
      }
      // console.log("query :: %j",query);
      Organization.find(query,{"uuid":1,"name":1,"admin":1,"status":1,"description":1,"address":1,"internet":1,
    "email":1,"phone":1,"socialProfile":1,"logo.fileName":1,"logo.type":1,"logo.uri":1})
       .then(orgs => {
         var profileDTO ={};
         profileDTO.profile = profile;
         profileDTO.organizations = orgs;
         orgDTO.push(profileDTO);
         resolve(profileDTO); })
       .catch(err => {
         if (err.code === undefined) {
           reject({code: '500', reason: err});
         }
         reject(err);
       });
  });
};

exports.validateOrgAdmin = (profileUuid) => {
  return new Promise(
    (resolve, reject) => {
      Organization.find({"admin":profileUuid}).exec()
       .then(org => {
         if (!org || org === undefined) { throw(Errors.organizationCouldNotBeFound) };
         resolve(org);
       })
       .catch(err => {
         if (err.code === undefined) {
           reject({code: '500', reason: err});
         }
         reject(err);
       });
    });
}

exports.updateOrganizations = (profileUuid,orgDetails) => {
  "use strict";

  return new Promise(
    (resolve, reject) => {
      // Make record of change for journaling
      var lastModified = {
        timestamp: Utilities.getTimestamp(),
        by: profileUuid,
      };
      var address = {
        line1 : orgDetails.address.line1,
        line2 : orgDetails.address.line2,
        city : orgDetails.address.city,
        state : orgDetails.address.state,
        country : orgDetails.address.country,
        zip : orgDetails.address.zip,
        googleMapsUri : orgDetails.address.googleMapsUri
      };
      var phone = [];
      var phoneObj = {};
      phoneObj.name = orgDetails.phone[0].name;
      phoneObj.number = orgDetails.phone[0].number;
      phone.push(phoneObj);
      // Organization.lastModified.push(lastModified);
      console.log('lastModified:: %j',lastModified);

      var query = {"uuid": orgDetails.orgUuid};
      var update = {$set:{
        "lastModified": lastModified,
        "name": orgDetails.name,
        "status": orgDetails.status,
        "description": orgDetails.description,
        "address": address,
        "phone":phone
      }};

      var options = {new: true};
      var retrieveData = {"uuid":1,"name":1,"status":1,"address":1,"phone":1,"description":1,"lastModified":1};
      Organization.findOneAndUpdate(query, update, options).exec()
      .then(updatedOrganization => {
        return Organization.find(query,retrieveData);
      })
      .then(modifiedOrg => {
        resolve(modifiedOrg);
      })
      .catch(err => {
        console.log(err);
        if (err.code === undefined) { reject({code: '500', reason: err}); }
        reject(err);
      });
  });
};

exports.checkOrganizationExists = (orgName) => {
  "use strict";

  return new Promise(
    (resolve, reject) => {
      Organization.find({'name': orgName},{"uuid":1,"name":1}).exec()
      .then(org => {
        if(!org || org === undefined || org.length == 0) { resolve(true); }
        else { reject(Errors.duplicateOrganization);  }
        })
      .catch(err => {
        reject(err);
      });
  });
};

exports.checkUpdatedOrganizationExists = (orgName,orgUuid) => {
  "use strict";

  return new Promise(
    (resolve, reject) => {
      Organization.find({'uuid': orgUuid},{"uuid":1,"name":1}).exec()
      .then(org => {
        if(!org || org === undefined) { reject(Errors.organizationCouldNotBeFound); }
        if(org[0].name == orgName) { resolve(true); }
        else{
          Organization.find({'name': orgName},{"uuid":1,"name":1}).exec()
          .then(org1 => {
            if(!org1 || org1 === undefined || org1.length == 0) { resolve(true); }
            else { reject(Errors.duplicateOrganization);  }
            })
          .catch(err => {
            reject(err);
          });
        }

        })
      .catch(err => {
        reject(err);
      });
  });
};

exports.getOrgDetailsByUuid = (orgUuid) => {
  return new Promise(
    (resolve, reject) => {
      // console.log('orgUuid :: '+orgUuid);
      if(orgUuid === "" || orgUuid === undefined){ resolve({}); }

      var query = { "uuid": orgUuid };
      var retrieveData = {"uuid":1,"name":1,"admin":1,"status":1,"description":1,"address":1,"internet":1,
    "email":1,"phone":1,"socialProfile":1,"logo.fileName":1,"logo.type":1,"logo.uri":1};
      Organization.find(query,retrieveData).exec()
       .then(orgs => { resolve(orgs); })
       .catch(err => {
         if (err.code === undefined) {
           reject({code: '500', reason: err});
         }
         reject(err);
       });
  });
};
