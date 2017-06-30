var CreateAlert = require('../models/create-alert-model').CreateAlert;
var Errors = require('../security/errors');
const Utils = require('../models/utilities');

var _validateExists = (profileUuid,alert) => {
  return new Promise(
    (resolve, reject) => {
      if(!alert.title || alert.title === undefined) { throw (Errors.emptySearchCriteria); }
      if(!alert.email || alert.email === undefined) { throw (Errors.emptyEmail); }

      CreateAlert.findOne({"profile": profileUuid,"title":alert.title,"email":alert.email}).exec()
      .then(user => {
        if (!user || user === undefined || user === null ) { resolve({exists: false, status: "new" }); }
        else {
          reject(Errors.addedAlert);
        };

      })
      .catch(err => {
        if (err.code === undefined) { reject({code: '500', reason: err}); }
        reject(err);
      });
  });
};

exports.createAlert = (profileUuid,alert) => {
  return new Promise(
    (resolve, reject) => {
      _validateExists(profileUuid,alert)
      .then(validatedUser => {
        console.log('validatedUser :: %j',validatedUser);
        var created = {};
        created.timestamp = Utils.getTimestamp();
        created.by = profileUuid;
        var lastModified = {};
        lastModified.timestamp = Utils.getTimestamp();
        lastModified.by = profileUuid;

          var createalertToSave = new CreateAlert({
            uuid: Utils.getUuid(),
            created: created,
            lastModified: lastModified,
            status: "active",
            title: alert.title,
            email: alert.email,
            profile : profileUuid
          });

          createalertToSave.save()
          .then(createdAlert => {
            resolve(createdAlert); })
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


exports.listAlerts = (profileUuid) => {
  return new Promise(
    (resolve, reject) => {
      var favDTO = [];
      CreateAlert.find({"profile":profileUuid})
       .then(alerts => { resolve(alerts); })
       .catch(err => {
         if (err.code === undefined) {
           reject({code: '500', reason: err});
         }
         reject(err);
       });
  });
};
