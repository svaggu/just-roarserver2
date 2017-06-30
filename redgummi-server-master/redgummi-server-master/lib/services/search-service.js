const SearchCriteria = require('../models/search-criteria-model').SearchCriteria;
const Errors = require('../security/errors');
const Utils = require('../models/utilities');

exports.addSearchKeyword = (profileUuid,keywords) => {
  return new Promise(
    (resolve, reject) => {


          var searchCriteriaToSave = new SearchCriteria({
            uuid: Utils.getUuid(),
            createdOn: Utils.getTimestamp(),
            lastModified: Utils.getTimestamp(),
            status: "active",
            keyword: keywords.keyword,
            profile : profileUuid
          });

          searchCriteriaToSave.save()
          .then(createdSearch => {
            resolve(createdSearch); })
          .catch(err => {
          if (err.code === undefined) { reject({code: '500', reason: err}); }
            reject(err);
          });

  });
};


exports.getSearchKeywords = (profileUuid) => {
  return new Promise(
    (resolve, reject) => {
      SearchCriteria.find({"profile":profileUuid,"status":"active"})
       .then(keywords => { resolve(keywords); })
       .catch(err => {
         if (err.code === undefined) {
           reject({code: '500', reason: err});
         }
         reject(err);
       });
  });
};

exports.deletesearchKeywords = (profileUuid) => {
  return new Promise(
    (resolve, reject) => {
        var query ={profile: profileUuid};
      var update = {$set:{"status":"inactive","lastModified":Utils.getTimestamp()}};
      SearchCriteria.updateMany(query, update, {upsert: true}).exec()
      .then(res=> {
        resolve({code:200,'Response':'Done'});
      })
      .catch(err => {
        if (err.code === undefined) { reject({code: '500', reason: err}); }
        reject(err);
      });
  });
};
