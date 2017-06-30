var mongoose = require('mongoose');
var schema   = mongoose.Schema;

// This schema stores the information about which user applied for which job.
var searchCriteriaSchema = schema({
  uuid: {type: String, required: [true, 'uuid is required']},
  createdOn: {type: Date, required: true},
  lastModified: {type: Date, required: true},
  keyword: {type: String, required: [true, 'Keyword is required']},
  status: {type: String, required: [true, 'status is required']},
  profile: {type: String, ref: 'Profile'}
});

exports.SearchCriteria  = mongoose.model('SearchCriteria', searchCriteriaSchema);
