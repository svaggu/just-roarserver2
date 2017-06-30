var Role = require('../models/role-model').Role;
var Profile = require('../models/profile-model').Profile;
var Errors = require('../security/errors');

exports.getAllRoles = () => {
  return new Promise(
    (resolve, reject) => {
      Role.find()
       .then(roles => { resolve(roles); })
       .catch(err => {
         if (err.code === undefined) {
           reject({code: '500', reason: err});
         }
         reject(err);
       });
  });
};

exports.getRole = (roleUuid) => {
  return new Promise(
    (resolve, reject) => {
      Role.findOne({'uuid': roleUuid}).exec()
      .then(role => {
        if (role === undefined || !role) { throw(Errors.invalidRoleUuid); }
        resolve(role);
      })
      .catch(err => {
        if (err.code === undefined) { reject({code: '500', reason: err}); }
        reject(err);
      });
  });
};

exports.getRoleByRoleName = (roleName) => {
  return new Promise(
    (resolve, reject) => {
      // console.log("rolename:: "+roleName);
      Role.findOne({'name': roleName}).exec()
      .then(role => {
        if (role === undefined || !role) {
          throw(Errors.invalidRoleUuid);
        }
        // console.log('role:: :: %j',role);
        resolve(role);
      })
      .catch(err => {
        if (err.code === undefined) {
          reject({code: '500', reason: err});
        }
        reject(err);
      });
  });
};

exports.getRoleByUsername = (username) => {
  return new Promise(
    (resolve, reject) => {
      Profile.findOne({'login.username': username}).exec()
      .then(user => {return Role.findOne({'uuid': user.role}).exec();})
      .then(role => {
        if (!role || role === undefined) {
          throw(Errors.invalidRoleUuid);
        }
        resolve(role);
      })
      .catch(err => {
        if (err.code === undefined) {
          reject({code: '500', reason: err});
        }
        reject(err);
      });
  });
};

exports.getRoleByProfile = (profileUuid) => {
  return new Promise(
    (resolve, reject) => {
      Profile.findOne({'uuid': profileUuid})
      .then(profile => {
        if (!profile || profile === undefined) {
          throw(Errors.invalidProfileUuid);
        }
        return Role.findOne({'uuid': profile.role}).exec();
      })
      .then(role => {
        if (role === undefined || !role) {
          throw(Errors.invalidRoleUuid);
        }
        resolve(role);
      })
      .catch(err => {
        if (err.code === undefined) {
          reject({code: '500', reason: err});
        }
        reject(err);
      });
  });
};

exports.addRole = (role) => {
  return new Promise(
    (resolve, reject) => {
      var roleToSave = new Role(role);
      roleToSave.save()
      .then(savedRole => { resolve(savedRole); })
      .catch(err => {
        if (err.code === undefined) {
          reject({code: '500', reason: err});
        }
        reject(err);
      });
  });
};

exports.getRoleByName = (roleName) => {
  return new Promise(
    (resolve, reject) => {
      Role.findOne({name: roleName})
     .then(role => { resolve(role); })
     .catch(err => {
       if (err.code === undefined) {
         reject({code: '500', reason: err});
       }
       reject(err);
     });
  });
};
