var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var favSchema = new Schema({
  uuid: {type: String, required: [true, 'job uuid is required']},
  timestamp: {type: Date, required: [true, 'job creation timestamp is required']},
  lastModified: [{
    timestamp: {type: Date, required: [true, 'modified timestamp is required']}, // timestamp
    by: {type: String, ref: 'Profile'}, // profile uuid of modifier
  }],
  recruiter: {type: String, ref: 'Profile'}, // Profile uuid of recruiter
  jobseeker: {type: String, ref: 'Profile'}, // Profile uuid of jobseeker
  resume: {type: String, ref: 'Resume'}, // Profile uuid of jobseeker
  status: {type: String, required: [true, 'favourite status is required']}, // can be "favourite", "non-favourite"
});

exports.Favourite  = mongoose.model('Favourite', favSchema);
