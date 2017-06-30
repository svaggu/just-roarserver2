var uuid = require('uuid/v4');

exports.getUuid = () => { return uuid(); };

exports.getTimestamp = () => { return Date.now(); };

exports.isEmptyObj = (obj) => {
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) { return false; }
  }
  return true;
};
