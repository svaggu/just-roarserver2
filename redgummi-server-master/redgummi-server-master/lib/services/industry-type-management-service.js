var IndustryType = require('../models/industry-type-model').IndustryType;

exports.getAllIndustryTypes = () => {
  return new Promise(
    (resolve, reject) => {
      IndustryType.find()
       .then(industrytypes => { resolve(industrytypes); })
       .catch(err => {
         if (err.code === undefined) { reject({code: '500', reason: err}); }
         reject(err);
       });
  });
};

exports.addIndustryType = (industrytype) => {
  return new Promise(
    (resolve, reject) => {
      var industryTypeToSave = new IndustryType(industrytype);
      industryTypeToSave.save()
      .then(savedIndustryType => {
        resolve(savedIndustryType); })
      .catch(err => {
      if (err.code === undefined) { reject({code: '500', reason: err}); }
        reject(err);
      });
  });
};

exports.getIndustryTypeByUuid = (itUuid) => {
  return new Promise(
    (resolve, reject) => {
      IndustryType.findOne({"uuid":itUuid}).exec()
       .then(industrytypes => {
         if(!industrytypes || industrytypes === undefined){ resolve(""); }
         else { resolve(industrytypes); }
         })
       .catch(err => {
         if (err.code === undefined) { reject({code: '500', reason: err}); }
         reject(err);
       });
  });
};
